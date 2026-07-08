import { Stack } from 'expo-router';
import { useOnboardingNotifications } from '@/hooks/useOnboardingNotifications';

export default function OnboardingLayout() {
    useOnboardingNotifications();
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="name" />
            <Stack.Screen name="purpose" />
            <Stack.Screen name="describe" />
            <Stack.Screen name="thoughts" />
            <Stack.Screen name="worries" />
            <Stack.Screen name="admire" />
            <Stack.Screen name="vision-home" />
            <Stack.Screen name="vision-car" />
            <Stack.Screen name="vision-fashion" />
            <Stack.Screen name="vision-fitness" />
            <Stack.Screen name="processing" />
            <Stack.Screen name="mission" />
            <Stack.Screen name="auth-choice" />
            <Stack.Screen name="email" />
            <Stack.Screen name="password" />
        </Stack>
    );
}
