import { Image } from 'expo-image';

export const IMAGE_PLACEHOLDER_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';
export const IMAGE_CACHE_POLICY = 'memory-disk' as const;

export function normalizeImageUri(uri?: string | null): string | undefined {
  if (!uri) return undefined;
  try {
    return encodeURI(decodeURI(uri));
  } catch {
    return encodeURI(uri);
  }
}

export function fastImageSource(uri?: string) {
  return { uri: normalizeImageUri(uri) };
}

export function prefetchImages(urls: Array<string | undefined | null>, limit = 12) {
  const uniqueUrls = Array.from(
    new Set(urls.map((url) => normalizeImageUri(url)).filter((url): url is string => Boolean(url)))
  ).slice(0, limit);

  if (!uniqueUrls.length) return;
  Image.prefetch(uniqueUrls, IMAGE_CACHE_POLICY).catch(() => {});
}