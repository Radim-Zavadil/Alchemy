import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { uploadOnboardingImages } from '@/utils/onboardingUpload';

export default function PasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const store = useOnboardingStore();
    const { email, name, setPassword } = store;
    const [localPassword, setLocalPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (localPassword.length >= 6) {
            setLoading(true);
            try {
                setPassword(localPassword);

                // Sign Up Logic
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: localPassword,
                    options: {
                        data: {
                            full_name: name,
                        }
                    }
                });

                if (error) {
                    Alert.alert("Error signing up", error.message);
                } else if (data.user) {
                    // Save onboarding metadata
                    await supabase.auth.updateUser({
                        data: { 
                            full_name: name,
                            why_installed: store.reason,
                            description: store.description,
                            daily_thoughts: store.dailyThoughts,
                            future_worries: store.futureWorries,
                            admired_text: store.admiredText
                        }
                    });

                    // Upload images to storage
                    await uploadOnboardingImages(data.user.id, store);

                    // Success -> Go to Main App
                    router.replace('/(tabs)');
                }
            } catch (e) {
                console.error(e);
                Alert.alert("Error", "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert("Password too short", "Please enter at least 6 characters.");
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />

            {/* Header with back button */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Pressable
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color="#ffffff" />
                </Pressable>
            </View>

            {/* Main content */}
            <View style={styles.content}>
                {/* Title */}
                <Text style={styles.label}>ONBOARDING</Text>

                <Text style={styles.title}>Create a password</Text>

                {/* Password input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#545454"
                        value={localPassword}
                        onChangeText={setLocalPassword}
                        secureTextEntry
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={handleNext}
                    />
                </View>
            </View>

            {/* Continue button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                <Pressable
                    onPress={handleNext}
                    disabled={localPassword.length < 6 || loading}
                    style={[
                        styles.continueButton,
                        { opacity: (localPassword.length >= 6 && !loading) ? 1 : 0.6 }
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.continueButtonText}>Continue</Text>
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: '#545454',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    title: {
        fontSize: 32,
        fontWeight: '400',
        color: '#ffffff',
        marginBottom: 40,
        fontFamily: 'Inter',
    },
    inputContainer: {
        marginBottom: 40,
    },
    input: {
        backgroundColor: '#111111',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#ffffff',
        fontFamily: 'Inter',
    },
    footer: {
        paddingHorizontal: 24,
    },
    continueButton: {
        backgroundColor: '#2F2F2F',
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        fontFamily: 'Inter',
    },
});