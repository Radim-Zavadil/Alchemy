import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { usePathname } from 'expo-router';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export function useOnboardingNotifications() {
    const appState = useRef(AppState.currentState);
    const pathname = usePathname();

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current === 'active' &&
                nextAppState.match(/inactive|background/) &&
                pathname.startsWith('/onboarding') &&
                pathname !== '/onboarding/index'
            ) {
                // App moved to background during onboarding
                scheduleReminder();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [pathname]);

    const scheduleReminder = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            await Notifications.requestPermissionsAsync();
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Wait! Don't give up now.",
                body: "You don't want to stop procrastinating on your journey? Your dream life is waiting.",
                data: { url: '/onboarding' },
            },
            trigger: { seconds: 1 }, // Fire almost immediately for demo purposes, or set to e.g. 3600 for 1 hour
        });
    };
}
