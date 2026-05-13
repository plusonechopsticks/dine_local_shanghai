/**
 * Get image URL with automatic Cloudinary optimizations.
 * For Cloudinary URLs: applies f_auto,q_auto to serve WebP/AVIF and reduce
 * file size by 30-60% with no visual difference.
 * For all other URLs: returns as-is.
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // Only inject if no transformation block already present
    if (!url.includes("/upload/f_auto") && !url.includes("/upload/q_auto")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto/");
    }
  }
  return url;
}

/**
 * Get a Cloudinary thumbnail URL sized for host cards (400×400, cropped to face).
 * Falls back to getProxiedImageUrl for non-Cloudinary images.
 */
export function getThumbnailUrl(url: string | null | undefined, width = 400, height = 400): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (!url.includes(`/upload/w_${width}`)) {
      return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill,f_auto,q_auto/`);
    }
  }
  return getProxiedImageUrl(url);
}

/**
 * Get optimized image URL for OG (Open Graph) social sharing.
 * Transforms image to 1200x630px with high quality for social media previews.
 */
export function getOGImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  // Check if it's a Cloudinary URL
  if (url.includes("cloudinary.com")) {
    // Insert transformation parameters after /upload/
    return url.replace("/upload/", "/upload/w_1200,h_630,c_fill,q_auto:best,f_auto/");
  }

  // For non-Cloudinary URLs, return as-is
  return url;
}

/**
 * Convert an array of image URLs with Cloudinary optimizations applied.
 */
export function getProxiedImageUrls(urls: (string | null | undefined)[] | null | undefined): string[] {
  if (!urls) return [];
  return urls.filter((url): url is string => !!url).map(getProxiedImageUrl);
}
