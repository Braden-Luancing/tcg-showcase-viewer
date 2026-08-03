/** Fetches an image from an arbitrary URL for the card library's "add from URL"/drag-in intake. */

function isAbsoluteHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
};

function deriveFileName(url: string, mimeType: string): string {
  try {
    const { pathname } = new URL(url);
    const lastSegment = pathname.split('/').filter(Boolean).pop();
    if (lastSegment) return decodeURIComponent(lastSegment);
  } catch {
    // fall through to the generic name below
  }
  const extension = EXTENSION_BY_MIME_TYPE[mimeType] ?? 'img';
  return `image.${extension}`;
}

/**
 * Fetches `url` and returns its contents as a blob, validating that it's an
 * image. Third-party hosts without permissive CORS headers will cause the
 * `fetch` to reject — there's no backend to proxy around that, so callers
 * should treat rejection as an expected, user-facing failure mode.
 */
export async function fetchImageFromUrl(url: string): Promise<{ blob: Blob; fileName: string }> {
  if (!isAbsoluteHttpUrl(url)) {
    throw new Error('Enter a valid http(s) URL.');
  }

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("Couldn't load that URL (network error or the site blocks cross-origin requests).");
  }

  if (!response.ok) {
    throw new Error(`Couldn't load that URL (server responded with ${response.status}).`);
  }

  const mimeType = response.headers.get('content-type')?.split(';')[0].trim() ?? '';
  if (!mimeType.startsWith('image/')) {
    throw new Error("That link doesn't point to an image.");
  }

  const blob = await response.blob();
  return { blob, fileName: deriveFileName(url, mimeType) };
}
