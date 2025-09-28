import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Search } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VideoPlayerEnhanced } from '@/components/VideoPlayerEnhanced';
import type { YouTubePlaylist } from '@/hooks/useYouTube';

interface DBVideoRow {
  id: number;
  area: string;
  link: string;
}

interface PlaylistCard extends DBVideoRow {
  playlistId?: string | null;
  meta?: YouTubePlaylist;
}

export const Videoaulas = () => {
  const { setCurrentFunction } = useNavigation();
  const [items, setItems] = useState<PlaylistCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{ area: string; playlist: YouTubePlaylist } | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleBack = () => {
    if (selected) {
      setSelected(null);
      return;
    }
    setCurrentFunction(null);
  };

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('VIDEOS')
        .select('id, area, link')
        .order('area');

      if (error) throw error;

      const base: PlaylistCard[] = (data || []).map((row) => ({
        ...row,
        playlistId: extractPlaylistId(row.link),
      }));

      // Buscar metadados no YouTube (playlist ou vídeo único)
      const enriched = await Promise.all(
        base.map(async (row) => {
          try {
            if (row.playlistId) {
              const { data: payload, error: fnError } = await supabase.functions.invoke('youtube-api', {
                body: { action: 'getPlaylistDetails', playlistId: row.playlistId },
              });
              if (fnError) throw fnError;
              return { ...row, meta: payload as YouTubePlaylist };
            } else {
              // Link pode ser vídeo único - criar playlist com 1 item
              const videoId = extractVideoId(row.link);
              if (!videoId) return row; // sem como enriquecer
              const { data: videoData, error: fnError } = await supabase.functions.invoke('youtube-api', {
                body: { action: 'getVideoDetails', videoId },
              });
              if (fnError) throw fnError;
              const v = videoData as any;
              const playlistLike: YouTubePlaylist = {
                id: v.id,
                title: v.title,
                description: v.description || '',
                thumbnail: v.thumbnail,
                videos: [v],
              } as YouTubePlaylist;
              return { ...row, meta: playlistLike };
            }
          } catch (e) {
            console.error('Falha ao enriquecer item', row.id, e);
            return row;
          }
        })
      );

      setItems(enriched);
    } catch (e) {
      console.error('Erro ao carregar playlists:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return items;
    return items.filter((it) =>
      it.area?.toLowerCase().includes(term) || it.meta?.title?.toLowerCase().includes(term)
    );
  }, [items, search]);

  // Player dentro do app
  if (selected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selected.area}</h1>
          </div>
        </div>

        <VideoPlayerEnhanced
          video={{ area: selected.area }}
          playlist={selected.playlist}
          onBack={() => setSelected(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Videoaulas</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar playlists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Grid - 2 por linha */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => {
              const thumb = item.meta?.thumbnail || '/placeholder.svg';
              const count = item.meta?.videos?.length || 0;
              return (
                <Card
                  key={item.id}
                  className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300"
                  onClick={() => item.meta && setSelected({ area: item.area, playlist: item.meta })}
                >
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img
                      src={thumb}
                      alt={item.meta?.title || item.area}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/80 text-white text-xs">{count} vídeos</Badge>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                        <Play className="h-6 w-6 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {item.meta?.title || item.area}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.area}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Vazio */}
        {!loading && filtered.length === 0 && (
          <Card className="text-center p-8">
            <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground text-sm">Não há vídeos disponíveis no momento.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

// Helpers
function extractVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractPlaylistId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}
