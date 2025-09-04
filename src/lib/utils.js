/**
 * Utility functions for audio conversion app
 */

// Blocked streaming domains
export const BLOCKED_DOMAINS = [
  'open.spotify.com',
  'spotify.link',
  'music.apple.com',
  'itunes.apple.com',
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'soundcloud.com',
  'm.soundcloud.com',
  'api.soundcloud.com'
];

// Supported audio formats
export const SUPPORTED_AUDIO_TYPES = [
  'audio/flac',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
  'audio/opus',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/aiff',
  'audio/x-aiff'
];

// File size limits
export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

/**
 * Validate if a URL is blocked for streaming
 */
export function isBlockedDomain(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return BLOCKED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Validate if a URL is a valid audio file
 */
export function isValidAudioUrl(url) {
  try {
    new URL(url);
    return !isBlockedDomain(url);
  } catch {
    return false;
  }
}

/**
 * Check if content type is supported audio format
 */
export function isSupportedAudioType(contentType) {
  if (!contentType) return false;
  return SUPPORTED_AUDIO_TYPES.some(type => 
    contentType.toLowerCase().startsWith(type)
  );
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from URL or filename
 */
export function getFileExtension(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    return ext || '';
  } catch {
    return '';
  }
}

/**
 * Validate file size
 */
export function validateFileSize(size) {
  if (size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
  }
  return true;
}

/**
 * Check if browser supports required features
 */
export function checkBrowserSupport() {
  const issues = [];
  
  if (!window.WebAssembly) {
    issues.push('WebAssembly is not supported');
  }
  
  if (!window.SharedArrayBuffer) {
    issues.push('SharedArrayBuffer is not supported (required for ffmpeg.wasm)');
  }
  
  if (!window.fetch) {
    issues.push('Fetch API is not supported');
  }
  
  if (!window.FileReader) {
    issues.push('FileReader is not supported');
  }
  
  return {
    supported: issues.length === 0,
    issues
  };
}

/**
 * Get oEmbed URL for streaming services
 */
export function getOEmbedUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('spotify.com') || hostname.includes('spotify.link')) {
      return `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    }
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    }
    
    if (hostname.includes('soundcloud.com')) {
      return `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get iTunes search URL for Apple Music
 */
export function getiTunesSearchUrl(url) {
  try {
    // Extract potential search terms from Apple Music URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Look for album or song identifiers
    const searchTerm = pathParts[pathParts.length - 1] || '';
    
    if (searchTerm) {
      return `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&limit=1&media=music`;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Debounce function for input validation
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a progress callback for file downloads
 */
export function createProgressCallback(onProgress) {
  return (progressEvent) => {
    if (progressEvent.lengthComputable) {
      const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
      onProgress(percentComplete);
    }
  };
}

/**
 * Clean up object URLs to prevent memory leaks
 */
export function cleanupObjectUrl(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
