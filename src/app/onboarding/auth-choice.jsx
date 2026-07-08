import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AuthChoiceScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { mode } = useLocalSearchParams();

    const isLogin = mode === 'login';

    const handleEmail = () => {
        if (isLogin) {
            router.push('/auth/login');
        } else {
            router.push('/onboarding/email');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#ffffff" />
                </Pressable>
            </View>

            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <Text style={styles.title}>Save your progress</Text>
                    <Text style={styles.subtext}>
                        Create an account to securely store your visual board and focus settings across all your devices.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.buttonContainer}>
                    <Pressable style={styles.authButton} onPress={() => {}}>
                        <FontAwesome name="google" size={20} color="#fff" style={styles.icon} />
                        <Text style={styles.authButtonText}>Continue with Google</Text>
                    </Pressable>

                    <Pressable style={styles.authButton} onPress={() => {}}>
                        <FontAwesome name="apple" size={22} color="#fff" style={styles.icon} />
                        <Text style={styles.authButtonText}>Continue with Apple</Text>
                    </Pressable>

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.line} />
                    </View>

                    <Pressable style={[styles.authButton, styles.emailButton]} onPress={handleEmail}>
                        <Mail size={20} color="#000" style={styles.icon} />
                        <Text style={[styles.authButtonText, styles.emailButtonText]}>Continue with Email</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        paddingHorizontal: 24,
        height: 80,
        justifyContent: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 16,
        fontFamily: 'Inter',
    },
    subtext: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 48,
        fontFamily: 'Inter',
        lineHeight: 24,
    },
    buttonContainer: {
        gap: 16,
    },
    authButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    authButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    emailButton: {
        backgroundColor: '#ffffff',
    },
    emailButtonText: {
        color: '#000000',
    },
    icon: {
        marginRight: 12,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 16,
        fontSize: 14,
        fontFamily: 'Inter',
    }
});
