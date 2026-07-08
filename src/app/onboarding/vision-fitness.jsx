import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingWrapper from '@/components/OnboardingWrapper';
import OnboardingImageUpload from '@/components/OnboardingImageUpload';

export default function VisionFitnessScreen() {
    const router = useRouter();
    const { fitnessImages, setVisionImages } = useOnboardingStore();
    const [localImages, setLocalImages] = useState(fitnessImages);

    const handleNext = () => {
        setVisionImages('fitnessImages', localImages);
        router.push('/onboarding/processing');
    };

    return (
        <OnboardingWrapper
            title="Add 3 photos of your dream fitness level."
            subtext="The peak of your physical performance. What does strength and health look like to you?"
            onNext={handleNext}
        >
            <OnboardingImageUpload 
                images={localImages} 
                onImagesChange={setLocalImages} 
                maxImages={3} 
            />
        </OnboardingWrapper>
    );
}
