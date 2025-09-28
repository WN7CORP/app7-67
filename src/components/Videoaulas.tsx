import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Play, User, Clock, Eye } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ProfessoraIAFloatingButton } from '@/components/ProfessoraIAFloatingButton';
import { useYouTubePlaylist, YouTubePlaylist } from '@/hooks/useYouTubePlaylist';
import { VideoPlayer } from '@/components/VideoPlayer';

interface VideoPlaylistData {
  id: number;
  area: string;
  link: string;
}

interface PlaylistData {
  area: string;
  playlists: VideoPlaylistData[];
}

export const Videoaulas = () => {
  const { setCurrentFunction } = useNavigation();
  const [videoData, setVideoData] = useState<PlaylistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaylistUrl, setSelectedPlaylistUrl] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('');

  const { playlist: youtubePlaylist, loading: playlistLoading } = useYouTubePlaylist(selectedPlaylistUrl);

  useEffect(() => {
    loadVideoData();
  }, []);

  const loadVideoData = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('VIDEOS-AULAS-FINAL')
        .select('*')
        .order('area', { ascending: true });

      if (error) throw error;

      // Agrupar por área
      const groupedData: { [area: string]: VideoPlaylistData[] } = {};
      
      data?.forEach((item: VideoPlaylistData) => {
        if (!item.area) return;
        
        if (!groupedData[item.area]) {
          groupedData[item.area] = [];
        }
        
        groupedData[item.area].push(item);
      });

      // Converter para formato de playlist
      const playlistData: PlaylistData[] = Object.entries(groupedData).map(([area, playlists]) => ({
        area,
        playlists
      }));

      setVideoData(playlistData);
    } catch (error) {
      console.error('Erro ao carregar videoaulas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as videoaulas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentFunction(null);
  };

  const handlePlaylistClick = (playlist: VideoPlaylistData) => {
    setSelectedPlaylistUrl(playlist.link);
    setSelectedArea(playlist.area);
  };

  const handlePlaylistBack = () => {
    setSelectedPlaylistUrl(null);
    setSelectedArea('');
  };

  const formatViewCount = (count: string): string => {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return count;
  };

  const filteredData = videoData.map(areaData => ({
    ...areaData,
    playlists: areaData.playlists.filter(playlist => 
      playlist.area.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(areaData => areaData.playlists.length > 0);

  // Se uma playlist está selecionada, mostrar os vídeos
  if (selectedPlaylistUrl && youtubePlaylist) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlaylistBack}
              className="flex items-center gap-2 hover:bg-accent/80"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {selectedArea}
            </h1>
          </div>
        </div>

        {/* Playlist Content */}
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            {/* Playlist Header */}
            <div className="mb-8 text-center">
              <img
                src={youtubePlaylist.thumbnail}
                alt={youtubePlaylist.title}
                className="w-32 h-24 mx-auto mb-4 rounded-lg object-cover"
              />
              <h2 className="text-2xl font-bold mb-2">{youtubePlaylist.title}</h2>
              <p className="text-muted-foreground mb-2">{youtubePlaylist.channelTitle}</p>
              <p className="text-sm text-muted-foreground">
                {youtubePlaylist.videoCount} vídeos
              </p>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youtubePlaylist.videos.map((video, index) => (
                <Card 
                  key={video.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => window.open(video.url, '_blank')}
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-primary rounded-full p-3">
                        <Play className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>

                    {/* Position */}
                    <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatViewCount(video.viewCount)} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{video.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Button */}
        <ProfessoraIAFloatingButton onOpen={() => {}} />
      </div>
    );
  }

  // Loading state para playlist específica
  if (selectedPlaylistUrl && playlistLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando playlist...</p>
        </div>
      </div>
    );
  }

  // Loading state inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando videoaulas...</p>
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
          <h1 className="ml-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Videoaulas
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar áreas ou videoaulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Areas Count */}
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            {filteredData.length} áreas de estudo disponíveis
          </p>
        </div>

        {/* Video Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredData.map((areaData) => (
            <div key={areaData.area} className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-center">{areaData.area}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areaData.playlists.map((playlist) => (
                  <Card 
                    key={playlist.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handlePlaylistClick(playlist)}
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/10">
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-16 w-16 text-primary/50" />
                      </div>
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-primary rounded-full p-4">
                          <Play className="h-8 w-8 text-primary-foreground" />
                        </div>
                      </div>

                      {/* YouTube indicator */}
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        YouTube
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {playlist.area}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Playlist Jurídica</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Button */}
        <ProfessoraIAFloatingButton onOpen={() => {}} />

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma videoaula encontrada</h3>
            <p className="text-muted-foreground">
              Tente ajustar os termos de busca.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};