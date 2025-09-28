import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Play, Users, Clock } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useYouTubeVideoaulas } from '@/hooks/useYouTubeVideoaulas';
import { ProfessoraIAFloatingButton } from '@/components/ProfessoraIAFloatingButton';
import { VideoSummaryButton } from '@/components/VideoSummaryButton';
import { motion } from 'framer-motion';

export const Videoaulas = () => {
  const { setCurrentFunction } = useNavigation();
  const { playlists, loading, error } = useYouTubeVideoaulas();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfessoraIA, setShowProfessoraIA] = useState(false);

  const handleBack = () => {
    setCurrentFunction(null);
  };

  const handlePlaylistClick = (link: string) => {
    window.open(link, '_blank');
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando playlists...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
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
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-destructive">Erro ao carregar videoaulas: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center h-14 px-4">
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
        
        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar áreas ou videoaulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4">
          {filteredPlaylists.length} áreas de estudo disponíveis
        </p>
      </div>

      {/* Playlists Grid - 2 por linha */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlaylists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => handlePlaylistClick(playlist.link)}
            >
              <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5">
                  {playlist.thumbnailUrl ? (
                    <img
                      src={playlist.thumbnailUrl}
                      alt={playlist.area}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-12 w-12 text-primary opacity-60" />
                    </div>
                  )}
                  
                  {/* Video Count Badge */}
                  {playlist.videoCount > 0 && (
                    <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {playlist.videoCount} vídeo{playlist.videoCount !== 1 ? 's' : ''}
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-3">
                      <Play className="h-6 w-6 text-black" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {playlist.area}
                  </h3>
                  
                  {playlist.channelTitle && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{playlist.channelTitle}</span>
                    </div>
                  )}
                  
                  {playlist.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {playlist.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    {playlist.videoCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        <span>{playlist.videoCount} vídeos</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Buttons */}
      <ProfessoraIAFloatingButton onOpen={() => setShowProfessoraIA(true)} />
      <VideoSummaryButton />
    </div>
  );
};