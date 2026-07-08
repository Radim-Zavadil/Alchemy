import React from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet, Modal, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface InterstitialVariation {
    id: number;
    emoji: string;
    backgroundColor: string;
    heading: string;
    subheading: string;
    buttonText: string;
}

interface InterstitialCardProps {
    visible: boolean;
    variation: InterstitialVariation;
    onClose: () => void;
}

export default function InterstitialCard({ visible, variation, onClose }: InterstitialCardProps) {
    const insets = useSafeAreaInsets();

    if (!variation) return null;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: variation.backgroundColor }]}>
                <View style={styles.content}>
                    {/* Emoji */}
                    <Text style={styles.emoji}>
                        {variation.emoji}
                    </Text>

                    {/* Main heading */}
                    <Text style={styles.heading}>
                        {variation.heading}
                    </Text>

                    {/* Subheading/Quote */}
                    <Text style={styles.subheading}>
                        {variation.subheading}
                    </Text>
                </View>

                {/* Continue button - fixed to bottom relative to safe area */}
                <View style={[styles.footer, { paddingBottom: insets.bottom + 32 }]}>
                    <Pressable
                        onPress={onClose}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>
                            {variation.buttonText}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => BackHandler.exitApp()}
                        style={[styles.button, styles.secondaryButton]}
                    >
                        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                            Close App
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    emoji: {
        fontSize: 100,
        marginBottom: 32,
    },
    heading: {
        fontSize: 32,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 25,
        // fontFamily: "Inter", // Ensure font is loaded or fallback triggers
    },
    subheading: {
        fontSize: 18,
        fontWeight: '400',
        color: '#f8f8f8ff',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 33,
        fontFamily: "Inter",
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        gap: 12,
    },
    button: {
        backgroundColor: '#ffffff',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        width: width - 80,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000000',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        elevation: 0,
        shadowOpacity: 0,
    },
    secondaryButtonText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
});
