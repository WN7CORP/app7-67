import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, PlayCircle, TrendingUp, BookOpen, 
  ChevronRight, Play, CheckCircle2 
} from 'lucide-react';

interface CourseCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  duration?: number;
  totalItems?: number;
  progress?: number;
  isCompleted?: boolean;
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const CourseCard = ({
  title,
  subtitle,
  description,
  image,
  duration = 0,
  totalItems = 0,
  progress = 0,
  isCompleted = false,
  onClick,
  className = "",
  variant = 'default'
}: CourseCardProps) => {
  
  if (variant === 'compact') {
    return (
      <Card 
        className={`cursor-pointer group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${className}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted relative">
              <img 
                src={image || '/placeholder.svg'} 
                alt={title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate mb-1">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate mb-2">{subtitle}</p>
              )}
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {duration > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{duration}min</span>
                  </div>
                )}
                {totalItems > 0 && (
                  <div className="flex items-center gap-1">
                    <PlayCircle className="h-3 w-3" />
                    <span>{totalItems}</span>
                  </div>
                )}
                {progress > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-primary font-medium">{progress}%</span>
                  </div>
                )}
              </div>

              {progress > 0 && (
                <div className="mt-2">
                  <Progress value={progress} className="h-1" />
                </div>
              )}
            </div>

            <div className="flex items-center">
              {isCompleted && (
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image || '/placeholder.svg'} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Overlay Content */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            {isCompleted && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Concluído
              </Badge>
            )}
            {progress > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {progress}% completo
              </Badge>
            )}
          </div>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2 leading-tight">{title}</h3>
        {subtitle && (
          <p className="text-lg text-muted-foreground mb-3">{subtitle}</p>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm">
            {totalItems > 0 && (
              <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                <PlayCircle className="w-3 h-3" />
                <span className="font-medium">{totalItems}</span>
              </div>
            )}
            {duration > 0 && (
              <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{duration}min</span>
              </div>
            )}
            {progress > 0 && (
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="font-medium text-primary">{progress}%</span>
              </div>
            )}
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};