import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlaylistData {
  id: number;
  area: string;
  link: string;
  playlistId?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  videoCount?: number;
  channelTitle?: string;
}

export const useYouTubeVideoaulas = () => {
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const extractPlaylistId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      
      // For playlist URLs
      if (urlObj.hostname.includes('youtube.com')) {
        const listParam = urlObj.searchParams.get('list');
        if (listParam) return listParam;
      }
      
      // For youtu.be URLs with playlist
      if (urlObj.hostname.includes('youtu.be')) {
        const pathParts = urlObj.pathname.split('/');
        const listParam = urlObj.searchParams.get('list');
        if (listParam) return listParam;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const fetchPlaylistDetails = async (playlistId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('youtube-playlist', {
        body: { playlistId }
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar detalhes da playlist:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        // Buscar dados da tabela diretamente
        const response = await fetch(`https://phzcazcyjhlmdchcjagy.supabase.co/rest/v1/VIDEOS-AULAS-FINAL?order=area.asc`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoemNhemN5amhsbWRjaGNqYWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTM3NzUsImV4cCI6MjA2MDQ4OTc3NX0.oTdOS5KBBHROGkzcyr7-EZJNFvYzkGaBFT3F89YGrZg',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoemNhemN5amhsbWRjaGNqYWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTM3NzUsImV4cCI6MjA2MDQ4OTc3NX0.oTdOS5KBBHROGkzcyr7-EZJNFvYzkGaBFT3F89YGrZg'
          }
        });

        if (!response.ok) throw new Error('Erro ao buscar dados');
        
        const data = await response.json();

        const playlistsWithDetails = await Promise.all(
          (data || []).map(async (item: any) => {
            const playlistId = extractPlaylistId(item.link);
            
            if (playlistId) {
              const details = await fetchPlaylistDetails(playlistId);
              
              return {
                id: item.id,
                area: item.area,
                link: item.link,
                playlistId,
                title: details?.title || item.area,
                description: details?.description || '',
                thumbnailUrl: details?.thumbnailUrl || '',
                videoCount: details?.videoCount || 0,
                channelTitle: details?.channelTitle || ''
              };
            }
            
            return {
              id: item.id,
              area: item.area,
              link: item.link,
              title: item.area,
              description: '',
              thumbnailUrl: '',
              videoCount: 0,
              channelTitle: ''
            };
          })
        );

        setPlaylists(playlistsWithDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar playlists');
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  return { playlists, loading, error };
};