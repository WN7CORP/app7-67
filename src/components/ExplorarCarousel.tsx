import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, BookOpen, Video, Newspaper, Radar, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/context/NavigationContext';
import { useAppFunctions } from '@/hooks/useAppFunctions';
import { supabase } from '@/integrations/supabase/client';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
  function: string;
  icon: any;
  type: 'curso' | 'livro' | 'funcionalidade';
}

export const ExplorarCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [items, setItems] = useState<CarouselItem[]>([]);
  const { setCurrentFunction, setIsExplorarOpen } = useNavigation();

  // Carregar dados reais do Supabase
  useEffect(() => {
    const loadCarouselData = async () => {
      try {
        // Buscar cursos
        const { data: cursos } = await supabase
          .from('CURSOS-APP-VIDEO')
          .select('*')
          .limit(3);

        // Buscar livros da biblioteca
        const { data: livros } = await supabase
          .from('BIBLIOTECA-JURIDICA')
          .select('*')
          .limit(4);

        // Buscar capas de funções
        const { data: capasFuncoes } = await supabase
          .from('CAPAS-FUNÇÃO')
          .select('*');

        const carouselData: CarouselItem[] = [];

        // Adicionar cursos
        if (cursos) {
          cursos.forEach(curso => {
            if (curso.capa) {
              carouselData.push({
                id: `curso-${curso.id}`,
                title: curso.Tema || 'Curso Preparatório',
                description: curso.Assunto || 'Videoaulas especializadas',
                image: curso.capa,
                function: 'Cursos Preparatórios',
                icon: GraduationCap,
                type: 'curso'
              });
            }
          });
        }

        // Adicionar livros
        if (livros) {
          livros.forEach(livro => {
            if (livro.imagem) {
              carouselData.push({
                id: `livro-${livro.id}`,
                title: livro.livro || 'Biblioteca Jurídica',
                description: livro.sobre || 'Acervo completo de livros jurídicos',
                image: livro.imagem,
                function: 'Biblioteca Clássicos',
                icon: BookOpen,
                type: 'livro'
              });
            }
          });
        }

        // Adicionar funcionalidades com capas
        const funcionalidades = [
          {
            id: 'blog',
            title: 'Blog Jurídico',
            description: 'Artigos e análises especializadas',
            function: 'Blog Jurídico',
            icon: Newspaper
          },
          {
            id: 'radar',
            title: 'Radar Jurídico',
            description: 'Monitore tendências e mudanças',
            function: 'Radar Jurídico',
            icon: Radar
          },
          {
            id: 'videoaulas',
            title: 'Videoaulas',
            description: 'Aulas com professores especializados',
            function: 'Videoaulas',
            icon: Video
          }
        ];

        funcionalidades.forEach(func => {
          const capa = capasFuncoes?.find(c => 
            c['Função']?.toLowerCase().includes(func.title.toLowerCase())
          );
          
          carouselData.push({
            id: func.id,
            title: func.title,
            description: func.description,
            image: capa?.capa || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
            function: func.function,
            icon: func.icon,
            type: 'funcionalidade'
          });
        });

        setItems(carouselData);
      } catch (error) {
        console.error('Erro ao carregar dados do carrossel:', error);
      }
    };

    loadCarouselData();
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % items.length);
  }, [items.length]);

  const handleItemClick = useCallback((item: CarouselItem) => {
    setCurrentFunction(item.function);
    setIsExplorarOpen(false);
  }, [setCurrentFunction, setIsExplorarOpen]);

  const handleClose = useCallback(() => {
    setIsExplorarOpen(false);
  }, [setIsExplorarOpen]);

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 bg-background-deep/95 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const Icon = currentItem.icon;

  return (
    <div className="fixed inset-0 bg-background-deep/95 backdrop-blur-md z-50 flex flex-col">
      {/* Header minimalista */}
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Explorar Funcionalidades</h1>
            <p className="text-sm text-muted-foreground">Descubra todas as ferramentas disponíveis</p>
          </div>
        </div>
        <Button 
          onClick={handleClose}
          variant="ghost" 
          size="sm"
          className="rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Carrossel compacto */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto relative">
          {/* Card principal */}
          <div 
            onClick={() => handleItemClick(currentItem)}
            className="relative w-full h-80 rounded-2xl overflow-hidden cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-300"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: `url(${currentItem.image})`,
                filter: 'brightness(0.7) contrast(1.1)'
              }}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2 drop-shadow-lg">
                  {currentItem.title}
                </h3>
                <p className="text-sm text-white/90 drop-shadow-md line-clamp-2">
                  {currentItem.description}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/90 backdrop-blur-sm border-border/50 text-foreground hover:bg-background w-10 h-10 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleNext}
            variant="outline"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-background/90 backdrop-blur-sm border-border/50 text-foreground hover:bg-background w-10 h-10 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-8">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${index === currentIndex 
                ? 'bg-primary scale-125' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }
            `}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute bottom-4 right-4">
        <div className={`
          px-2 py-1 rounded-lg text-xs font-medium transition-colors
          ${isAutoPlaying 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-muted/20 text-muted-foreground border border-border/30'
          }
        `}>
          {isAutoPlaying ? 'Auto-play ativo' : 'Pausado'}
        </div>
      </div>
    </div>
  );
};