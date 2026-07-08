import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingWrapper from '@/components/OnboardingWrapper';

export default function DescribeSelfScreen() {
    const router = useRouter();
    const { description, setDescribe } = useOnboardingStore();
    const [localValue, setLocalValue] = useState(description);

    const handleNext = () => {
        if (localValue.trim()) {
            setDescribe({ description: localValue });
            router.push('/onboarding/thoughts');
        }
    };

    return (
        <OnboardingWrapper
            title="How would you describe yourself right now?"
            subtext="Be honest. Three sentences or less. This is where your transformation begins."
            onNext={handleNext}
        >
            <TextInput
                style={styles.input}
                placeholder="Type your answer..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                multiline
                numberOfLines={4}
                value={localValue}
                onChangeText={setLocalValue}
                autoFocus
            />
        </OnboardingWrapper>
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        padding: 20,
        color: '#fff',
        fontSize: 18,
        minHeight: 150,
        textAlignVertical: 'top',
        fontFamily: 'Inter',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    }
});
