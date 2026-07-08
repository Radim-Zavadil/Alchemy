import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingWrapper from '@/components/OnboardingWrapper';
import OnboardingImageUpload from '@/components/OnboardingImageUpload';

export default function AdmireScreen() {
    const router = useRouter();
    const { admiredText, admiredImages, setAdmired } = useOnboardingStore();
    const [localText, setLocalText] = useState(admiredText);
    const [localImages, setLocalImages] = useState(admiredImages);

    const handleNext = () => {
        if (localText.trim()) {
            setAdmired({ admiredText: localText, admiredImages: localImages });
            router.push('/onboarding/vision-home');
        }
    };

    return (
        <OnboardingWrapper
            title="Who are 3 people you deeply admire?"
            subtext="Those who inspire you, or whose life you aspire to live. Add their photos and why they move you."
            onNext={handleNext}
        >
            <OnboardingImageUpload 
                images={localImages} 
                onImagesChange={setLocalImages} 
                maxImages={3} 
            />
            
            <TextInput
                style={styles.input}
                placeholder="Explain why you admire them..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                multiline
                numberOfLines={4}
                value={localText}
                onChangeText={setLocalText}
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
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: 'top',
        fontFamily: 'Inter',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    }
});
