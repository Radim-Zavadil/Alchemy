import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Send, CheckCircle2 } from "lucide-react-native";
import { supabase } from "@/utils/supabase";

export default function InquiriesScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("full_name, email")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;
                setProfile({ ...data, id: user.id });
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        setSending(true);
        try {
            const { error } = await supabase.from("inquiries").insert({
                user_id: profile.id,
                full_name: profile.full_name,
                email: profile.email,
                message: message.trim(),
            });

            if (error) throw error;

            setShowModal(true);
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center" }]}>
                <ActivityIndicator color="#ffffff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft color="#ffffff" size={28} />
                </Pressable>
                <Text style={styles.headerTitle}>Inquiries</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.greeting}>
                            Hello, {profile?.full_name || "there"}
                        </Text>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type your message here..."
                                placeholderTextColor="#8E8E93"
                                multiline
                                numberOfLines={1}
                                value={message}
                                onChangeText={setMessage}
                                textAlignVertical="top"
                            />
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.sendButton,
                                (!message.trim() || sending) && styles.sendButtonDisabled,
                                pressed && styles.sendButtonActive
                            ]}
                            onPress={handleSendMessage}
                            disabled={!message.trim() || sending}
                        >
                            {sending ? (
                                <ActivityIndicator color="#000000" />
                            ) : (
                                <>
                                    <Text style={styles.sendButtonText}>Send Message</Text>
                                </>
                            )}
                        </Pressable>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.successIconWrapper}>
                            <CheckCircle2 size={60} color="#34C759" />
                        </View>
                        <Text style={styles.modalTitle}>Message Sent!</Text>
                        <Text style={styles.modalText}>
                            Your request was successfully sent. Your inquiry will be answered within 3 days.
                        </Text>
                        <Pressable
                            style={styles.modalButton}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: "#1C1C1E",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#ffffff",
        flex: 1,
        textAlign: "center",
        marginRight: 40, // To center the title relative to back button
    },
    content: {
        padding: 24,
    },
    greeting: {
        fontSize: 32,
        fontWeight: "500",
        color: "#ffffff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#8E8E93",
        marginBottom: 32,
        lineHeight: 22,
    },
    inputWrapper: {
        paddingTop: 16,
        borderRadius: 20,
        marginBottom: 430,
        minHeight: 11,
    },
    input: {
        fontSize: 16,
        color: "#ffffff",
        flex: 1,
    },
    sendButton: {
        backgroundColor: "#ffffff",
        height: 58,
        borderRadius: 29, // Really high border radius
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#ffffff",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    sendButtonActive: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    sendButtonDisabled: {
        backgroundColor: "#2C2C2E",
        shadowOpacity: 0,
    },
    sendButtonText: {
        color: "#000000",
        fontSize: 17,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modalContent: {
        backgroundColor: "#1C1C1E",
        borderRadius: 32,
        padding: 32,
        width: "100%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#2C2C2E",
    },
    successIconWrapper: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 12,
    },
    modalText: {
        fontSize: 16,
        color: "#8E8E93",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    modalButton: {
        backgroundColor: "#ffffff",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 25,
        width: "100%",
        alignItems: "center",
    },
    modalButtonText: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "600",
    },
});
