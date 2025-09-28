import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Search } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface PlaylistData {
  id: number;
  "Título": string;
  Link: string;
}

export const Videoaulas = () => {
  const { setCurrentFunction } = useNavigation();
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const { data, error } = await supabase
          .from('video-aulas-youtube')
          .select('*')
          .order('id');

        if (error) throw error;
        setPlaylists(data || []);
      } catch (err) {
        console.error('Erro ao carregar playlists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const handleBack = () => {
    setCurrentFunction(null);
  };

  const extractPlaylistId = (url: string): string | null => {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const getThumbnail = (url: string): string => {
    const playlistId = extractPlaylistId(url);
    return playlistId 
      ? `https://img.youtube.com/vi/playlist?list=${playlistId}/maxresdefault.jpg`
      : '/placeholder.svg';
  };

  const openPlaylist = (url: string) => {
    window.open(url, '_blank');
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist["Título"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Videoaulas</h1>
          </div>
        </div>
        
        <div className="p-4">
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
        </div>
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
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Playlists Grid - 2 per row */}
        <div className="grid grid-cols-2 gap-3">
          {filteredPlaylists.map((playlist) => (
            <Card
              key={playlist.id}
              className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300"
              onClick={() => openPlaylist(playlist.Link)}
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${extractPlaylistId(playlist.Link)}/maxresdefault.jpg`}
                  alt={playlist["Título"]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <Play className="h-6 w-6 text-white ml-0.5" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-3">
                <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {playlist["Título"]}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlaylists.length === 0 && (
          <Card className="text-center p-8">
            <h3 className="font-semibold mb-2">Nenhuma playlist encontrada</h3>
            <p className="text-muted-foreground text-sm">
              Tente buscar por outro termo.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};