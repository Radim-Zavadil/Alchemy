import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingWrapper from '@/components/OnboardingWrapper';

export default function WorriesScreen() {
    const router = useRouter();
    const { futureWorries, setDescribe } = useOnboardingStore();
    const [localValue, setLocalValue] = useState(futureWorries);

    const handleNext = () => {
        if (localValue.trim()) {
            setDescribe({ futureWorries: localValue });
            router.push('/onboarding/admire');
        }
    };

    return (
        <OnboardingWrapper
            title="What things do you worry about in the future?"
            subtext="Face your fears. What keeps you up at night? Writing it down takes away its power."
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
