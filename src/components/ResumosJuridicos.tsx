import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookText, Search, Loader2 } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useResumosPorArea } from '@/hooks/useResumosJuridicos';
import { ResumosAreas } from './ResumosAreas';
import { ResumosTemas } from './ResumosTemas';
import { ResumosSubtemas } from './ResumosSubtemas';
import { ResumosVisualizacao } from './ResumosVisualizacao';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import type { SubtemaResumo } from '@/hooks/useResumosJuridicos';

type ViewMode = 'areas' | 'temas' | 'subtemas' | 'visualizacao' | 'busca';

export const ResumosJuridicos = () => {
  const { setCurrentFunction } = useNavigation();
  const { resumosPorArea, areas, resumos, isLoading, error } = useResumosPorArea();
  const [viewMode, setViewMode] = useState<ViewMode>('areas');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedTema, setSelectedTema] = useState<string | null>(null);
  const [selectedSubtema, setSelectedSubtema] = useState<SubtemaResumo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleBack = () => {
    if (viewMode === 'visualizacao') {
      setViewMode('subtemas');
      setSelectedSubtema(null);
    } else if (viewMode === 'subtemas') {
      setViewMode('temas');
      setSelectedTema(null);
    } else if (viewMode === 'temas') {
      setViewMode('areas');
      setSelectedArea(null);
    } else if (viewMode === 'busca') {
      setViewMode('areas');
      setSearchTerm('');
    } else {
      setCurrentFunction(null);
    }
  };

  const handleAreaClick = (area: string) => {
    setSelectedArea(area);
    setViewMode('temas');
  };

  const handleTemaClick = (tema: string) => {
    setSelectedTema(tema);
    setViewMode('subtemas');
  };

  const handleSubtemaClick = (subtema: SubtemaResumo) => {
    setSelectedSubtema(subtema);
    setViewMode('visualizacao');
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      setViewMode('busca');
    }
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case 'areas':
        return 'Resumos Jurídicos';
      case 'temas':
        return selectedArea || 'Temas';
      case 'subtemas':
        return selectedTema || 'Subtemas';
      case 'visualizacao':
        return selectedSubtema?.subtema || 'Resumo';
      case 'busca':
        return `Busca: "${searchTerm}"`;
      default:
        return 'Resumos Jurídicos';
    }
  };

  // Filtrar resumos por busca global
  const filteredResumos = searchTerm
    ? resumos.filter(resumo => 
        resumo.tema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resumo.subtema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resumo.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resumo.resumoDetalhado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resumo.resumoStorytelling?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resumo.resumoCompacto?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="ml-4 text-lg font-semibold">Resumos Jurídicos</h1>
          </div>
        </div>
        
        <div className="pt-14 h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar os resumos</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Visualização em tela cheia
  if (viewMode === 'visualizacao' && selectedSubtema) {
    return (
      <AnimatePresence mode="wait">
        <ResumosVisualizacao
          subtema={selectedSubtema}
          area={selectedArea || "Direito"}
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
            {viewMode === 'temas' ? 'Áreas' : viewMode === 'subtemas' ? 'Temas' : 'Voltar'}
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <BookText className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="pt-14 h-full overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Barra de busca global - só nas áreas */}
          {viewMode === 'areas' && (
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar resumos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
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
              {viewMode === 'areas' && (
                <motion.div
                  key="areas"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResumosAreas
                    resumosPorArea={resumosPorArea}
                    areas={areas}
                    onAreaClick={handleAreaClick}
                  />
                </motion.div>
              )}

              {viewMode === 'temas' && selectedArea && (
                <motion.div
                  key="temas"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResumosTemas
                    area={selectedArea}
                    temas={resumosPorArea[selectedArea] || {}}
                    onTemaClick={handleTemaClick}
                  />
                </motion.div>
              )}

              {viewMode === 'subtemas' && selectedArea && selectedTema && (
                <motion.div
                  key="subtemas"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResumosSubtemas
                    tema={selectedTema}
                    subtemas={resumosPorArea[selectedArea]?.[selectedTema]?.subtemas || []}
                    onSubtemaClick={handleSubtemaClick}
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
                    {filteredResumos.length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                          Nenhum resumo encontrado
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Tente buscar com outros termos
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredResumos.map((resumo) => (
                          <div
                            key={resumo.id}
                            className="p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => handleSubtemaClick({
                              id: resumo.id,
                              subtema: resumo.subtema,
                              ordemSubtema: resumo.ordemSubtema,
                              resumoDetalhado: resumo.resumoDetalhado,
                              resumoStorytelling: resumo.resumoStorytelling,
                              resumoCompacto: resumo.resumoCompacto,
                            })}
                          >
                            <div className="flex items-start gap-3">
                              <BookText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{resumo.subtema}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {resumo.area} › {resumo.tema}
                                </p>
                                <p className="text-sm line-clamp-2">
                                  {resumo.resumoCompacto}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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