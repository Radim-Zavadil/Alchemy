import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

export default function OnboardingWrapper({ 
    title, 
    subtext, 
    children, 
    onNext, 
    nextLabel = "Continue", 
    loading = false,
    showBack = true 
}) {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                {showBack && (
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#ffffff" />
                    </Pressable>
                )}
            </View>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <Text style={styles.title}>{title}</Text>
                    {subtext && <Text style={styles.subtext}>{subtext}</Text>}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    {children}
                </Animated.View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <Pressable 
                    onPress={onNext} 
                    disabled={loading}
                    style={({ pressed }) => [
                        styles.nextButton,
                        pressed && { opacity: 0.8 },
                        loading && { opacity: 0.6 }
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.nextButtonText}>{nextLabel}</Text>
                    )}
                </Pressable>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 16,
        fontFamily: 'Inter',
        lineHeight: 40,
    },
    subtext: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 32,
        fontFamily: 'Inter',
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    nextButton: {
        backgroundColor: '#ffffff',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    nextButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
});
