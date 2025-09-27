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

// Função para normalizar URLs de vídeo (especialmente Dropbox)
export const normalizeVideoUrl = (url: string): string => {
  if (!url) return '';
  
  // Converter links do Dropbox para formato de reprodução direta
  if (url.includes('dropbox.com')) {
    // Garantir que termine com dl=1 para download direto
    if (url.includes('dl=0')) {
      return url.replace('dl=0', 'dl=1');
    }
    if (!url.includes('dl=1') && !url.includes('dl=0')) {
      return url + (url.includes('?') ? '&' : '?') + 'dl=1';
    }
  }
  
  return url;
};

export const isValidVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
    const pathname = urlObj.pathname.toLowerCase();
    
    // Check for direct video file extensions
    const hasVideoExtension = validExtensions.some(ext => pathname.endsWith(ext));
    
    // Check for common video hosting patterns including Dropbox
    const isVideoHost = urlObj.hostname.includes('youtube.com') || 
                       urlObj.hostname.includes('youtu.be') ||
                       urlObj.hostname.includes('vimeo.com') ||
                       urlObj.hostname.includes('dropbox.com') ||
                       urlObj.hostname.includes('video') ||
                       hasVideoExtension;
    
    return isVideoHost;
  } catch {
    return false;
  }
};

export const getVideoType = (url: string): 'direct' | 'youtube' | 'vimeo' | 'dropbox' | 'unknown' => {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      return 'youtube';
    }
    
    if (urlObj.hostname.includes('vimeo.com')) {
      return 'vimeo';
    }
    
    if (urlObj.hostname.includes('dropbox.com')) {
      return 'dropbox';
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