import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function QuoteCard({ quote, randomBackgroundUrl }: { quote: any, user?: any, randomBackgroundUrl?: string }) {
    const bgImage = randomBackgroundUrl || quote.bg_image_url;
    const hasText = !!quote.body_text;
    const hasAuthor = !!quote.author && quote.author.toUpperCase() !== 'UNKNOWN';

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: bgImage }}
                style={styles.image}
                resizeMode="cover"
            >
                {hasText && (
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                        style={styles.textGradient}
                    />
                )}

                <View style={styles.content}>
                    {hasText && (
                        <View style={styles.textContainer}>
                            <Text style={styles.quoteText}>{quote.body_text}</Text>
                            {hasAuthor && (
                                <Text style={styles.authorText}>{quote.author}</Text>
                            )}
                        </View>
                    )}
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: width,
        height: height,
        backgroundColor: '#000',
    },
    image: {
        flex: 1,
        justifyContent: 'center',
    },
    textGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 100,
        paddingBottom: 100,
    },
    textContainer: {
        alignItems: 'center',
        maxWidth: width * 0.85,
    },
    quoteText: {
        fontSize: 23,
        fontWeight: '500',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        lineHeight: 36,
    },
    authorText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});
