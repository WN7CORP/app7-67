import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Search, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useLivrosPorProfissaoOAB } from '@/hooks/useBibliotecaOAB';
import { BibliotecaProfissoesOAB } from './BibliotecaProfissoesOAB';
import { BibliotecaAreasOAB } from './BibliotecaAreasOAB';
import { BibliotecaLista } from './BibliotecaLista';
import { BibliotecaLeitor } from './BibliotecaLeitor';
import { SearchPreviewBar } from './SearchPreviewBar';
import { JuridicalBookCard } from './JuridicalBookCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface LivroJuridico {
  id: number;
  imagem: string;
  livro: string;
  autor?: string;
  area: string;
  sobre?: string;
  link?: string;
  download?: string;
  Profissões?: string;
  'profissões-area'?: string;
  'capa-profissao'?: string;
}

type ViewMode = 'profissoes' | 'areas' | 'lista' | 'leitor' | 'busca';

export const BibliotecaExameOAB = () => {
  const { setCurrentFunction } = useNavigation();
  const { livrosPorProfissao, profissoesOAB, livros, isLoading, error } = useLivrosPorProfissaoOAB();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('profissoes');
  const [selectedProfissao, setSelectedProfissao] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<LivroJuridico | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleBack = () => {
    if (viewMode === 'leitor') {
      setViewMode('lista');
      setSelectedBook(null);
    } else if (viewMode === 'lista') {
      setViewMode('areas');
      setSelectedArea(null);
    } else if (viewMode === 'areas') {
      setViewMode('profissoes');
      setSelectedProfissao(null);
    } else if (viewMode === 'busca') {
      setViewMode('profissoes');
      setSearchTerm('');
    } else {
      setCurrentFunction(null);
    }
  };

  const handleProfissaoClick = (profissao: string) => {
    setSelectedProfissao(profissao);
    setViewMode('areas');
  };

  const handleAreaClick = (area: string) => {
    setSelectedArea(area);
    setViewMode('lista');
  };

  const handleBookClick = (livro: LivroJuridico) => {
    setSelectedBook(livro);
    setViewMode('leitor');
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      setViewMode('busca');
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case 'profissoes':
        return 'Biblioteca Exame da Ordem - OAB';
      case 'areas':
        return selectedProfissao ? `${selectedProfissao} - Áreas` : 'Áreas da OAB';
      case 'lista':
        return selectedArea || 'Lista de Livros';
      case 'leitor':
        return selectedBook?.livro || 'Leitor';
      case 'busca':
        return `Busca: "${searchTerm}"`;
      default:
        return 'Biblioteca Exame da Ordem - OAB';
    }
  };

  // Organizar livros por profissões da OAB a partir do hook
  const livrosPorProfissaoOAB = livrosPorProfissao;

  // Filtrar livros por busca global
  const filteredBooks = searchTerm
    ? livros.filter(livro => 
        livro.livro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livro.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (livro.autor && livro.autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (livro.sobre && livro.sobre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (livro.Profissões && livro.Profissões.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  if (error) {
    return (
      <div className="fixed inset-0 bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFunction(null)}
              className="flex items-center gap-2 hover:bg-accent/80"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Biblioteca Exame da Ordem - OAB</h1>
          </div>
        </div>
        
        <div className="pt-14 h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar a biblioteca</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Leitor em tela cheia
  if (viewMode === 'leitor' && selectedBook) {
    return (
      <AnimatePresence mode="wait">
        <BibliotecaLeitor
          livro={selectedBook}
          onClose={handleBack}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="fixed inset-0 bg-background">
      {/* Header Consistente */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            {viewMode === 'lista' ? 'Áreas' : viewMode === 'areas' ? 'Profissões' : 'Voltar'}
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="pt-14 h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Barra de busca global - só quando selecionada uma profissão */}
          {viewMode === 'areas' && (
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <SearchPreviewBar
                          placeholder="Pesquisar em toda a biblioteca..."
                          data={livros}
                          searchFields={['Profissões', 'livro', 'autor', 'area']}
                          onItemClick={(livro) => {
                            if (livro.Profissões) {
                              const oabProfissoes = livro.Profissões.split(',')
                                .map(p => p.trim())
                                .filter(p => p.toLowerCase().includes('oab'));
                              if (oabProfissoes.length > 0) {
                                handleProfissaoClick(oabProfissoes[0]);
                              }
                            }
                          }}
                          className="pl-10"
                        />
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === 'profissoes' && (
                <motion.div
                  key="profissoes"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BibliotecaProfissoesOAB
                    livrosPorProfissao={livrosPorProfissaoOAB}
                    profissoesOAB={profissoesOAB}
                    onProfissaoClick={handleProfissaoClick}
                  />
                </motion.div>
              )}

              {viewMode === 'areas' && selectedProfissao && (
                <motion.div
                  key="areas"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Áreas - {selectedProfissao}</h2>
                      <p className="text-muted-foreground">
                        Escolha a área específica para ver os livros
                      </p>
                    </div>
                    <motion.div 
                      className="grid grid-cols-2 gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {livrosPorProfissaoOAB[selectedProfissao]?.livros
                        .reduce((areas: string[], livro) => {
                          if (livro.area && !areas.includes(livro.area)) {
                            areas.push(livro.area);
                          }
                          return areas;
                        }, [])
                        .map((area, index) => (
                          <motion.div
                            key={area}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card 
                              className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-border/50"
                              onClick={() => handleAreaClick(area)}
                            >
                              <CardContent className="p-4">
                                <div className="aspect-[3/4] mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 relative">
                                  <div className="flex items-center justify-center h-full">
                                    <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                                  </div>
                                  <div className="absolute top-2 right-2">
                                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                                      {livrosPorProfissaoOAB[selectedProfissao]?.livros.filter(l => l.area === area).length} livros
                                    </Badge>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                    {area}
                                  </h3>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {viewMode === 'lista' && selectedArea && selectedProfissao && (
                <motion.div
                  key="lista"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BibliotecaLista
                    area={selectedArea}
                    livros={livrosPorProfissaoOAB[selectedProfissao]?.livros.filter(l => l.area === selectedArea) || []}
                    onBack={handleBack}
                    onBookClick={handleBookClick}
                  />
                </motion.div>
              )}

              {viewMode === 'busca' && (
                <motion.div
                  key="busca"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <h2 className="text-xl font-bold mb-4">
                      Resultados da busca "{searchTerm}"
                    </h2>
                    {filteredBooks.length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                          Nenhum livro encontrado
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Tente buscar com outros termos ou verifique a ortografia
                        </p>
                      </div>
                    ) : (
                      <motion.div 
                        className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {filteredBooks.map((livro) => (
                          <motion.div
                            key={livro.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <JuridicalBookCard 
                              livro={livro} 
                              showAreaBadge={true}
                              onClick={() => handleBookClick(livro)}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
      
    </div>
  );
};