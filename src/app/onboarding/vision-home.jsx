import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingWrapper from '@/components/OnboardingWrapper';
import OnboardingImageUpload from '@/components/OnboardingImageUpload';

export default function VisionHomeScreen() {
    const router = useRouter();
    const { homeImages, setVisionImages } = useOnboardingStore();
    const [localImages, setLocalImages] = useState(homeImages);

    const handleNext = () => {
        setVisionImages('homeImages', localImages);
        router.push('/onboarding/vision-car');
    };

    return (
        <OnboardingWrapper
            title="Add 2 photos of your dream home."
            subtext="Where will you wake up every morning when you reach your full potential?"
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
