import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function GetStartedScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Full-bleed background image */}
            <ImageBackground
                source={require('../../../assets/images/onboarding/getStarted.png')}
                style={styles.background}
                resizeMode="cover"
            >
                {/* Black overlay above the image */}
                <View style={styles.overlay} />

                <View style={styles.content}>
                    {/* Centered title + subtitle */}
                    <Animated.View
                        style={styles.centerSection}
                        entering={FadeIn.delay(300).duration(600)}
                    >
                        <Text style={styles.title}>Meet your future self</Text>
                        <Text style={styles.subtitle}>
                            See where your current life is taking you—and learn how to change the outcome.
                        </Text>
                    </Animated.View>

                    {/* Bottom section */}
                    <Animated.View
                        style={styles.bottomSection}
                        entering={FadeInDown.delay(500).springify()}
                    >
                        <TouchableOpacity
                            style={styles.mainButton}
                            onPress={() => router.push('/onboarding/name')}
                        >
                            <Text style={styles.mainButtonText}>Get Started</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push('/onboarding/auth-choice?mode=login')}
                        >
                            <Text style={styles.secondaryButtonText}>Already have an account</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        flex: 1,
        width,
        height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingTop: height * 0.1,
        paddingBottom: 50,
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 130
    },
    title: {
        fontSize: 43,
        fontWeight: '400',
        color: '#fff',
        marginBottom: 11,
        textAlign: 'center',
        fontFamily: 'Inter',
        lineHeight: 50,
    },
    subtitle: {
        fontSize: 17,
        fontWeight: '400',
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 12,
        fontFamily: 'Inter',
    },
    bottomSection: {
        alignItems: 'center',
    },
    mainButton: {
        backgroundColor: '#fff',
        width: '100%',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    mainButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '400',
        fontFamily: 'Inter',
    },
    secondaryButton: {
        paddingVertical: 12,
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '400',
        fontFamily: 'Inter',
    },
});