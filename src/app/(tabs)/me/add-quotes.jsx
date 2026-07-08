import { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    RefreshControl,
    ImageBackground,
    Modal,
    Dimensions,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, X, Plus } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import { getQuoteImageUrl } from "@/utils/quotes";
import QuoteCard from "@/components/QuoteCard";
import { BlurView } from "expo-blur";

const { height, width } = Dimensions.get("window");

export default function AddQuotesScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [userQuotes, setUserQuotes] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Add Quote Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newQuoteText, setNewQuoteText] = useState("");
    const [newQuoteAuthor, setNewQuoteAuthor] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Viewer state
    const [viewerVisible, setViewerVisible] = useState(false);
    const [initialIndex, setInitialIndex] = useState(0);

    // Load user's own quotes from Supabase
    const loadUserQuotes = useCallback(async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
                setUserQuotes([]);
                setUser(null);
                setLoading(false);
                return;
            }
            setUser(currentUser);

            const { data: quotesData, error: quotesError } = await supabase
                .from('quotes')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (quotesError) throw quotesError;
            setUserQuotes(quotesData || []);

        } catch (error) {
            console.error("Error loading user quotes:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadUserQuotes();
        }, [loadUserQuotes])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadUserQuotes();
        setRefreshing(false);
    }, [loadUserQuotes]);

    const handleAddQuote = async () => {
        if (!newQuoteText.trim()) {
            Alert.alert("Error", "Quote text cannot be empty.");
            return;
        }

        setSubmitting(true);
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) throw new Error("No user found");

            const { error } = await supabase.from('quotes').insert([
                {
                    body_text: newQuoteText.trim(),
                    author: newQuoteAuthor.trim() || "Unknown",
                    user_id: currentUser.id,
                    is_predefined_background: false,
                    // Optionally pick a random background or let it be handled by getQuoteImageUrl
                }
            ]);

            if (error) throw error;

            setModalVisible(false);
            setNewQuoteText("");
            setNewQuoteAuthor("");
            loadUserQuotes();
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const openViewer = (index) => {
        setInitialIndex(index);
        setViewerVisible(true);
    };

    const renderQuote = ({ item, index }) => {
        return (
            <Pressable
                onPress={() => openViewer(index)}
                style={{
                    width: "48.5%",
                    aspectRatio: 0.65,
                    marginBottom: 12,
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: '#1E1E1E',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)'
                }}
            >
                <ImageBackground
                    source={{ uri: getQuoteImageUrl(item) }}
                    style={{
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    resizeMode="cover"
                >
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" }} />
                    <View style={{ padding: 12, alignItems: "center" }}>
                        <Text style={{ fontSize: 13, color: "#ffffff", fontWeight: "600", textAlign: "center", lineHeight: 18 }} numberOfLines={5}>
                            {item.body_text}
                        </Text>
                        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 6, fontStyle: "italic" }} numberOfLines={1}>
                            - {item.author || "Unknown"}
                        </Text>
                    </View>
                </ImageBackground>
            </Pressable>
        );
    };

    const renderViewerItem = useCallback(({ item }) => {
        const resolvedBg = getQuoteImageUrl(item);
        return <QuoteCard quote={item} user={user} randomBackgroundUrl={resolvedBg} />;
    }, [user]);

    const EmptyState = () => (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, marginTop: 100 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
                <Plus size={32} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: "600", color: "#ffffff", textAlign: "center", marginBottom: 12 }}>Create Your First Quote</Text>
            <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 22 }}>Your personal creations will appear here for you to focus on.</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
                        <ChevronLeft color="#ffffff" size={28} />
                    </Pressable>
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "600", color: "#ffffff" }}>Add Quotes</Text>
                        {!loading && (
                            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                                {userQuotes.length} {userQuotes.length === 1 ? "quote" : "quotes"} created
                            </Text>
                        )}
                    </View>
                </View>

                <Pressable 
                    onPress={() => setModalVisible(true)}
                    style={({ pressed }) => ({
                        width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
                        opacity: pressed ? 0.7 : 1
                    })}
                >
                    <Plus color="#ffffff" size={24} />
                </Pressable>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            ) : (
                <FlatList
                    data={userQuotes}
                    renderItem={renderQuote}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 16 }}
                    contentContainerStyle={{ paddingTop: 8, paddingBottom: insets.bottom + 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={EmptyState}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
                />
            )}

            {/* Creation Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <BlurView intensity={100} tint="dark" style={{ flex: 1 }}>
                    <View style={{ flex: 1, paddingTop: insets.top + 20, paddingHorizontal: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                            <Text style={{ fontSize: 28, fontWeight: '500', color: '#fff' }}>New Quote</Text>
                            <Pressable onPress={() => setModalVisible(false)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                                <X color="#fff" size={20} />
                            </Pressable>
                        </View>

                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 1 }}>QUOTE TEXT</Text>
                        <TextInput
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, color: '#fff', fontSize: 18, minHeight: 120, textAlignVertical: 'top', marginBottom: 24 }}
                            placeholder="Type your focus here..."
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            multiline
                            value={newQuoteText}
                            onChangeText={setNewQuoteText}
                            autoFocus
                        />

                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 1 }}>AUTHOR (OPTIONAL)</Text>
                        <TextInput
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, color: '#fff', fontSize: 16, marginBottom: 40 }}
                            placeholder="Who said this?"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={newQuoteAuthor}
                            onChangeText={setNewQuoteAuthor}
                        />

                        <Pressable 
                            onPress={handleAddQuote}
                            disabled={submitting}
                            style={({ pressed }) => ({
                                backgroundColor: '#444', paddingVertical: 18, borderRadius: 32, alignItems: 'center',
                                opacity: (pressed || submitting) ? 0.8 : 1,
                            })}
                        >
                            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>Create Quote</Text>}
                        </Pressable>
                    </View>
                </BlurView>
            </Modal>

            {/* Viewer Modal */}
            <Modal visible={viewerVisible} animationType="fade" transparent>
                <View style={{ flex: 1, backgroundColor: "#000" }}>
                    <FlatList
                        data={userQuotes}
                        renderItem={renderViewerItem}
                        keyExtractor={(item) => `viewer-${item.id}`}
                        pagingEnabled
                        showsVerticalScrollIndicator={false}
                        snapToInterval={height}
                        snapToAlignment="start"
                        decelerationRate="fast"
                        initialScrollIndex={initialIndex}
                        getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
                    />
                    <Pressable
                        onPress={() => setViewerVisible(false)}
                        style={{ position: "absolute", top: insets.top + 16, left: 16, zIndex: 100, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
                    >
                        <X color="white" size={24} />
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
}
