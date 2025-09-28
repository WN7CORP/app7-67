import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { VideoAreasGridOptimized } from '@/components/VideoAreasGridOptimized';

export const Videoaulas = () => {
  const { setCurrentFunction } = useNavigation();
  

  const handleBack = () => {
    setCurrentFunction(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Consistente */}
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
      
      {/* Main Content */}
      <div className="pb-4">
        <VideoAreasGridOptimized />
      </div>
      
    </div>
  );
};