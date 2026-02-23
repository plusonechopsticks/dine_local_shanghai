/**
 * Get image URL - Cloudinary URLs are publicly accessible, no proxy needed
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url;
}

/**
 * Get optimized image URL for OG (Open Graph) social sharing
 * Transforms image to 1200x630px with high quality for social media previews
 */
export function getOGImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    // Insert transformation parameters after /upload/
    return url.replace(
      '/upload/',
      '/upload/w_1200,h_630,c_fill,q_auto:best/'
    );
  }
  
  // For non-Cloudinary URLs, return as-is
  return url;
}

/**
 * Convert an array of image URLs
 */
export function getProxiedImageUrls(urls: (string | null | undefined)[] | null | undefined): string[] {
  if (!urls) return [];
  return urls.filter((url): url is string => !!url);
}
