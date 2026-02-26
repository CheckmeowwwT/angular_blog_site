export type ContentBlock = TextBlock | ImageBlock | VideoBlock;

export interface TextBlock {
  type: 'text';
  body: string; // plain text or minimal formatting
}

export interface ImageBlock {
  type: 'image';
  url: string;
  caption?: string;
}

export interface VideoBlock {
  type: 'video';
  url: string;
  title: string; // auto-fetched or custom via <l>url, title</l>
}

/**
 * Parse the <l>url, title</l> syntax.
 * - <l>https://youtube.com/watch?v=abc, My Video</l>  → { url, title: "My Video" }
 * - https://youtube.com/watch?v=abc                    → { url, title: null } (fetch later)
 */
export function parseLinkSyntax(input: string): { url: string; title: string | null } {
  const match = input.match(/^<l>\s*(.+?)\s*,\s*(.+?)\s*<\/l>$/);
  if (match) {
    return { url: match[1], title: match[2] };
  }
  return { url: input.trim(), title: null };
}

/**
 * Extract a video title from a URL using noembed (free, no API key).
 * Works for YouTube, Vimeo, Dailymotion, etc.
 */
export async function fetchVideoTitle(url: string): Promise<string> {
  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return data.title || extractFallbackTitle(url);
  } catch {
    return extractFallbackTitle(url);
  }
}

function extractFallbackTitle(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return `Video (${hostname})`;
  } catch {
    return 'Video Link';
  }
}

/**
 * Serialize blocks to JSON string for storage in Supabase `content` column.
 */
export function serializeBlocks(blocks: ContentBlock[]): string {
  return JSON.stringify(blocks);
}

/**
 * Deserialize JSON string from Supabase back to blocks.
 * Falls back to a single text block if content is plain text (legacy).
 */
export function deserializeBlocks(content: string): ContentBlock[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Legacy: plain text or HTML content
  }
  return [{ type: 'text', body: content }];
}