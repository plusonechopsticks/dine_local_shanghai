/**
 * Convert CloudFront image URLs to use the image proxy endpoint
 * This ensures images are accessible even when S3 bucket is not public
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // If it's already a proxy URL, return as-is
  if (url.includes("/api/image-proxy")) {
    return url;
  }
  
  // If it's a CloudFront URL, convert to proxy URL
  if (url.includes("cloudfront.net")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  
  // For other URLs (e.g., external images), return as-is
  return url;
}

/**
 * Convert an array of image URLs to proxied URLs
 */
export function getProxiedImageUrls(urls: (string | null | undefined)[] | null | undefined): string[] {
  if (!urls) return [];
  return urls.filter((url): url is string => !!url).map(getProxiedImageUrl);
}
