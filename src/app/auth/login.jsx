import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/utils/auth/useAuth";

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setAuth } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) throw error;

            // Store auth token / user
            if (data.session) {
                setAuth({
                    user: data.user,
                    // jwt: data.session.access_token // Optional if store needs it, but usage seems to imply just auth object or parts
                });
                router.replace("/(tabs)");
            }
        } catch (error) {
            Alert.alert("Login Failed", error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header with back button */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Pressable
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ChevronLeft size={28} color="#ffffff" />
                </Pressable>
            </View>

            {/* Scrollable content area */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title */}
                    <Text style={styles.preHeader}>LOG IN</Text>
                    <Text style={styles.headerTitle}>What is your credentials?</Text>

                    {/* Email input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            placeholderTextColor="#545454"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.input}
                        />
                    </View>

                    {/* Password input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            placeholderTextColor="#545454"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.input}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Continue button - Fixed at bottom */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                <Pressable
                    onPress={handleLogin}
                    disabled={loading}
                    style={[styles.loginButton, loading && styles.disabledButton]}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.loginButtonText}>Continue</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        flexGrow: 1,
    },
    preHeader: {
        fontSize: 12,
        fontWeight: "500",
        color: "#545454",
        textTransform: "uppercase",
        letterSpacing: 2,
        marginBottom: 8,
        fontFamily: "Inter",
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "400", // Light/Regular for Inter usually looks good
        color: "#ffffff",
        marginBottom: 40,
        fontFamily: "Inter",
    },
    inputContainer: {
        marginBottom: 24,
    },
    input: {
        backgroundColor: "#111111",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: "#ffffff",
        fontFamily: "Inter",
    },
    footer: {
        paddingHorizontal: 24,
        backgroundColor: "#000000",
    },
    loginButton: {
        backgroundColor: "#2F2F2F", // Dark grey button
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.6,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        fontFamily: "Inter",
    },
});
