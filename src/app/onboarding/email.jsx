import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EmailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { email, setEmail } = useOnboardingStore();
    const [localEmail, setLocalEmail] = useState(email);

    const handleNext = () => {
        if (localEmail.trim().length > 0 && localEmail.includes('@')) {
            setEmail(localEmail);
            router.push('/onboarding/password');
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

                <Text style={styles.title}>What is your email?</Text>

                {/* Email input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#545454"
                        value={localEmail}
                        onChangeText={setLocalEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoFocus
                        autoCorrect={false}
                        returnKeyType="next"
                        onSubmitEditing={handleNext}
                    />
                </View>
            </View>

            {/* Continue button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                <Pressable
                    onPress={handleNext}
                    disabled={!localEmail.includes('@')}
                    style={[
                        styles.continueButton,
                        { opacity: localEmail.includes('@') ? 1 : 0.6 }
                    ]}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
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