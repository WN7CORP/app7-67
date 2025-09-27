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