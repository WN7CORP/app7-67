export const getVideoTitle = (video: { link: string }) => {
  // Extract video title from YouTube URL or use a generic title
  try {
    const url = new URL(video.link);
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      // Try to extract video ID and use it as a fallback
      const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
      return `Vídeo ${videoId}`;
    }
    return 'Vídeo';
  } catch {
    return 'Vídeo';
  }
};

export const isValidVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
    const pathname = urlObj.pathname.toLowerCase();
    
    // Check for direct video file extensions
    const hasVideoExtension = validExtensions.some(ext => pathname.endsWith(ext));
    
    // Check for common video hosting patterns
    const isVideoHost = urlObj.hostname.includes('youtube.com') || 
                       urlObj.hostname.includes('youtu.be') ||
                       urlObj.hostname.includes('vimeo.com') ||
                       urlObj.hostname.includes('video') ||
                       hasVideoExtension;
    
    return isVideoHost;
  } catch {
    return false;
  }
};

export const getVideoType = (url: string): 'direct' | 'youtube' | 'vimeo' | 'unknown' => {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      return 'youtube';
    }
    
    if (urlObj.hostname.includes('vimeo.com')) {
      return 'vimeo';
    }
    
    const validExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
    const pathname = urlObj.pathname.toLowerCase();
    const hasVideoExtension = validExtensions.some(ext => pathname.endsWith(ext));
    
    if (hasVideoExtension) {
      return 'direct';
    }
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
};