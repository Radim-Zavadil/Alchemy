import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View, Dimensions, Text, ActivityIndicator,
  StyleSheet, Image, Animated, Pressable,
  Modal, ScrollView, TouchableOpacity, PanResponder, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Map } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MaskedView from "@react-native-masked-view/masked-view";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get('window');
const SETTINGS_KEY = 'home_settings_v3';
const REVIEWS_KEY = 'alchemy_reviews';
const DREAM_KEY = 'alchemy_user_dream';

const FONTS = [
  { id: 'system', name: 'System', family: Platform.OS === 'ios' ? 'System' : 'sans-serif', preview: 'Focus on your vision' },
  { id: 'serif', name: 'Serif', family: Platform.OS === 'ios' ? 'Georgia' : 'serif', preview: 'The journey is the reward' },
  { id: 'mono', name: 'Mono', family: Platform.OS === 'ios' ? 'Courier' : 'monospace', preview: 'Consistency is key' },
];
const DEFAULT_COLORS = ['#FFFFFF', '#00FA9A', '#0A1BFF', '#FFD700', '#FF6347'];

function WaveEdge({ side }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.15, { duration: 7000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const config = {
    top: {
      style: { top: -80, left: -50, right: -50, height: 180 },
      colors: ["rgba(0,0,0,1)", "rgba(0,0,0,0.9)", "transparent"],
      start: { x: 0, y: 0 }, end: { x: 0, y: 1 }
    },
    bottom: {
      style: { bottom: -80, left: -50, right: -50, height: 180 },
      colors: ["transparent", "rgba(0,0,0,0.9)", "rgba(0,0,0,1)"],
      start: { x: 0, y: 0 }, end: { x: 0, y: 1 }
    },
    left: {
      style: { left: -80, top: -50, bottom: -50, width: 180 },
      colors: ["rgba(0,0,0,1)", "rgba(0,0,0,0.9)", "transparent"],
      start: { x: 0, y: 0 }, end: { x: 1, y: 0 }
    },
    right: {
      style: { right: -80, top: -50, bottom: -50, width: 180 },
      colors: ["transparent", "rgba(0,0,0,0.9)", "rgba(0,0,0,1)"],
      start: { x: 0, y: 0 }, end: { x: 1, y: 0 }
    }
  }[side];

  return (
    <Reanimated.View style={[{ position: "absolute", zIndex: 20 }, config.style, animatedStyle]}>
      <MaskedView style={StyleSheet.absoluteFill} maskElement={
        <LinearGradient colors={config.colors} start={config.start} end={config.end} style={StyleSheet.absoluteFill} />
      }>
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
      </MaskedView>
    </Reanimated.View>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [userImages, setUserImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dream, setDream] = useState('');
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({
    quoteFont: 'system', quoteColor: '#FFFFFF', customColors: [...DEFAULT_COLORS],
  });
  const [activeModal, setActiveModal] = useState(null);
  const [curImgIdx, setCurImgIdx] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then(v => { if (v) setSettings(JSON.parse(v)); });
  }, []);

  const updateSettings = (nv) => {
    const u = { ...settings, ...nv };
    setSettings(u);
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(u));
  };

  const loadData = useCallback(async () => {
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        const { data: files } = await supabase.storage.from('user-images').list(u.id, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
        if (files?.length) {
          setUserImages(files.filter(f => f.name && f.name !== '.emptyFolderPlaceholder' && !f.name.startsWith('.')).map(f => {
            const { data: ud } = supabase.storage.from('user-images').getPublicUrl(`${u.id}/${f.name}`);
            return { id: f.id || f.name, url: ud.publicUrl };
          }));
        } else setUserImages([]);
      }
      const sd = await AsyncStorage.getItem(DREAM_KEY); if (sd) setDream(sd);
      const sr = await AsyncStorage.getItem(REVIEWS_KEY); if (sr) setReviews(JSON.parse(sr));
    } catch (e) { console.log('Home load error:', e); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // 1. Gather all unique text quotes into an array
  const allMessages = useMemo(() => {
    if (!dream && reviews.length === 0) {
      return ["Open the Review tab, describe your dream, and write your first weekly log — the portal will begin to see."];
    }
    
    const msgs = [];
    if (dream) {
      msgs.push(`Your dream is to "${dream}". Every action today is building that reality.`);
      msgs.push(`You declared: "${dream}". Let today's focus be worthy of that future.`);
    }
    if (reviews.length > 0) {
      const a = reviews[reviews.length - 1].answers || {};
      if (a.health?.trim().length > 3) msgs.push(`Your health: "${a.health.toLowerCase()}". A strong body is the foundation of everything.`);
      if (a.habits?.trim().length > 3) msgs.push(`On habits you wrote: "${a.habits.toLowerCase()}". Small daily cycles build massive futures.`);
      if (a.relationships?.trim().length > 3) msgs.push(`Connections: "${a.relationships.toLowerCase()}". The future self is never built in isolation.`);
      if (a.financial?.trim().length > 3) msgs.push(`Finances: "${a.financial.toLowerCase()}". Abundance starts with intentional choices today.`);
    }
    msgs.push("Your future self is crafted by today's training — not tomorrow's intentions.");
    msgs.push("The mirror shows who you are choosing to become. Keep choosing wisely.");
    msgs.push("Every week you log is a step the portal can see further into your future.");
    return msgs;
  }, [dream, reviews]);

  // Fade animations for text & images syncing together
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const swipeLock = useRef(false);

  const changeSlide = useCallback((dir) => {
    if (swipeLock.current) return;
    swipeLock.current = true;

    // Fade out both text and image together
    Animated.timing(contentOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setCurImgIdx(p => {
        // Find the maximum limit based on images or quotes to prevent stale states
        const maxLimit = userImages.length > 0 ? userImages.length : allMessages.length;
        return (p + dir + maxLimit) % maxLimit;
      });

      // Fade back in with the new contents loaded
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start(() => {
        swipeLock.current = false;
      });
    });
  }, [userImages.length, allMessages.length]);

  const swipeResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (e, gs) => Math.abs(gs.dy) > 10,
    // Evaluate gesture ONLY when the drag finishes to avoid multi-firing
    onPanResponderRelease: (e, gs) => {
      if (gs.dy < -60) {
        changeSlide(1); // Swiped UP (Scroll down)
      } else if (gs.dy > 60) {
        changeSlide(-1); // Swiped DOWN (Scroll up)
      }
    },
  })).current;

  // Deriving active image and active text safely based on current index counter
  const activeImageUrl = userImages.length > 0 ? userImages[curImgIdx % userImages.length]?.url : null;
  const currentQuote = allMessages[curImgIdx % allMessages.length] || '';
  const fontObj = FONTS.find(f => f.id === settings.quoteFont) || FONTS[0];

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e) => { const p = Math.max(0, Math.min(1, e.nativeEvent.locationX / (width - 40))); updateSettings({ quoteColor: `hsl(${p * 360},100%,50%)` }); },
    onPanResponderRelease: (e) => { const p = Math.max(0, Math.min(1, e.nativeEvent.locationX / (width - 40))); updateSettings({ quoteColor: `hsl(${p * 360},100%,50%)` }); },
  })).current;

  return (
    <View style={{ flex: 1, backgroundColor: '#020206' }} {...swipeResponder.panHandlers}>
      <StatusBar style="light" />

      {/* Full-screen background: image or deep space */}
      {activeImageUrl ? (
        <Animated.Image
          source={{ uri: activeImageUrl }}
          style={[StyleSheet.absoluteFillObject, { opacity: contentOpacity }]}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={['#020410', '#06102a', '#020208', '#03010e']}
          start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Dark vignette tint */}
      <LinearGradient
        colors={['rgba(2,2,10,0.35)', 'rgba(2,2,10,0.15)', 'rgba(2,2,10,0.35)']}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <WaveEdge side="top" />
      <WaveEdge side="bottom" />
      <WaveEdge side="left" />
      <WaveEdge side="right" />

      {/* HEADER */}
      <View style={{ position: 'absolute', top: insets.top + 16, left: 0, right: 0, zIndex: 50, height: 44, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
        <BlurView intensity={45} tint="dark" style={{ borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
          <Pressable onPress={() => router.push('/(tabs)/board')} style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Map size={18} color="#ffffff" />
          </Pressable>
        </BlurView>
        <View style={{ flex: 1 }} />
        <BlurView intensity={45} tint="dark" style={{ borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', height: 44, paddingHorizontal: 12, gap: 14 }}>
            <Pressable onPress={() => setActiveModal('color')} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: settings.quoteColor, borderWidth: 1.5, borderColor: '#fff' }} />
            <Pressable onPress={() => setActiveModal('font')} style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Aa</Text>
            </Pressable>
          </View>
        </BlurView>
      </View>

      {/* CENTERED QUOTE (Animated Opacity closely linked to image) */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0, bottom: 0, left: 30, right: 30,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 30,
          opacity: contentOpacity,
        }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : (
          <Text style={[styles.quoteText, { color: settings.quoteColor, fontFamily: fontObj.family }]}>
            {currentQuote}
          </Text>
        )}
      </Animated.View>

      {/* FONT MODAL */}
      <Modal visible={activeModal === 'font'} transparent animationType="slide">
        <Pressable style={{ flex: 1, justifyContent: 'flex-end' }} onPress={() => setActiveModal(null)}>
          <Pressable style={{ width: '100%' }}>
            <BlurView intensity={70} tint="dark" style={styles.sheet}>
              <View style={styles.sheetHead}><View style={styles.sheetHandle} /><Text style={styles.sheetTitle}>PORTAL FONT</Text></View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {FONTS.map(f => (
                  <TouchableOpacity key={f.id} onPress={() => { updateSettings({ quoteFont: f.id }); setActiveModal(null); }} style={[styles.fontCard, settings.quoteFont === f.id && { borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <Text style={{ color: '#fff', fontSize: 13, fontFamily: f.family, textAlign: 'center' }}>{f.preview}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 8 }}>{f.name.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* COLOR MODAL */}
      <Modal visible={activeModal === 'color'} transparent animationType="slide">
        <Pressable style={{ flex: 1, justifyContent: 'flex-end' }} onPress={() => setActiveModal(null)}>
          <Pressable style={{ width: '100%' }}>
            <BlurView intensity={70} tint="dark" style={styles.sheet}>
              <View style={styles.sheetHead}><View style={styles.sheetHandle} /><Text style={styles.sheetTitle}>TEXT COLOR</Text></View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
                {settings.customColors.map((c, i) => (
                  <TouchableOpacity key={i} onPress={() => updateSettings({ quoteColor: c })} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c, borderWidth: settings.quoteColor === c ? 2.5 : 0, borderColor: '#fff' }} />
                ))}
              </ScrollView>
              <View style={{ position: 'relative', marginTop: 10 }} {...panResponder.panHandlers}>
                <LinearGradient colors={['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 30, borderRadius: 15, width: '100%' }} />
              </View>
            </BlurView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  quoteText: {
    fontSize: 22,
    lineHeight: 34,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 16,
    letterSpacing: 0.2,
  },
  sheet: { borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 20, paddingBottom: 48, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  sheetHead: { alignItems: 'center', paddingVertical: 16 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 20 },
  sheetTitle: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  fontCard: { flex: 1, height: 90, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
});