import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase';
import { useState } from 'react';

const OPTIONS = [
    "Stay motivated and consistent",
    "Remind me why I started",
    "Push myself to grow",
];

export default function PurposeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setReason } = useOnboardingStore();
    const [selectedReason, setSelectedReason] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSelect = async (reason) => {
        setSelectedReason(reason);
        setReason(reason);
        setLoading(true);

        router.push('/onboarding/describe');
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
                    <ArrowLeft size={24} color="#ffffff" />
                </Pressable>
            </View>

            {/* Main content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.title}>What brought you here?</Text>

                <Text style={styles.subtext}>
                    Knowing your goal helps us show you quotes that truly motivate you.
                </Text>

                <View style={styles.options}>
                    {OPTIONS.map((option, index) => (
                        <Pressable
                            key={index}
                            onPress={() => handleSelect(option)}
                            disabled={loading}
                            style={[
                                styles.optionButton,
                                selectedReason === option && styles.optionButtonSelected,
                                { opacity: loading ? 0.6 : 1 }
                            ]}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                        </Pressable>
                    ))}
                </View>

                {loading && (
                    <ActivityIndicator
                        style={styles.loader}
                        color="#ffffff"
                    />
                )}
            </ScrollView>
        </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '400',
        color: '#ffffff',
        marginBottom: 16,
        fontFamily: 'Inter',
    },
    subtext: {
        fontSize: 16,
        color: '#545454',
        marginBottom: 32,
        fontFamily: 'Inter',
    },
    options: {
        gap: 12,
        marginBottom: 40,
    },
    optionButton: {
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#545454',
        backgroundColor: 'transparent',
    },
    optionButtonSelected: {
        backgroundColor: '#2F2F2F70',
    },
    optionText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Inter',
    },
    loader: {
        marginTop: 20,
    },
});