import { useState, useEffect } from 'react';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  position: number;
  url: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  videoCount: number;
  videos: YouTubeVideo[];
}

export const useYouTubePlaylist = (playlistUrl: string | null) => {
  const [playlist, setPlaylist] = useState<YouTubePlaylist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractPlaylistId = (url: string): string | null => {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  };

  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!playlistUrl) {
      setPlaylist(null);
      return;
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError('ID da playlist não encontrado na URL');
      return;
    }

    const fetchPlaylist = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/functions/v1/youtube-playlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playlistId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao buscar playlist');
        }

        // Formatar durações dos vídeos
        const formattedPlaylist = {
          ...data,
          videos: data.videos.map((video: YouTubeVideo) => ({
            ...video,
            duration: formatDuration(video.duration)
          }))
        };

        setPlaylist(formattedPlaylist);
      } catch (err) {
        console.error('Erro ao buscar playlist:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [playlistUrl]);

  return { playlist, loading, error };
};