import { supabase } from './supabase';

const decodeB64 = (b) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let s = b.replace(/[\t\n\r ]+/g, ''), o = new Uint8Array(((s.length * 3) / 4) | 0), bc = 0, bs, buf, i = 0, j = 0;
    while (buf = s.charAt(i++)) { buf = chars.indexOf(buf); if (~buf) { bs = bc % 4 ? bs * 64 + buf : buf; if (bc++ % 4) o[j++] = 255 & (bs >> ((-2 * bc) & 6)); } }
    return o;
};

export const uploadOnboardingImages = async (userId, store) => {
    const categories = [
        { key: 'admiredImages', prefix: 'admire' },
        { key: 'homeImages', prefix: 'home' },
        { key: 'carImages', prefix: 'car' },
        { key: 'fashionImages', prefix: 'fashion' },
        { key: 'fitnessImages', prefix: 'fitness' }
    ];

    const allImages = [];
    categories.forEach(cat => {
        const uris = store[cat.key] || [];
        uris.forEach((uri, idx) => {
            if (uri) allImages.push({ uri, name: `${cat.prefix}_${idx}_${Date.now()}.jpg` });
        });
    });

    if (allImages.length === 0) return;

    for (const img of allImages) {
        try {
            const response = await fetch(img.uri);
            const blob = await response.blob();
            const arrayBuffer = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsArrayBuffer(blob);
            });

            const path = `${userId}/${img.name}`;
            const { error } = await supabase.storage.from('user-images').upload(path, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: true
            });

            if (error) console.error('Upload error:', error);
        } catch (e) {
            console.error('Failed to upload onboarding image:', e);
        }
    }
};
