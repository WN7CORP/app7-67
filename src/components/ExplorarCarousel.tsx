import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, BookOpen, Video, Newspaper, Radar, GraduationCap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/context/NavigationContext';
import { useAppFunctions } from '@/hooks/useAppFunctions';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'curso' | 'livro' | 'blog' | 'noticia' | 'radar';
  function: string;
  size: 'large' | 'medium' | 'small';
}

const carouselItems: CarouselItem[] = [
  {
    id: 'cursos-1',
    title: 'Cursos Preparatórios',
    description: 'Videoaulas completas para concursos e OAB',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop&crop=center',
    category: 'curso',
    function: 'Cursos Preparatórios',
    size: 'large'
  },
  {
    id: 'biblioteca-1',
    title: 'Biblioteca Jurídica',
    description: 'Milhares de livros e doutrinas organizadas',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&crop=center',
    category: 'livro',
    function: 'Biblioteca Clássicos',
    size: 'large'
  },
  {
    id: 'videoaulas-1',
    title: 'Videoaulas Especializadas',
    description: 'Aulas com professores renomados',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop&crop=center',
    category: 'curso',
    function: 'Videoaulas',
    size: 'medium'
  },
  {
    id: 'blog-1',
    title: 'Blog Jurídico',
    description: 'Artigos e análises atualizadas',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=300&fit=crop&crop=center',
    category: 'blog',
    function: 'Blog Jurídico',
    size: 'medium'
  },
  {
    id: 'noticias-1',
    title: 'Notícias Comentadas',
    description: 'Últimas novidades do mundo jurídico',
    image: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=500&h=250&fit=crop&crop=center',
    category: 'noticia',
    function: 'Notícias Comentadas',
    size: 'small'
  },
  {
    id: 'radar-1',
    title: 'Radar Jurídico',
    description: 'Monitore tendências e mudanças',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=250&fit=crop&crop=center',
    category: 'radar',
    function: 'Radar Jurídico',
    size: 'small'
  },
  {
    id: 'biblioteca-2',
    title: 'Fora da Toga',
    description: 'Desenvolvimento pessoal para juristas',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop&crop=center',
    category: 'livro',
    function: 'Fora da Toga',
    size: 'medium'
  },
  {
    id: 'mapas-1',
    title: 'Mapas Mentais',
    description: 'Visualize conexões entre institutos jurídicos',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=300&fit=crop&crop=center',
    category: 'curso',
    function: 'Mapas Mentais',
    size: 'medium'
  }
];

export const ExplorarCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { setCurrentFunction, setIsExplorarOpen } = useNavigation();

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % carouselItems.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + carouselItems.length) % carouselItems.length);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % carouselItems.length);
  }, []);

  const handleItemClick = useCallback((item: CarouselItem) => {
    setCurrentFunction(item.function);
    setIsExplorarOpen(false);
  }, [setCurrentFunction, setIsExplorarOpen]);

  const handleClose = useCallback(() => {
    setIsExplorarOpen(false);
  }, [setIsExplorarOpen]);

  const getCategoryIcon = (category: CarouselItem['category']) => {
    switch (category) {
      case 'curso': return GraduationCap;
      case 'livro': return BookOpen;
      case 'blog': return Newspaper;
      case 'noticia': return Newspaper;
      case 'radar': return Radar;
      default: return Brain;
    }
  };

  const getCategoryColor = (category: CarouselItem['category']) => {
    switch (category) {
      case 'curso': return 'from-blue-500 to-blue-700';
      case 'livro': return 'from-green-500 to-green-700';
      case 'blog': return 'from-purple-500 to-purple-700';
      case 'noticia': return 'from-orange-500 to-orange-700';
      case 'radar': return 'from-red-500 to-red-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getItemSize = (size: CarouselItem['size']) => {
    switch (size) {
      case 'large': return 'h-80 col-span-2';
      case 'medium': return 'h-60 col-span-1';
      case 'small': return 'h-40 col-span-1';
      default: return 'h-60 col-span-1';
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background-deep via-background to-background-light z-50 overflow-hidden">
      {/* Header com botão de fechar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-background-deep/95 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent-legal/20">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Explorar Funcionalidades</h1>
              <p className="text-muted-foreground">Descubra todas as ferramentas disponíveis</p>
            </div>
          </div>
          <Button 
            onClick={handleClose}
            variant="outline" 
            size="lg"
            className="rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Carousel principal */}
      <div className="pt-32 pb-20 px-8 h-full overflow-y-auto">
        <div 
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Grid do carousel */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {carouselItems.map((item, index) => {
              const Icon = getCategoryIcon(item.category);
              const isVisible = Math.abs(index - currentIndex) <= 2 || 
                               Math.abs(index - currentIndex) >= carouselItems.length - 2;
              
              return (
                <div
                  key={item.id}
                  className={`
                    ${getItemSize(item.size)} ${isVisible ? 'opacity-100' : 'opacity-60'}
                    relative overflow-hidden rounded-2xl cursor-pointer
                    transition-all duration-500 transform hover:scale-105
                    shadow-elegant hover:shadow-interactive
                    ${index === currentIndex ? 'ring-2 ring-primary/50 scale-105' : ''}
                  `}
                  onClick={() => handleItemClick(item)}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Background image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${item.image})`,
                      filter: 'brightness(0.4) contrast(1.1)'
                    }}
                  />
                  
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(item.category)}/90`} />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      {index === currentIndex && (
                        <div className="animate-pulse">
                          <div className="w-3 h-3 bg-primary rounded-full" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-2 drop-shadow-lg">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/90 drop-shadow-md line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>
              );
            })}
          </div>

          {/* Navigation arrows */}
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="lg"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/20 backdrop-blur-sm border-white/20 text-white hover:bg-background/40"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            onClick={handleNext}
            variant="outline"
            size="lg"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/20 backdrop-blur-sm border-white/20 text-white hover:bg-background/40"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${index === currentIndex 
                ? 'bg-primary scale-125' 
                : 'bg-white/30 hover:bg-white/50'
              }
            `}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute bottom-20 right-8">
        <div className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${isAutoPlaying 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }
        `}>
          {isAutoPlaying ? 'Auto-play ativo' : 'Auto-play pausado'}
        </div>
      </div>
    </div>
  );
};