import { useState, useCallback, useRef, memo, useMemo } from "react";
import { View, Text, Pressable, Dimensions, ActivityIndicator, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, Play } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/utils/supabase";
import * as ImagePicker from 'expo-image-picker';

const BOARD_W = 3000;
const BOARD_H = 3000;
const { width: SW, height: SH } = Dimensions.get("window");
const POSITIONS_KEY = 'board_image_positions_v2';

// ─── Draggable image ─────────────────────────────────────────────────────────
const DraggableImage = memo(({ image, onUpdate, onFocus, onDelete }) => {
    const tx = useSharedValue(image.x);
    const ty = useSharedValue(image.y);
    const sc = useSharedValue(image.scale || 1);
    const ro = useSharedValue(image.rotation || 0);

    const stx = useSharedValue(image.x);
    const sty = useSharedValue(image.y);
    const ssc = useSharedValue(image.scale || 1);
    const sro = useSharedValue(image.rotation || 0);

    const imageRef = useRef(image);
    imageRef.current = image;

    const pan = useMemo(() => Gesture.Pan()
        .onStart(() => runOnJS(onFocus)())
        .onUpdate(e => {
            tx.value = stx.value + e.translationX;
            ty.value = sty.value + e.translationY;
        })
        .onEnd(() => {
            stx.value = tx.value;
            sty.value = ty.value;
            runOnJS(onUpdate)({
                ...imageRef.current,
                x: tx.value,
                y: ty.value,
                scale: sc.value,
                rotation: ro.value,
            });
        }), [onFocus, onUpdate]);

    const pinch = useMemo(() => Gesture.Pinch()
        .onUpdate(e => {
            sc.value = Math.max(0.1, Math.min(5, ssc.value * e.scale));
        })
        .onEnd(() => {
            ssc.value = sc.value;
            runOnJS(onUpdate)({
                ...imageRef.current,
                x: tx.value,
                y: ty.value,
                scale: sc.value,
                rotation: ro.value,
            });
        }), [onUpdate]);

    const rotate = useMemo(() => Gesture.Rotation()
        .onUpdate(e => {
            ro.value = sro.value + e.rotation;
        })
        .onEnd(() => {
            sro.value = ro.value;
            runOnJS(onUpdate)({
                ...imageRef.current,
                x: tx.value,
                y: ty.value,
                scale: sc.value,
                rotation: ro.value,
            });
        }), [onUpdate]);

    const lp = useMemo(() => Gesture.LongPress()
        .minDuration(600)
        .onStart(() => runOnJS(onDelete)()), [onDelete]);

    const composed = useMemo(() => Gesture.Simultaneous(pan, pinch, rotate, lp), [pan, pinch, rotate, lp]);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateX: tx.value },
            { translateY: ty.value },
            { scale: sc.value },
            { rotate: `${ro.value}rad` },
        ],
        zIndex: image.zIndex,
    }));

    return (
        <GestureDetector gesture={composed}>
            <Animated.View style={[{ 
                position: 'absolute', 
                width: 200, 
                height: 200, 
                borderRadius: 3, 
                overflow: 'hidden',
                backgroundColor: '#DDD', 
                shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 12 
            }, style]}>
                <Animated.Image
                    source={{ uri: image.url }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
            </Animated.View>
        </GestureDetector>
    );
});

const decodeB64 = (b) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let s = b.replace(/[\t\n\r ]+/g, ''), o = new Uint8Array(((s.length * 3) / 4) | 0), bc = 0, bs, buf, i = 0, j = 0;
    while (buf = s.charAt(i++)) { buf = chars.indexOf(buf); if (~buf) { bs = bc % 4 ? bs * 64 + buf : buf; if (bc++ % 4) o[j++] = 255 & (bs >> ((-2 * bc) & 6)); } }
    return o;
};

export default function BoardScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);
    const [maxZ, setMaxZ] = useState(1);
    
    // Positions cache to avoid heavy AsyncStorage reads during updates
    const positionsRef = useRef({});

    const bScale = useSharedValue(1);
    const bTx = useSharedValue(-BOARD_W / 2 + SW / 2);
    const bTy = useSharedValue(-BOARD_H / 2 + SH / 2);
    const sbScale = useSharedValue(1);
    const sbTx = useSharedValue(-BOARD_W / 2 + SW / 2);
    const sbTy = useSharedValue(-BOARD_H / 2 + SH / 2);

    const boardPan = useMemo(() => Gesture.Pan()
        .onUpdate(e => { bTx.value = sbTx.value + e.translationX; bTy.value = sbTy.value + e.translationY; })
        .onEnd(() => { sbTx.value = bTx.value; sbTy.value = bTy.value; }), []);

    const boardPinch = useMemo(() => Gesture.Pinch()
        .onUpdate(e => { bScale.value = Math.max(0.1, Math.min(3, sbScale.value * e.scale)); })
        .onEnd(() => { sbScale.value = bScale.value; }), []);

    const boardGestures = useMemo(() => Gesture.Simultaneous(boardPan, boardPinch), [boardPan, boardPinch]);

    const boardStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: bTx.value }, { translateY: bTy.value }, { scale: bScale.value }],
    }));

    const loadImages = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user: u } } = await supabase.auth.getUser();
            if (!u) { setImages([]); return; }
            setUser(u);

            const { data: files } = await supabase.storage.from('user-images')
                .list(u.id, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

            const saved = await AsyncStorage.getItem(POSITIONS_KEY);
            const positions = saved ? JSON.parse(saved) : {};
            positionsRef.current = positions;

            if (!files?.length) { setImages([]); return; }

            const valid = files.filter(f => f.name && f.name !== '.emptyFolderPlaceholder' && !f.name.startsWith('.'));
            let newMaxZ = 1;
            const imgs = valid.map((f, idx) => {
                const { data: d } = supabase.storage.from('user-images').getPublicUrl(`${u.id}/${f.name}`);
                const pos = positions[f.name] || {
                    x: BOARD_W / 2 - 100 + (idx % 4 - 2) * 220,
                    y: BOARD_H / 2 - 100 + Math.floor(idx / 4) * 240,
                    scale: 1, rotation: (Math.random() - 0.5) * 0.15,
                    zIndex: idx + 1,
                };
                if (pos.zIndex > newMaxZ) newMaxZ = pos.zIndex;
                return { id: f.name, name: f.name, url: d.publicUrl, ...pos };
            });
            setMaxZ(newMaxZ);
            setImages(imgs);
        } catch (e) { console.error(e); setImages([]); }
        finally { setLoading(false); }
    }, []);

    useFocusEffect(useCallback(() => { loadImages(); }, [loadImages]));

    const updateImage = useCallback((img) => {
        // Sync state
        setImages(prev => prev.map(i => i.id === img.id ? img : i));
        
        // Update local ref
        positionsRef.current[img.name] = { 
            x: img.x, 
            y: img.y, 
            scale: img.scale, 
            rotation: img.rotation, 
            zIndex: img.zIndex 
        };
        
        // Save to storage
        AsyncStorage.setItem(POSITIONS_KEY, JSON.stringify(positionsRef.current)).catch(console.error);
    }, []);

    const bringToFront = useCallback((id) => {
        setImages(prev => {
            const currentImg = prev.find(i => i.id === id);
            if (!currentImg) return prev;
            
            // Only update if not already highest
            const highestZ = Math.max(...prev.map(i => i.zIndex || 0));
            if (currentImg.zIndex >= highestZ && prev.length > 1) return prev;

            const newZ = highestZ + 1;
            setMaxZ(newZ);
            
            const updated = prev.map(i => i.id === id ? { ...i, zIndex: newZ } : i);
            
            // Update local ref
            positionsRef.current[currentImg.name] = { 
                ...positionsRef.current[currentImg.name],
                zIndex: newZ 
            };
            AsyncStorage.setItem(POSITIONS_KEY, JSON.stringify(positionsRef.current)).catch(console.error);
            
            return updated;
        });
    }, []);

    const confirmDelete = useCallback((id) => {
        Alert.alert('Remove Image', 'Remove this from the board?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive',
                onPress: () => setImages(prev => prev.filter(i => i.id !== id)),
            },
        ]);
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert("Permission Denied"); return; }
        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, base64: true });
        if (!res.canceled && res.assets?.length && user) {
            setUploading(true);
            try {
                const a = res.assets[0];
                const name = `${Date.now()}.jpg`;
                const path = `${user.id}/${name}`;
                const bytes = a.base64 ? decodeB64(a.base64) : await (await fetch(a.uri)).arrayBuffer();
                const { error } = await supabase.storage.from('user-images').upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
                if (error) throw error;
                await loadImages();
            } catch (e) { Alert.alert("Error", e.message); }
            finally { setUploading(false); }
        }
    };

    const HEADER_HEIGHT = insets.top + 52;

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#EAECEE' }}>
            <StatusBar style="light" />

            <View style={{ flex: 1, overflow: 'hidden' }}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#ffffff" />
                    </View>
                ) : (
                    <Animated.View style={[{ width: BOARD_W, height: BOARD_H, backgroundColor: '#EAECEE' }, boardStyle]}>
                        <GestureDetector gesture={boardGestures}>
                            <View style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }} />
                        </GestureDetector>
                        {images.map(img => (
                            <DraggableImage
                                key={img.id}
                                image={img}
                                onUpdate={updateImage}
                                onFocus={() => bringToFront(img.id)}
                                onDelete={() => confirmDelete(img.id)}
                            />
                        ))}
                    </Animated.View>
                )}
            </View>

            {/* ── Sticky Header ── */}
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, overflow: 'hidden' }}>
                <BlurView intensity={70} tint="dark">
                    <View style={{ 
                        height: HEADER_HEIGHT, 
                        justifyContent: 'flex-end', 
                        paddingBottom: 12,
                        backgroundColor: 'rgba(255,255,255,0.08)'
                    }}>
                        <Text style={{ fontSize: 17, fontWeight: "600", color: "#ffffff", textAlign: 'center' }}>Board</Text>
                    </View>
                </BlurView>
            </View>

            <View style={{ position: 'absolute', top: HEADER_HEIGHT + 16, right: 18, zIndex: 30, gap: 10 }}>
                <View style={{ borderRadius: 24, overflow: 'hidden' }}>
                    <BlurView intensity={70} tint="dark">
                        <Pressable onPress={() => router.replace('/')} style={({ pressed }) => ({
                            width: 48, height: 48, justifyContent: 'center', alignItems: 'center',
                            backgroundColor: pressed ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
                        })}>
                            <Play color="#ffffff" size={18} fill="#ffffff" />
                        </Pressable>
                    </BlurView>
                </View>
                <View style={{ borderRadius: 24, overflow: 'hidden' }}>
                    <BlurView intensity={70} tint="dark">
                        <Pressable onPress={pickImage} disabled={uploading} style={({ pressed }) => ({
                            width: 48, height: 48, justifyContent: 'center', alignItems: 'center',
                            backgroundColor: pressed ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)',
                        })}>
                            {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Plus color="#ffffff" size={22} />}
                        </Pressable>
                    </BlurView>
                </View>
            </View>
        </GestureHandlerRootView>
    );
}