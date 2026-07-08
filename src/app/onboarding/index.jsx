import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function GetStartedScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background */}
            <LinearGradient
                colors={['#000000', '#000000']}
                style={styles.background}
            />

            <View style={styles.content}>
                {/* Phone Image Section */}
                <Animated.View
                    style={styles.imageSection}
                    entering={FadeInDown.delay(300).springify()}
                >
                    {/* Using a placeholder or the specific image if available. 
                        If the user provided path is strict, we use it. 
                        Safeguarding against missing image by just using the require 
                        and assuming user put it there or I'll need to ask/fix.
                    */}
                    <Image
                        source={require('../../../assets/images/onboarding/getStarted.png')}
                        style={styles.phoneImage}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* Bottom Card Section */}
                <Animated.View
                    style={styles.bottomSection}
                    entering={FadeInDown.delay(600).springify()}
                >
                    <Text style={styles.cardTitle}>Welcome to Alchemy</Text>
                    <Text style={styles.cardText}>
                        Starting today, let's focus better and accomplish your dreams.
                    </Text>

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
                        <Text style={styles.secondaryButtonText}>Already have an account?</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingTop: height * 0.08,
        paddingBottom: 50,
    },
    imageSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    phoneImage: {
        width: width * 0.7,
        height: height * 0.5,
    },
    bottomSection: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    cardTitle: {
        fontSize: 29,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: "Inter"
    },
    cardText: {
        fontSize: 18,
        color: '#bebebeff',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
        paddingHorizontal: 20,
        fontFamily: "Inter"
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
        fontWeight: '700',
        fontFamily: "Inter"
    },
    secondaryButton: {
        paddingVertical: 12,
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 19,
        fontFamily: "Inter"
    },
});
