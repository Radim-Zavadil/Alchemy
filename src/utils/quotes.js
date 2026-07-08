import { supabase } from './supabase';

/**
 * Configuration for random images
 * EDIT THIS NUMBER to change the range of random images (e.g., 10 results in 1.jpg to 10.jpg)
 */
export const MAX_RANDOM_IMAGES = 22;
export const MAX_TEXT_RANDOM_IMAGES = 12;

/**
 * Logic for background image:
 * 1. If bucket is 'quote-backgrounds-random' or 'quote-background-with-quote-text', 
 *    generate a filename based on quote ID (stable random).
 * 2. If bucket and bg_image_url are present, use the public URL for that file.
 * 3. Fallback to a random image if bg_image_url or bucket is missing.
 */
export const getQuoteImageUrl = (quote, randomImagesPool = []) => {
  // Force legacy 'quote-backgrounds-predefined' to use random bucket logic
  const bucket = (quote?.bucket === 'quote-backgrounds-predefined')
    ? 'quote-backgrounds-random'
    : (quote?.bucket || 'quote-backgrounds-random');
  const url = quote?.bg_image_url;

  // Determine max images based on bucket
  let maxImages = MAX_RANDOM_IMAGES;
  if (bucket === 'quote-background-with-quote-text') {
    maxImages = MAX_TEXT_RANDOM_IMAGES;
  }

  // Use random numbering logic if:
  // - Bucket is one of our "random-capable" buckets
  // - OR bg_image_url is missing (NULL)
  if (bucket === 'quote-backgrounds-random' || bucket === 'quote-background-with-quote-text' || !url) {
    // Generate a stable number between 1 and maxImages using quote ID
    let imgNumber = 1;
    const quoteId = quote?.id || quote?._id;

    if (quoteId) {
      const idStr = String(quoteId);
      let hash = 0;
      for (let i = 0; i < idStr.length; i++) {
        hash = (hash << 5) - hash + idStr.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      imgNumber = Math.abs(hash % maxImages) + 1;
    } else {
      imgNumber = Math.floor(Math.random() * maxImages) + 1;
    }

    const filename = `${imgNumber}.jpg`;
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return data?.publicUrl;
  }

  // Standard specific image URL from specific bucket
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(url);

  return data?.publicUrl;
};

// This function is now largely deprecated but kept for compatibility if needed
export const fetchRandomBackgroundImageUrls = async () => {
  try {
    const { data, error } = await supabase.storage
      .from('quote-backgrounds-random')
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error("Error listing random images bucket:", error);
      return [];
    }

    if (data) {
      const files = data.filter(item => item.name !== '.emptyFolderPlaceholder' && !item.name.startsWith('.'));
      const urls = files.map(file => {
        const { data: urlData } = supabase.storage
          .from('quote-backgrounds-random')
          .getPublicUrl(file.name);
        return urlData.publicUrl;
      });
      return urls;
    }
  } catch (e) {
    console.error("Exception fetching random background images:", e);
  }
  return [];
};
