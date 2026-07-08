import AsyncStorage from "@react-native-async-storage/async-storage";

const LIKES_KEY = "@motivational_quotes_likes";

/**
 * Get all liked quote IDs from AsyncStorage
 * @returns {Promise<string[]>} Array of liked quote IDs
 */
export const getLikedQuotes = async () => {
  try {
    const likes = await AsyncStorage.getItem(LIKES_KEY);
    return likes ? JSON.parse(likes) : [];
  } catch (error) {
    console.error("Error getting liked quotes:", error);
    return [];
  }
};

/**
 * Toggle like status for a quote
 * @param {string} quoteId - ID of the quote to toggle
 * @returns {Promise<boolean>} New like status (true if liked, false if unliked)
 */
export const toggleLike = async (quoteId) => {
  try {
    const likes = await getLikedQuotes();
    const isLiked = likes.includes(quoteId);

    let newLikes;
    if (isLiked) {
      // Remove from likes
      newLikes = likes.filter((id) => id !== quoteId);
    } else {
      // Add to likes
      newLikes = [...likes, quoteId];
    }

    await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(newLikes));
    return !isLiked;
  } catch (error) {
    console.error("Error toggling like:", error);
    return false;
  }
};

/**
 * Check if a quote is liked
 * @param {string} quoteId - ID of the quote to check
 * @returns {Promise<boolean>} True if liked, false otherwise
 */
export const isQuoteLiked = async (quoteId) => {
  try {
    const likes = await getLikedQuotes();
    return likes.includes(quoteId);
  } catch (error) {
    console.error("Error checking if quote is liked:", error);
    return false;
  }
};
