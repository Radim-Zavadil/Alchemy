import React from 'react';
import { useRouter } from 'expo-router';
import OnboardingWrapper from '@/components/OnboardingWrapper';

export default function MissionScreen() {
    const router = useRouter();

    const handleNext = () => {
        router.push('/onboarding/auth-choice');
    };

    return (
        <OnboardingWrapper
            title="We understand you."
            subtext="Your dreams are not just wishes; they are the future you deserve. Most people fail because they lose sight of why they started. We are here to ensure you never do. Every time you feel the weight of procrastination, open this app. Remind yourself what you are fighting for. Your dream life is waiting, and we won't let you settle for less."
            onNext={handleNext}
            nextLabel="I'm Ready"
        >
        </OnboardingWrapper>
    );
}
