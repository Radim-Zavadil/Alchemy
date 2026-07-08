import React from 'react';
import { View, Pressable, Image, StyleSheet, Dimensions } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 12;
const CARD_SIZE = (width - 48 - (COLUMN_GAP * 2)) / 3;

export default function OnboardingImageUpload({ images, onImagesChange, maxImages = 3 }) {
    
    const pickImage = async (index) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission denied');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImages = [...images];
            newImages[index] = result.assets[0].uri;
            onImagesChange(newImages);
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onImagesChange(newImages);
    };

    return (
        <View style={styles.container}>
            {Array.from({ length: maxImages }).map((_, index) => (
                <Pressable
                    key={index}
                    onPress={() => pickImage(index)}
                    style={styles.square}
                >
                    {images[index] ? (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: images[index] }} style={styles.image} />
                            <Pressable 
                                onPress={() => removeImage(index)}
                                style={styles.removeButton}
                            >
                                <X size={12} color="#fff" />
                            </Pressable>
                        </View>
                    ) : (
                        <Plus size={24} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                    )}
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: COLUMN_GAP,
        marginVertical: 24,
    },
    square: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: 16,
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
