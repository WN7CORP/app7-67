import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Search, ArrowLeft, Scale, BookOpen, 
  ChevronRight, Copy, X, Home, FileText, Scroll,
  Volume2, Lightbulb, Bookmark, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ProfessoraIAFloatingButton } from '@/components/ProfessoraIAFloatingButton';
import ReactMarkdown from 'react-markdown';

interface VadeMecumLegalCode {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
  textColor?: string;
}

interface VadeMecumArticle {
  id: string;
  numero: string;
  conteudo: string;
  codigo_id: string;
  "Número do Artigo"?: string;
  "Artigo"?: string;
}

// Cache em memória global para máxima performance
const articlesCache = new Map<string, VadeMecumArticle[]>();
let isPreloading = false;

const VadeMecumUltraFast: React.FC = () => {
  const [view, setView] = useState<'home' | 'codes' | 'articles'>('home');
  const [categoryType, setCategoryType] = useState<'articles' | 'statutes' | null>(null);
  const [selectedCode, setSelectedCode] = useState<VadeMecumLegalCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<VadeMecumArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado centralizado para modais de conteúdo gerado
  const [generatedModal, setGeneratedModal] = useState<{
    open: boolean;
    type: 'explicar' | 'exemplo';
    content: string;
    articleNumber: string;
    hasValidNumber: boolean;
  }>({
    open: false,
    type: 'explicar',
    content: '',
    articleNumber: '',
    hasValidNumber: false
  });
  
  const searchRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { setCurrentFunction } = useNavigation();

  // Preload códigos populares no primeiro acesso
  useEffect(() => {
    if (!isPreloading) {
      isPreloading = true;
      const preloadPopular = async () => {
        const popular = ['CC', 'CF88', 'CP', 'CPC'];
        for (const table of popular) {
          if (!articlesCache.has(`articles-${table.toLowerCase()}`)) {
            try {
              const { data } = await supabase
                .from(table as any)
                .select('id, "Número do Artigo", Artigo')
                .limit(500);
              
              if (data) {
                const transformed = data.map((item: any) => ({
                  id: String(item.id),
                  numero: item["Número do Artigo"] || String(item.id),
                  conteudo: item.Artigo || '',
                  codigo_id: table.toLowerCase(),
                  "Número do Artigo": item["Número do Artigo"],
                  "Artigo": item.Artigo
                }));
                articlesCache.set(`articles-${table.toLowerCase()}`, transformed);
              }
            } catch (e) {
              // Silently fail preload
            }
          }
        }
      };
      preloadPopular();
    }
  }, []);

  // Códigos otimizados com design system consistente - Cor amarela unificada
  const articleCodes = useMemo<VadeMecumLegalCode[]>(() => [
    { 
      id: 'cc', name: 'CC', fullName: 'Código Civil', 
      description: 'Relações civis entre particulares', 
      icon: '🤝', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'cdc', name: 'CDC', fullName: 'Código de Defesa do Consumidor', 
      description: 'Proteção dos direitos do consumidor', 
      icon: '🛡️', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'cf88', name: 'CF/88', fullName: 'Constituição Federal de 1988', 
      description: 'Carta Magna do Brasil', 
      icon: '🏛️', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'cp', name: 'CP', fullName: 'Código Penal', 
      description: 'Crimes e suas penalidades', 
      icon: '⚖️', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'cpc', name: 'CPC', fullName: 'Código de Processo Civil', 
      description: 'Procedimentos judiciais cíveis', 
      icon: '📋', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'cpp', name: 'CPP', fullName: 'Código de Processo Penal', 
      description: 'Procedimentos judiciais criminais', 
      icon: '🔍', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'clt', name: 'CLT', fullName: 'Consolidação das Leis do Trabalho', 
      description: 'Direitos e deveres trabalhistas', 
      icon: '👷', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'ctn', name: 'CTN', fullName: 'Código Tributário Nacional', 
      description: 'Normas gerais de direito tributário', 
      icon: '💰', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    }
  ], []);

  // Estatutos com design consistente
  const statuteCodes = useMemo<VadeMecumLegalCode[]>(() => [
    { 
      id: 'eca', name: 'ECA', fullName: 'Estatuto da Criança e do Adolescente', 
      description: 'Proteção integral à criança e adolescente', 
      icon: '👶', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'estatuto_idoso', name: 'Estatuto do Idoso', fullName: 'Estatuto da Pessoa Idosa', 
      description: 'Direitos das pessoas com idade igual ou superior a 60 anos', 
      icon: '👴', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    }
  ], []);

  const currentCodes = useMemo(() => {
    return categoryType === 'statutes' ? statuteCodes : articleCodes;
  }, [categoryType, articleCodes, statuteCodes]);

  // Função para validar se tem número de artigo válido
  const isValidArticleNumber = useCallback((articleNumber: string) => {
    return articleNumber && articleNumber.replace(/[^\d]/g, '').length > 0;
  }, []);

  // Callback para quando conteúdo é gerado
  const handleContentGenerated = useCallback((content: string, type: 'explicar' | 'exemplo', articleNumber: string) => {
    setGeneratedModal({
      open: true,
      type,
      content,
      articleNumber,
      hasValidNumber: isValidArticleNumber(articleNumber)
    });
  }, [isValidArticleNumber]);

  // Filtro inteligente de artigos - separar por tipo
  const filteredArticles = useMemo(() => {
    const allValidArticles = articles.filter(article => {
      const articleContent = article["Artigo"] || article.conteudo || '';
      return articleContent.trim() !== '';
    });

    if (!searchTerm.trim()) return allValidArticles;

    const searchLower = searchTerm.toLowerCase().trim();
    const searchNumbers = searchTerm.replace(/[^\d]/g, '');

    return allValidArticles
      .map(article => {
        const articleNumber = article["Número do Artigo"] || article.numero || '';
        const articleContent = article["Artigo"] || article.conteudo || '';
        
        let score = 0;
        
        // Prioridade 1: Match exato no número do artigo
        if (articleNumber.toLowerCase() === searchLower) {
          score = 1000;
        }
        // Prioridade 2: Número puro corresponde
        else if (searchNumbers && articleNumber.replace(/[^\d]/g, '') === searchNumbers) {
          score = 900;
        }
        // Prioridade 3: Número do artigo contém o termo
        else if (articleNumber.toLowerCase().includes(searchLower)) {
          score = 800;
        }
        // Prioridade 4: Conteúdo contém o termo
        else if (articleContent.toLowerCase().includes(searchLower)) {
          score = 100;
        }
        
        return { article, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 100) // Limita a 100 resultados para performance
      .map(item => item.article);
  }, [articles, searchTerm]);

  // Carregar artigos com cache otimizado
  const loadArticles = useCallback(async (code: VadeMecumLegalCode) => {
    const cacheKey = `articles-${code.id}`;
    
    // Verifica cache primeiro
    if (articlesCache.has(cacheKey)) {
      setArticles(articlesCache.get(cacheKey)!);
      setSelectedCode(code);
      setView('articles');
      setSearchTerm('');
      return;
    }

    setIsLoading(true);
    
    try {
      let tableName = code.id.toUpperCase();
      if (tableName === 'CF88') tableName = 'CF88';
      else if (tableName === 'CDC') tableName = 'CDC';
      
      const { data, error } = await supabase
        .from(tableName as any)
        .select('id, "Número do Artigo", Artigo')
        .order('id', { ascending: true })
        .limit(1000);

      if (error) throw error;

      const transformedArticles = (data || []).map((item: any) => ({
        id: String(item.id),
        numero: item["Número do Artigo"] || String(item.id),
        conteudo: item.Artigo || '',
        codigo_id: code.id,
        "Número do Artigo": item["Número do Artigo"],
        "Artigo": item.Artigo
      }));

      // Cache para uso futuro
      articlesCache.set(cacheKey, transformedArticles);
      
      setArticles(transformedArticles);
      setSelectedCode(code);
      setView('articles');
      setSearchTerm('');
      
    } catch (error: any) {
      toast({
        title: "❌ Erro ao carregar artigos",
        description: error.message || "Não foi possível carregar os artigos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Navegação otimizada
  const handleBack = useCallback(() => {
    if (view === 'articles') {
      setView('codes');
      setArticles([]);
      setSearchTerm('');
    } else if (view === 'codes') {
      setView('home');
      setCategoryType(null);
    } else {
      setCurrentFunction(null);
    }
  }, [view, setCurrentFunction]);

  const selectCategory = useCallback((type: 'articles' | 'statutes') => {
    setCategoryType(type);
    setView('codes');
  }, []);

  const copyArticle = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "✅ Artigo copiado!",
      description: "O conteúdo foi copiado para a área de transferência.",
    });
  }, [toast]);

  // Função para sintetizar voz (Web Speech API)
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      
      toast({
        title: "🔊 Reproduzindo áudio",
        description: "O texto está sendo reproduzido em voz alta.",
      });
    } else {
      toast({
        title: "❌ Recurso não disponível",
        description: "Seu navegador não suporta síntese de voz.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Componente de Card do Artigo
  const VadeMecumArticleCard = ({ article, index }: { article: VadeMecumArticle; index: number }) => {
    const [loadingState, setLoadingState] = useState<{
      explanation: boolean;
      practicalExample: boolean;
    }>({
      explanation: false,
      practicalExample: false
    });

    const articleNumber = article["Número do Artigo"] || article.numero || '';
    const articleContent = article["Artigo"] || article.conteudo || '';
    
    // Verifica se tem número válido (contém dígitos após remover caracteres não numéricos)
    const hasValidNumber = isValidArticleNumber(articleNumber);

    // Layout compacto para cards sem número válido (seções, capítulos, etc.)
    if (!hasValidNumber) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          className="mb-2"
        >
          <Card className="bg-muted/30 border-muted/50 hover:bg-muted/40 transition-colors">
            <CardContent className="p-2">
              <div className="text-center">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {articleContent}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    const handleExplain = async () => {
      setLoadingState(prev => ({ ...prev, explanation: true }));
      
      try {
        console.log('Chamando Gemini API para: explicar');
        
        const { data, error } = await supabase.functions.invoke('gemini-vademecum', {
          body: {
            action: 'explicar',
            articleNumber: articleNumber,
            codeName: selectedCode?.name || '',
            hasArticle: !!articleContent
          }
        });

        if (error) {
          console.error('Erro na API Gemini:', error);
          throw new Error('Erro ao gerar explicação');
        }

        if (data?.content) {
          console.log('Explicação gerada:', data.content);
          handleContentGenerated(data.content, 'explicar', articleNumber);
          toast({
            title: "✅ Explicação gerada!",
            description: "A explicação foi gerada com sucesso.",
          });
        }
      } catch (error: any) {
        toast({
          title: "❌ Erro ao gerar explicação",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoadingState(prev => ({ ...prev, explanation: false }));
      }
    };

    const handleExample = async () => {
      setLoadingState(prev => ({ ...prev, practicalExample: true }));
      
      try {
        const { data, error } = await supabase.functions.invoke('gemini-vademecum', {
          body: {
            action: 'exemplo',
            articleNumber: articleNumber,
            codeName: selectedCode?.name || '',
            hasArticle: !!articleContent
          }
        });

        if (error) {
          console.error('Erro na API Gemini:', error);
          throw new Error('Erro ao gerar exemplo');
        }

        if (data?.content) {
          console.log('Exemplo gerado:', data.content);
          handleContentGenerated(data.content, 'exemplo', articleNumber);
          toast({
            title: "✅ Exemplo gerado!",
            description: "O exemplo prático foi gerado com sucesso.",
          });
        }
      } catch (error: any) {
        toast({
          title: "❌ Erro ao gerar exemplo",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoadingState(prev => ({ ...prev, practicalExample: false }));
      }
    };

    // Layout diferente para cards sem número válido
    if (!hasValidNumber) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="mb-3"
        >
          <Card className="bg-card/50 border-muted">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="vademecum-text text-foreground/80 text-sm leading-relaxed">
                  {articleContent}
                </div>
                
                {/* Apenas botões de IA para cards sem número */}
                <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-muted">
                  <Button
                    onClick={handleExplain}
                    disabled={loadingState.explanation}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {loadingState.explanation ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                    ) : (
                      <Brain className="h-3 w-3" />
                    )}
                    <span className="ml-1">Explicar</span>
                  </Button>
                  <Button
                    onClick={handleExample}
                    disabled={loadingState.practicalExample}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {loadingState.practicalExample ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                    ) : (
                      <Lightbulb className="h-3 w-3" />
                    )}
                    <span className="ml-1">Exemplo</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    // Layout para cards com número válido
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="mb-4"
      >
        <Card className="hover:shadow-md transition-all duration-200 bg-card border">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Cabeçalho do Artigo */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-primary mb-2">
                    Art. {articleNumber}
                  </h3>
                  <div className="vademecum-text text-foreground">
                    {articleContent.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-2 last:mb-0 text-sm leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ações do Artigo */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-muted">
                <Button
                  onClick={() => copyArticle(articleContent)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </Button>
                
                <Button
                  onClick={handleExplain}
                  disabled={loadingState.explanation}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {loadingState.explanation ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1" />
                      Gerando explicação...
                    </>
                  ) : (
                    <>
                      <Brain className="h-3 w-3 mr-1" />
                      Explicar
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleExample}
                  disabled={loadingState.practicalExample}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {loadingState.practicalExample ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1" />
                      Gerando exemplo...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Exemplo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Tela inicial
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => setCurrentFunction(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Home className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex flex-col items-center justify-center p-6 min-h-[calc(100vh-80px)]">
          <div className="text-center mb-8 max-w-lg">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent-legal rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Scale className="h-8 w-8 text-primary-foreground" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-primary">Vade Mecum Digital</h1>
            <p className="text-muted-foreground mb-8">
              Acesse os principais códigos jurídicos brasileiros de forma rápida e eficiente
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl w-full">
            <Card className="cursor-pointer group bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 hover:border-primary/50 hover:shadow-lg transition-all duration-300" 
                  onClick={() => selectCategory('articles')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Códigos & Leis</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Acesse os principais códigos do ordenamento jurídico brasileiro
                </p>
                <div className="flex items-center justify-center text-primary/70 group-hover:text-primary transition-colors">
                  <span className="text-sm">Explore agora</span>
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer group bg-gradient-to-br from-accent-legal/20 to-accent-legal/10 border-accent-legal/30 hover:border-accent-legal/50 hover:shadow-lg transition-all duration-300" 
                  onClick={() => selectCategory('statutes')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto bg-accent-legal/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Scroll className="h-6 w-6 text-accent-legal" />
                </div>
                <h3 className="text-xl font-bold text-accent-legal mb-3">Estatutos</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Consulte estatutos e leis especiais importantes
                </p>
                <div className="flex items-center justify-center text-accent-legal/70 group-hover:text-accent-legal transition-colors">
                  <span className="text-sm">Explore agora</span>
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Lista de códigos
  if (view === 'codes') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-lg font-bold">
            {categoryType === 'articles' ? 'Códigos & Leis' : 'Estatutos'}
          </h2>
          <div className="w-16" />
        </div>

        <div className="p-4">
          {/* Grid 2x2 para os códigos de leis */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCodes.map((code) => (
              <div
                key={code.id}
                onClick={() => loadArticles(code)}
                className="cursor-pointer group"
              >
                <div className={`rounded-xl ${code.color} shadow-md hover:shadow-lg transition-all duration-300 p-4 glass-effect-modern`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl group-hover:scale-110 transition-transform">{code.icon}</div>
                      <div>
                        <h3 className={`font-bold text-lg ${code.textColor}`}>
                          {code.name}
                        </h3>
                        <p className={`text-sm ${code.textColor} opacity-80`}>
                          {code.fullName}
                        </p>
                        <p className={`text-xs ${code.textColor} opacity-60 hidden sm:block`}>
                          {code.description}
                        </p>
                      </div>
                    </div>
                    
                    <ChevronRight className={`h-5 w-5 ${code.textColor} group-hover:translate-x-1 transition-transform`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Lista de artigos
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-lg font-bold truncate">
            {selectedCode?.name} - {selectedCode?.fullName}
          </h2>
          <div className="w-16" />
        </div>
        
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Buscar por artigo ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Carregando artigos...</span>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum artigo encontrado.' : 'Nenhum artigo disponível.'}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {filteredArticles.map((article, index) => (
              <VadeMecumArticleCard key={`${article.id}-${index}`} article={article} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Modal Centralizado para Conteúdo Gerado */}
      <Dialog open={generatedModal.open} onOpenChange={(open) => setGeneratedModal(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {generatedModal.type === 'explicar' ? (
                <Brain className="h-6 w-6 text-primary" />
              ) : (
                <Lightbulb className="h-6 w-6 text-warning" />
              )}
              {generatedModal.type === 'explicar' ? 'Explicação' : 'Exemplo Prático'}
              {generatedModal.hasValidNumber && ` - Art. ${generatedModal.articleNumber}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="prose prose-slate dark:prose-invert max-w-none p-6 bg-muted/30 rounded-lg border">
              {generatedModal.content ? (
                <div className="vademecum-text">
                  <ReactMarkdown 
                    components={{
                      h1: ({...props}) => <h1 className="text-2xl font-bold mb-4 text-primary" {...props} />,
                      h2: ({...props}) => <h2 className="text-xl font-semibold mb-3 text-primary" {...props} />,
                      h3: ({...props}) => <h3 className="text-lg font-medium mb-2 text-primary" {...props} />,
                      p: ({...props}) => <p className="mb-3 last:mb-0 text-base leading-relaxed" {...props} />,
                      ul: ({...props}) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
                      ol: ({...props}) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
                      li: ({...props}) => <li className="text-base leading-relaxed" {...props} />,
                      blockquote: ({...props}) => <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4" {...props} />,
                      code: ({...props}) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono" {...props} />,
                      strong: ({...props}) => <strong className="font-semibold text-primary" {...props} />,
                      em: ({...props}) => <em className="italic text-accent-legal" {...props} />
                    }}
                  >
                    {generatedModal.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground">Carregando conteúdo...</p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigator.clipboard.writeText(generatedModal.content)}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar {generatedModal.type === 'explicar' ? 'Explicação' : 'Exemplo'}
              </Button>
              <Button 
                onClick={() => setGeneratedModal(prev => ({ ...prev, open: false }))} 
                size="sm"
              >
                Fechar
              </Button>
            </div>
            
            {/* Professora IA */}
            <div className="pt-6 border-t border-muted bg-gradient-to-r from-primary/5 to-accent-legal/5 rounded-lg p-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-3 text-primary flex items-center justify-center gap-2">
                  <Brain className="h-5 w-5" />
                  Precisa de mais esclarecimentos?
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  A Professora IA está disponível para tirar todas as suas dúvidas sobre este artigo
                </p>
                <ProfessoraIAFloatingButton onOpen={() => {}} />
                <p className="text-xs text-muted-foreground mt-3">
                  💡 Clique para abrir uma conversa personalizada sobre este tema
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VadeMecumUltraFast;