import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Play, FileText, MessageCircle, User } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ProfessoraIAFloatingButton } from '@/components/ProfessoraIAFloatingButton';

interface VideoArea {
  id: number;
  Area: string;
  Tema: string;
  Modulo: string;
  Aula: string;
  Assunto: string;
  video: string;
  material: string;
  conteudo: string;
  'capa-area': string;
  'capa-modulo': string;
  capa: string;
}

interface PlaylistData {
  area: string;
  playlists: {
    modulo: string;
    videos: VideoArea[];
    thumbnail: string;
  }[];
}

export const Videoaulas = () => {
  const { setCurrentFunction } = useNavigation();
  const [videoData, setVideoData] = useState<PlaylistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoArea | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    loadVideoData();
  }, []);

  const loadVideoData = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('CURSOS-APP-VIDEO')
        .select('*')
        .order('Area', { ascending: true })
        .order('Modulo', { ascending: true });

      if (error) throw error;

      // Agrupar por área e módulo
      const groupedData: { [area: string]: { [modulo: string]: VideoArea[] } } = {};
      
      data?.forEach((item: VideoArea) => {
        if (!item.Area || !item.Modulo) return;
        
        if (!groupedData[item.Area]) {
          groupedData[item.Area] = {};
        }
        
        if (!groupedData[item.Area][item.Modulo]) {
          groupedData[item.Area][item.Modulo] = [];
        }
        
        groupedData[item.Area][item.Modulo].push(item);
      });

      // Converter para formato de playlist
      const playlistData: PlaylistData[] = Object.entries(groupedData).map(([area, modulos]) => ({
        area,
        playlists: Object.entries(modulos).map(([modulo, videos]) => ({
          modulo,
          videos,
          thumbnail: videos[0]?.capa || videos[0]?.['capa-modulo'] || ''
        }))
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

  const handlePlaylistClick = (playlist: any, area: string) => {
    const playlistData = {
      title: playlist.modulo,
      videos: playlist.videos.map((video: VideoArea) => ({
        id: video.video?.split('v=')[1]?.split('&')[0] || '',
        title: video.Assunto || video.Aula,
        description: video.conteudo || '',
        thumbnail: `https://img.youtube.com/vi/${video.video?.split('v=')[1]?.split('&')[0]}/mqdefault.jpg`,
        duration: '15:00', // placeholder
        channelTitle: 'Canal Jurídico',
        publishedAt: new Date().toISOString(),
        url: video.video
      })),
      area
    };

    setSelectedPlaylist(playlistData);
    if (playlist.videos.length > 0) {
      setSelectedVideo(playlist.videos[0]);
    }
  };

  const handleVideoBack = () => {
    setSelectedVideo(null);
    setSelectedPlaylist(null);
  };

  const generateSummary = async () => {
    if (!selectedVideo) return;

    setLoadingSummary(true);
    try {
      const response = await fetch('/functions/v1/generate-video-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: selectedVideo.video,
          title: selectedVideo.Assunto || selectedVideo.Aula
        }),
      });

      const data = await response.json();
      setSummaryText(data.summary || "Resumo não disponível");
      setShowSummaryModal(true);
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      setSummaryText("Não foi possível gerar o resumo automaticamente. Este vídeo aborda conceitos importantes sobre " + (selectedVideo.Assunto || selectedVideo.Aula) + ". Assista ao vídeo completo para obter todas as informações detalhadas.");
      setShowSummaryModal(true);
    } finally {
      setLoadingSummary(false);
    }
  };

  const filteredData = videoData.map(area => ({
    ...area,
    playlists: area.playlists.filter(playlist => 
      playlist.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.area.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(area => area.playlists.length > 0);

  if (selectedVideo && selectedPlaylist) {
    return (
      <div className="min-h-screen bg-background">
        <VideoPlayer
          video={selectedVideo}
          playlist={selectedPlaylist}
          onBack={handleVideoBack}
          favorites={[]}
          onToggleFavorite={() => {}}
          watchedVideos={[]}
          onMarkAsWatched={() => {}}
        />
        
        {/* Floating Buttons */}
        <ProfessoraIAFloatingButton onOpen={() => {}} />
        
        {/* Summary Button */}
        <Button
          onClick={generateSummary}
          disabled={loadingSummary}
          className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
          size="sm"
        >
          <FileText className="h-6 w-6" />
        </Button>

        {/* Summary Modal */}
        {showSummaryModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Resumo do Vídeo</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSummaryModal(false)}
                  >
                    ✕
                  </Button>
                </div>
                <div className="overflow-y-auto max-h-96">
                  <p className="text-muted-foreground leading-relaxed">
                    {summaryText || "Gerando resumo..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

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
                {areaData.playlists.map((playlist, index) => (
                  <Card 
                    key={index}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handlePlaylistClick(playlist, areaData.area)}
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/10">
                      {playlist.thumbnail ? (
                        <img
                          src={playlist.thumbnail}
                          alt={playlist.modulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="h-16 w-16 text-primary/50" />
                        </div>
                      )}
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-primary rounded-full p-4">
                          <Play className="h-8 w-8 text-primary-foreground" />
                        </div>
                      </div>

                      {/* Video count badge */}
                      <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {playlist.videos.length} vídeo{playlist.videos.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {playlist.modulo}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Jurídico</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

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