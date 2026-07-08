import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingWrapper from '@/components/OnboardingWrapper';
import OnboardingImageUpload from '@/components/OnboardingImageUpload';

export default function VisionFashionScreen() {
    const router = useRouter();
    const { fashionImages, setVisionImages } = useOnboardingStore();
    const [localImages, setLocalImages] = useState(fashionImages);

    const handleNext = () => {
        setVisionImages('fashionImages', localImages);
        router.push('/onboarding/vision-fitness');
    };

    return (
        <OnboardingWrapper
            title="Add 2 photos showing your dream fashion style."
            subtext="How do you present yourself to the world when you are at your best?"
            onNext={handleNext}
        >
            <OnboardingImageUpload 
                images={localImages} 
                onImagesChange={setLocalImages} 
                maxImages={2} 
            />
        </OnboardingWrapper>
    );
}
