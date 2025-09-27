import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle, XCircle, Lightbulb, BookOpen, Eye, Play, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigation } from '@/context/NavigationContext';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Flashcard {
  id: number;
  area: string;
  tema: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

const Flashcards = () => {
  const { setCurrentFunction } = useNavigation();
  const { toast } = useToast();
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'area' | 'categorias' | 'estudo'>('area');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mostrarExemplo, setMostrarExemplo] = useState(false);
  const [mostrarDica, setMostrarDica] = useState(false);
  const [dica, setDica] = useState('');
  const [corretos, setCorretos] = useState(0);
  const [incorretos, setIncorretos] = useState(0);
  const [revisados, setRevisados] = useState(0);
  const [progresso, setProgresso] = useState<{[key: number]: 'conhecido' | 'revisar'}>({});

  // Carregar flashcards do Supabase
  useEffect(() => {
    const carregarFlashcards = async () => {
      try {
        const { data, error } = await supabase
          .from('FLASHCARDS')
          .select('*')
          .order('id');

        if (error) throw error;
        
        setFlashcards(data || []);
        
        // Carregar progresso salvo
        const progressoSalvo = localStorage.getItem('flashcards-progresso');
        if (progressoSalvo) {
          setProgresso(JSON.parse(progressoSalvo));
        }
      } catch (error) {
        console.error('Erro ao carregar flashcards:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os flashcards",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    carregarFlashcards();
  }, [toast]);

  // Obter áreas únicas
  const areas = useMemo(() => {
    const uniqueAreas = [...new Set(flashcards.map(card => card.area))].filter(Boolean);
    return uniqueAreas.sort();
  }, [flashcards]);

  // Obter categorias da área selecionada
  const categorias = useMemo(() => {
    if (!selectedArea) return [];
    const categoriasArea = [...new Set(flashcards
      .filter(card => card.area === selectedArea)
      .map(card => card.tema)
    )].filter(Boolean);
    return categoriasArea.sort();
  }, [flashcards, selectedArea]);

  // Flashcards filtrados para estudo
  const flashcardsFiltrados = useMemo(() => {
    return flashcards.filter(card => {
      const areaMatch = card.area === selectedArea;
      const categoriaMatch = selectedCategorias.length === 0 || selectedCategorias.includes(card.tema);
      return areaMatch && categoriaMatch;
    });
  }, [flashcards, selectedArea, selectedCategorias]);

  const cardCorrente = flashcardsFiltrados[indiceAtual] || null;

  // Gerar dica com Gemini
  const gerarDica = async () => {
    if (!cardCorrente) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: `Gere uma dica útil e concisa para ajudar a responder esta pergunta jurídica: "${cardCorrente.pergunta}". A resposta é: "${cardCorrente.resposta}". Retorne apenas a dica, sem explicações adicionais.`
        }
      });

      if (error) throw error;
      
      const dicaGerada = data?.response || 'Dica não disponível no momento.';
      setDica(dicaGerada);
      setMostrarDica(true);
    } catch (error) {
      console.error('Erro ao gerar dica:', error);
      setDica('Revise os conceitos fundamentais da área.');
      setMostrarDica(true);
    }
  };

  // Salvar progresso
  const salvarProgresso = (novoProgresso: {[key: number]: 'conhecido' | 'revisar'}) => {
    localStorage.setItem('flashcards-progresso', JSON.stringify(novoProgresso));
    setProgresso(novoProgresso);
  };

  // Funções de navegação
  const handleConhecido = () => {
    if (!cardCorrente) return;
    const novoProgresso = { ...progresso, [cardCorrente.id]: 'conhecido' as const };
    salvarProgresso(novoProgresso);
    setCorretos(prev => prev + 1);
    setRevisados(prev => prev + 1);
    proximoCard();
  };

  const handleRevisar = () => {
    if (!cardCorrente) return;
    const novoProgresso = { ...progresso, [cardCorrente.id]: 'revisar' as const };
    salvarProgresso(novoProgresso);
    setIncorretos(prev => prev + 1);
    setRevisados(prev => prev + 1);
    proximoCard();
  };

  const proximoCard = () => {
    if (indiceAtual < flashcardsFiltrados.length - 1) {
      setIndiceAtual(prev => prev + 1);
    } else {
      setIndiceAtual(0);
    }
    setIsFlipped(false);
    setMostrarExemplo(false);
    setMostrarDica(false);
    setDica('');
  };

  const cardAnterior = () => {
    if (indiceAtual > 0) {
      setIndiceAtual(prev => prev - 1);
    } else {
      setIndiceAtual(flashcardsFiltrados.length - 1);
    }
    setIsFlipped(false);
    setMostrarExemplo(false);
    setMostrarDica(false);
    setDica('');
  };

  const virarCard = () => {
    setIsFlipped(!isFlipped);
  };

  const iniciarEstudo = () => {
    if (selectedCategorias.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos uma categoria para iniciar o estudo",
        variant: "destructive"
      });
      return;
    }
    
    setStep('estudo');
    setIndiceAtual(0);
    setIsFlipped(false);
    setMostrarExemplo(false);
    setMostrarDica(false);
    setDica('');
    setCorretos(0);
    setIncorretos(0);
    setRevisados(0);
  };

  const voltarParaAreas = () => {
    setStep('area');
    setSelectedArea('');
    setSelectedCategorias([]);
  };

  const voltarParaCategorias = () => {
    setStep('categorias');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8 text-primary">Flashcards Jurídicos</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
          </div>
          <p className="text-lg text-muted-foreground mt-4">Carregando flashcards...</p>
        </div>
      </div>
    );
  }

  // Seleção de Área
  if (step === 'area') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentFunction(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                Flashcards Jurídicos
              </h1>
              <p className="text-lg text-muted-foreground">
                Escolha a área de estudo
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {areas.map((area, index) => {
              const totalCards = flashcards.filter(card => card.area === area).length;
              return (
                <motion.div
                  key={area}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:from-primary/20 hover:to-primary/10 hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full"
                    onClick={() => {
                      setSelectedArea(area);
                      setStep('categorias');
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-primary">{area}</h3>
                          <p className="text-muted-foreground text-sm">
                            {totalCards} flashcards disponíveis
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {totalCards} cards
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Seleção de Categorias
  if (step === 'categorias') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={voltarParaAreas}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                {selectedArea}
              </h1>
              <p className="text-lg text-muted-foreground">
                Selecione as categorias para estudo
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedCategorias.length === categorias.length) {
                    setSelectedCategorias([]);
                  } else {
                    setSelectedCategorias([...categorias]);
                  }
                }}
              >
                {selectedCategorias.length === categorias.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedCategorias.length} de {categorias.length} selecionadas
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categorias.map((categoria, index) => {
                const totalCards = flashcards.filter(card => 
                  card.area === selectedArea && card.tema === categoria
                ).length;
                const isSelected = selectedCategorias.includes(categoria);

                return (
                  <motion.div
                    key={categoria}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategorias(prev => prev.filter(c => c !== categoria));
                      } else {
                        setSelectedCategorias(prev => [...prev, categoria]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={isSelected}
                        onChange={() => {}}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{categoria}</h4>
                        <p className="text-sm text-muted-foreground">
                          {totalCards} flashcards
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={iniciarEstudo}
              disabled={selectedCategorias.length === 0}
              className="flex items-center gap-2 px-8 py-3 text-lg"
            >
              <Play className="h-5 w-5" />
              Iniciar Estudo ({flashcardsFiltrados.length} cards)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Estudo dos Flashcards
  if (!cardCorrente) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Flashcards Jurídicos</h1>
          <p className="text-lg text-muted-foreground">
            Nenhum flashcard encontrado com os filtros selecionados.
          </p>
          <Button onClick={voltarParaCategorias} className="mt-4">
            Voltar para seleção
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={voltarParaCategorias}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary">
              {selectedArea}
            </h1>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {selectedCategorias.join(', ')}
            </p>
          </div>
        </div>

        {/* Flashcard Principal com Flip Animation */}
        <div className="relative mb-6" style={{ perspective: "1000px" }}>
          <motion.div
            key={indiceAtual}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ 
              duration: 0.6, 
              type: "spring", 
              stiffness: 260, 
              damping: 20 
            }}
            style={{ 
              transformStyle: "preserve-3d"
            }}
            className="relative w-full h-[400px]"
          >
            {/* Frente do Card */}
            <div 
              style={{ 
                transform: "rotateY(0deg)",
                backfaceVisibility: "hidden",
                position: "absolute",
                width: "100%",
                height: "100%"
              }}
              className={isFlipped ? "opacity-0" : "opacity-100"}
            >
              <Card className="h-full bg-gradient-to-br from-background to-muted/30 border-2">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{cardCorrente.area}</Badge>
                      <Badge variant="outline">{cardCorrente.tema}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {indiceAtual + 1} / {flashcardsFiltrados.length}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-full pb-6">
                  <div className="flex-1 flex flex-col justify-center text-center">
                    <h3 className="text-xl font-semibold mb-6 leading-relaxed">
                      {cardCorrente.pergunta}
                    </h3>
                  </div>
                  
                  {/* Botões na parte inferior */}
                  <div className="space-y-3">
                    <Button
                      onClick={gerarDica}
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-foreground text-xs"
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Ver Dica
                    </Button>
                    
                    <Button 
                      onClick={virarCard}
                      variant="outline"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Virar Card
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verso do Card */}
            <div 
              style={{ 
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                position: "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0
              }}
              className={isFlipped ? "opacity-100" : "opacity-0"}
            >
              <Card className="h-full bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{cardCorrente.area}</Badge>
                      <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">{cardCorrente.tema}</Badge>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {indiceAtual + 1} / {flashcardsFiltrados.length}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-full pb-6">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-3 text-green-800 dark:text-green-200 text-center">Resposta:</h4>
                    <p className="text-left leading-relaxed mb-4 text-green-700 dark:text-green-300">{cardCorrente.resposta}</p>
                    
                    {/* Botão para mostrar exemplo */}
                    {cardCorrente.exemplo && !mostrarExemplo && (
                      <div className="text-center mb-4">
                        <Button
                          onClick={() => setMostrarExemplo(true)}
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground text-xs"
                        >
                          Ver Exemplo
                        </Button>
                      </div>
                    )}

                    {/* Exemplo */}
                    {mostrarExemplo && cardCorrente.exemplo && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-3 bg-muted/50 rounded border text-left"
                      >
                        <h5 className="font-medium mb-2 text-sm">Exemplo:</h5>
                        <p className="text-sm">{cardCorrente.exemplo}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Ações com melhor espaçamento */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button
                      onClick={handleRevisar}
                      variant="outline"
                      className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-950/20"
                    >
                      <XCircle className="h-4 w-4" />
                      Revisar
                    </Button>
                    <Button
                      onClick={handleConhecido}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Conhecido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Navegação com melhor espaçamento */}
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={cardAnterior}
            variant="outline"
            className="flex items-center gap-2 bg-background border-primary/30 hover:bg-primary/5"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIndiceAtual(0);
                setIsFlipped(false);
                setMostrarExemplo(false);
                setMostrarDica(false);
                setCorretos(0);
                setIncorretos(0);
                setRevisados(0);
              }}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>

          <Button
            onClick={proximoCard}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Card Flutuante para Dica com Markdown */}
        <AnimatePresence>
          {mostrarDica && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              onClick={() => setMostrarDica(false)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="bg-background/95 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center gap-2 text-primary">
                        <Lightbulb className="h-4 w-4" />
                        Dica
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMostrarDica(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          p: ({children}) => <p className="mb-2 text-foreground leading-relaxed">{children}</p>,
                          strong: ({children}) => <strong className="font-semibold text-primary">{children}</strong>,
                          em: ({children}) => <em className="italic text-accent">{children}</em>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="text-sm text-foreground">{children}</li>,
                          code: ({children}) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary">{children}</code>,
                        }}
                      >
                        {dica}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estatísticas com melhor posicionamento e z-index */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-3 shadow-lg z-40">
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="text-primary font-medium">Total: {flashcardsFiltrados.length}</span>
            <span className="text-blue-600 dark:text-blue-400">Revisados: {revisados}</span>
            <span className="text-green-600 dark:text-green-400">Acertos: {corretos}</span>
            <span className="text-primary">Performance: {revisados > 0 ? Math.round((corretos / revisados) * 100) : 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;