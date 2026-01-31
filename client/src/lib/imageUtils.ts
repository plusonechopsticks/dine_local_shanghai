/**
 * Get image URL - Cloudinary URLs are publicly accessible, no proxy needed
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url;
}

/**
 * Convert an array of image URLs
 */
export function getProxiedImageUrls(urls: (string | null | undefined)[] | null | undefined): string[] {
  if (!urls) return [];
  return urls.filter((url): url is string => !!url);
}
