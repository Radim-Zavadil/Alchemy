import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingWrapper from '@/components/OnboardingWrapper';
import OnboardingImageUpload from '@/components/OnboardingImageUpload';

export default function VisionCarScreen() {
    const router = useRouter();
    const { carImages, setVisionImages } = useOnboardingStore();
    const [localImages, setLocalImages] = useState(carImages);

    const handleNext = () => {
        setVisionImages('carImages', localImages);
        router.push('/onboarding/vision-fashion');
    };

    return (
        <OnboardingWrapper
            title="Add 3 photos of your dream car."
            subtext="What will you be driving? Visualize the details, the speed, the freedom."
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
