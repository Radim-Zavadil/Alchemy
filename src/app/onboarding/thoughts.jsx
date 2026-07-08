import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingWrapper from '@/components/OnboardingWrapper';

export default function ThoughtsScreen() {
    const router = useRouter();
    const { dailyThoughts, setDescribe } = useOnboardingStore();
    const [localValue, setLocalValue] = useState(dailyThoughts);

    const handleNext = () => {
        if (localValue.trim()) {
            setDescribe({ dailyThoughts: localValue });
            router.push('/onboarding/worries');
        }
    };

    return (
        <OnboardingWrapper
            title="What thoughts go through your mind daily?"
            subtext="The inner dialogue you have with yourself. What does it sound like?"
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
