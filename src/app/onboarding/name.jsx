import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NameScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { name, setName } = useOnboardingStore();
    const [localName, setLocalName] = useState(name);

    const handleNext = () => {
        if (localName.trim().length > 0) {
            setName(localName);
            router.push('/onboarding/purpose');
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

                <Text style={styles.title}>What is your name?</Text>

                {/* Name input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor="#545454"
                        value={localName}
                        onChangeText={setLocalName}
                        autoFocus
                        autoCapitalize="words"
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
                    disabled={localName.trim().length === 0}
                    style={[
                        styles.continueButton,
                        { opacity: localName.trim().length > 0 ? 1 : 0.6 }
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