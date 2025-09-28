import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Search, Clock, Eye } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface VideoData {
  id: number;
  area: string;
  link: string;
  youtube?: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    publishedAt: string;
    channelTitle: string;
  };
}

export const Videoaulas = () => {
  const { setCurrentFunction } = useNavigation();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('youtube-api', {
        body: { 
          action: 'getVideosFromDatabase'
        }
      });

      if (error) throw error;
      
      setVideos(data.videos || []);
    } catch (err) {
      console.error('Erro ao carregar vídeos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedArea) {
      setSelectedArea('');
    } else {
      setCurrentFunction(null);
    }
  };

  const openVideo = (url: string) => {
    window.open(url, '_blank');
  };

  // Agrupar vídeos por área
  const videosByArea = useMemo(() => {
    const grouped: { [key: string]: VideoData[] } = {};
    
    videos.forEach(video => {
      if (!grouped[video.area]) {
        grouped[video.area] = [];
      }
      grouped[video.area].push(video);
    });
    
    return grouped;
  }, [videos]);

  // Filtrar áreas por busca
  const filteredAreas = useMemo(() => {
    if (!searchTerm) return videosByArea;
    
    const filtered: { [key: string]: VideoData[] } = {};
    Object.entries(videosByArea).forEach(([area, areaVideos]) => {
      if (area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          areaVideos.some(video => 
            video.youtube?.title?.toLowerCase().includes(searchTerm.toLowerCase())
          )) {
        filtered[area] = areaVideos;
      }
    });
    
    return filtered;
  }, [videosByArea, searchTerm]);

  // Vídeos da área selecionada
  const selectedAreaVideos = useMemo(() => {
    if (!selectedArea) return [];
    return videosByArea[selectedArea]?.filter(video =>
      !searchTerm || video.youtube?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [selectedArea, videosByArea, searchTerm]);

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
          <h1 className="ml-4 text-lg font-semibold">
            {selectedArea || 'Videoaulas'}
          </h1>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={selectedArea ? "Buscar vídeos..." : "Buscar áreas..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {!selectedArea ? (
          // Áreas Grid
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(filteredAreas).map(([area, areaVideos]) => {
              const firstVideo = areaVideos[0];
              const thumbnail = firstVideo?.youtube?.thumbnail || '/placeholder.svg';
              
              return (
                <Card
                  key={area}
                  className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300"
                  onClick={() => setSelectedArea(area)}
                >
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img
                      src={thumbnail}
                      alt={area}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    
                    {/* Badge com contagem */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-600/90 text-white text-xs">
                        {areaVideos.length} vídeo{areaVideos.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                        <Play className="h-6 w-6 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {area}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // Vídeos da área selecionada
          <div className="grid grid-cols-2 gap-3">
            {selectedAreaVideos.map((video) => (
              <Card
                key={video.id}
                className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300"
                onClick={() => openVideo(video.link)}
              >
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img
                    src={video.youtube?.thumbnail || '/placeholder.svg'}
                    alt={video.youtube?.title || `Vídeo ${video.id}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Duration badge */}
                  {video.youtube?.duration && (
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-black/80 text-white text-xs">
                        {video.youtube.duration}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                      <Play className="h-6 w-6 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1">
                    {video.youtube?.title || `Vídeo ${video.id}`}
                  </h3>
                  
                  {video.youtube?.channelTitle && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {video.youtube.channelTitle}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    {video.youtube?.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.youtube.duration}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {((selectedArea && selectedAreaVideos.length === 0) || 
          (!selectedArea && Object.keys(filteredAreas).length === 0)) && (
          <Card className="text-center p-8">
            <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground text-sm">
              {searchTerm 
                ? "Tente buscar por outro termo."
                : "Não há vídeos disponíveis no momento."
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};