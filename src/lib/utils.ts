import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Extract YouTube video ID from various URL formats
 */
export const extractYouTubeId = (url: string): string | null => {
    // Regular expressions for different YouTube URL formats
    const regexPatterns = [
        // Standard YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        // Shortened YouTube URL: https://youtu.be/VIDEO_ID
        /(?:youtu\.be\/)([^&\n?#]+)/,
        // Embedded YouTube URL: https://www.youtube.com/embed/VIDEO_ID
        /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
        // YouTube URL with additional parameters: https://www.youtube.com/watch?v=VIDEO_ID&other=params
        /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    ];

    for (const pattern of regexPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

/**
 * Generate YouTube embed iframe HTML
 */
export const generateYouTubeEmbed = (videoId: string): string => {
    return `<iframe
  width="900"
  height="520"
  src="https://www.youtube.com/embed/${videoId}"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>`;
};

/**
 * Extract Google Drive file ID from various URL formats
 */
export const extractGoogleDriveId = (url: string): string | null => {
    // Regular expressions for different Google Drive URL formats
    const regexPatterns = [
        // Standard format: https://drive.google.com/file/d/ID/view
        /(?:drive\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/,
        // Open format: https://drive.google.com/open?id=ID
        /(?:drive\.google\.com\/open\?id=)([a-zA-Z0-9_-]+)/,
        // UC format: https://drive.google.com/uc?export=download&id=ID
        /(?:drive\.google\.com\/uc\?export=download&id=)([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of regexPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

/**
 * Generate Google Drive PDF embed iframe HTML
 */
export const generateGoogleDriveEmbed = (fileId: string): string => {
    return `<iframe
  src="https://drive.google.com/file/d/${fileId}/preview"
  width="100%"
  height="600">
</iframe>`;
};
