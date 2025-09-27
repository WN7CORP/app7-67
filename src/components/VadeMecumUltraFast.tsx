import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Search, ArrowLeft, Scale, BookOpen, 
  ChevronRight, Copy, X, Home, FileText, Scroll,
  Volume2, Lightbulb, Bookmark
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

export const VadeMecumUltraFast: React.FC = () => {
  const [view, setView] = useState<'home' | 'codes' | 'articles'>('home');
  const [categoryType, setCategoryType] = useState<'articles' | 'statutes' | null>(null);
  const [selectedCode, setSelectedCode] = useState<VadeMecumLegalCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<VadeMecumArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
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
      id: 'ctb', name: 'CTB', fullName: 'Código de Trânsito Brasileiro', 
      description: 'Normas de trânsito e transporte', 
      icon: '🚗', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'ctn', name: 'CTN', fullName: 'Código Tributário Nacional', 
      description: 'Sistema tributário nacional', 
      icon: '💰', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'ce', name: 'CE', fullName: 'Código Eleitoral', 
      description: 'Legislação eleitoral brasileira', 
      icon: '🗳️', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'cf88', name: 'CF88', fullName: 'Constituição Federal de 1988', 
      description: 'Lei fundamental do Brasil', 
      icon: '🏛️', 
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
      id: 'cp', name: 'CP', fullName: 'Código Penal', 
      description: 'Crimes e suas punições', 
      icon: '🔫', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      id: 'cpc', name: 'CPC', fullName: 'Código de Processo Civil', 
      description: 'Procedimentos processuais cíveis', 
      icon: '📋', 
      color: 'bg-gradient-to-br from-store-primary/20 to-store-primary/10 border border-store-primary/30',
      textColor: 'text-store-primary'
    },
    { 
      id: 'cpp', name: 'CPP', fullName: 'Código de Processo Penal', 
      description: 'Procedimentos penais', 
      icon: '🔪', 
      color: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-400/50',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    }
  ], []);

  const statuteCodes = useMemo<VadeMecumLegalCode[]>(() => [
    { 
      id: 'estatuto-oab', name: 'Estatuto da OAB', fullName: 'Estatuto da Advocacia e da OAB', 
      description: 'Lei nº 8.906/1994', 
      icon: '🎓', 
      color: 'bg-gradient-to-br from-tools-primary/30 to-tools-primary/20 border border-tools-primary/50',
      textColor: 'text-tools-primary'
    },
    { 
      id: 'estatuto-idoso', name: 'Estatuto do Idoso', fullName: 'Estatuto do Idoso', 
      description: 'Lei nº 10.741/2003', 
      icon: '👴', 
      color: 'bg-gradient-to-br from-community-secondary/20 to-community-secondary/10 border border-community-secondary/30',
      textColor: 'text-community-secondary'
    }
  ], []);

  const currentCodes = categoryType === 'articles' ? articleCodes : statuteCodes;

  // Busca otimizada instantânea com prioridade para números exatos
  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles.slice(0, 100);
    
    const term = searchTerm.trim().toLowerCase();
    
    // Se for apenas um número, priorizar busca exata pelo número do artigo
    if (/^\d+$/.test(term)) {
      const exactMatch = articles.filter(article => {
        const number = article["Número do Artigo"]?.toLowerCase() || '';
        return number === term || number === `art. ${term}` || number === `artigo ${term}`;
      });
      
      if (exactMatch.length > 0) {
        return exactMatch;
      }
      
      // Se não encontrou exato, buscar que contenha o número
      const partialMatch = articles.filter(article => {
        const number = article["Número do Artigo"]?.toLowerCase() || '';
        return number.includes(term);
      });
      
      if (partialMatch.length > 0) {
        return partialMatch.slice(0, 20);
      }
    }
    
    // Busca geral no conteúdo
    return articles.filter(article => {
      const number = article["Número do Artigo"]?.toLowerCase() || '';
      const content = article.Artigo?.toLowerCase() || '';
      return number.includes(term) || content.includes(term);
    }).slice(0, 50);
  }, [articles, searchTerm]);

  // Buscar artigos com cache instantâneo
  const loadArticles = useCallback(async (code: VadeMecumLegalCode) => {
    const cacheKey = `articles-${code.id}`;
    
    // Verificar cache primeiro
    const cached = articlesCache.get(cacheKey);
    if (cached) {
      setArticles(cached);
      setSelectedCode(code);
      setView('articles');
      return;
    }

    setIsLoading(true);
    try {
      const tableMap: Record<string, string> = {
        'cc': 'CC',
        'cdc': 'CDC', 
        'cf88': 'CF88',
        'clt': 'CLT',
        'cp': 'CP',
        'cpc': 'CPC',
        'cpp': 'CPP',
        'ctb': 'CTB',
        'ctn': 'CTN',
        'ce': 'CE',
        'estatuto-oab': 'ESTATUTO - OAB',
        'estatuto-idoso': 'ESTATUTO - IDOSO'
      };

      const tableName = tableMap[code.id];
      if (!tableName) return;

      const { data } = await supabase
        .from(tableName as any)
        .select('id, "Número do Artigo", Artigo')
        .order('id', { ascending: true });

      if (data) {
        const transformed = data.map((item: any) => ({
          id: String(item.id),
          numero: item["Número do Artigo"] || String(item.id),
          conteudo: item.Artigo || '',
          codigo_id: code.id,
          "Número do Artigo": item["Número do Artigo"],
          "Artigo": item.Artigo
        }));
        
        articlesCache.set(cacheKey, transformed);
        setArticles(transformed);
        setSelectedCode(code);
        setView('articles');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar artigos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleBack = useCallback(() => {
    if (view === 'articles') {
      setView('codes');
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

  const copyArticle = useCallback((article: VadeMecumArticle) => {
    const text = `${article["Número do Artigo"] || ''}\n\n${article.Artigo || ''}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Artigo copiado para a área de transferência"
    });
  }, [toast]);

  // Componente do Card de Artigo com funcionalidades antigas
  const VadeMecumArticleCard = ({ article, codeInfo, onCopy }: {
    article: VadeMecumArticle;
    codeInfo: VadeMecumLegalCode | null;
    onCopy: () => void;
  }) => {
    const [loadingState, setLoadingState] = useState<'explicar' | 'exemplo' | null>(null);
    const [explanation, setExplanation] = useState('');
    const [practicalExample, setPracticalExample] = useState('');
    const [showExplanation, setShowExplanation] = useState(false);
    const [showExample, setShowExample] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    // Debug logs
    console.log('Modal states:', { showExplanation, showExample, explanation: explanation.length, practicalExample: practicalExample.length });

    const articleText = article.Artigo || '';
    const articleNumber = article["Número do Artigo"] || article.numero || '';
    
    // Verificar se realmente há um número do artigo válido (incluindo números maiores que 9)
    const hasArticleNumber = articleNumber && 
      articleNumber.toString().trim() !== '' && 
      articleNumber.toString().trim() !== 'NULL' &&
      (articleNumber.toString().includes('Art') || 
       articleNumber.toString().includes('°') || 
       articleNumber.toString().includes('º') ||
       /^\d+$/.test(articleNumber.toString().trim())); // Aceitar números puros também

    const callGeminiAPI = async (action: 'explicar' | 'exemplo' | 'apresentar') => {
      setLoadingState(action === 'apresentar' ? null : action);
      try {
        console.log('Chamando Gemini API para:', action);
        const { data, error } = await supabase.functions.invoke('gemini-vademecum', {
          body: {
            action,
            article: articleText,
            articleNumber,
            codeName: codeInfo?.name || 'Código Legal'
          }
        });

        console.log('Resposta da API:', data, 'Erro:', error);

        if (error) throw error;

        if (action === 'explicar') {
          const content = data.content || 'Explicação gerada com sucesso.';
          console.log('Definindo explicação:', content);
          setExplanation(content);
          setShowExplanation(true);
          console.log('Modal de explicação aberto:', true);
        } else if (action === 'exemplo') {
          const content = data.content || 'Exemplo gerado com sucesso.';
          console.log('Definindo exemplo:', content);
          setPracticalExample(content);
          setShowExample(true);
          console.log('Modal de exemplo aberto:', true);
        }

        toast({
          title: "Sucesso!",
          description: `${action === 'explicar' ? 'Explicação' : 'Exemplo prático'} gerada com IA`,
        });
      } catch (error) {
        console.error('Erro na API Gemini:', error);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o conteúdo. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoadingState(null);
      }
    };

    const shareArticle = async () => {
      onCopy(); // Sempre usar copy como fallback
    };

    const playAudio = () => {
      if ('speechSynthesis' in window) {
        // Expandir abreviações para narração correta
        const expandedText = articleText
          .replace(/\bArt\./gi, 'Artigo')
          .replace(/\bInc\./gi, 'Inciso')
          .replace(/\bPar\./gi, 'Parágrafo')
          .replace(/\b§/g, 'Parágrafo')
          .replace(/\bº/g, 'grau')
          .replace(/\b1º/g, 'primeiro')
          .replace(/\b2º/g, 'segundo') 
          .replace(/\b3º/g, 'terceiro')
          .replace(/\b4º/g, 'quarto')
          .replace(/\b5º/g, 'quinto')
          .replace(/\b6º/g, 'sexto')
          .replace(/\b7º/g, 'sétimo')
          .replace(/\b8º/g, 'oitavo')
          .replace(/\b9º/g, 'nono')
          .replace(/\b10º/g, 'décimo')
          .replace(/\bII\b/g, 'dois')
          .replace(/\bIII\b/g, 'três')
          .replace(/\bIV\b/g, 'quatro')
          .replace(/\bV\b/g, 'cinco')
          .replace(/\bVI\b/g, 'seis')
          .replace(/\bVII\b/g, 'sete')
          .replace(/\bVIII\b/g, 'oito')
          .replace(/\bIX\b/g, 'nove')
          .replace(/\bX\b/g, 'dez');

        const speechText = hasArticleNumber ? `Artigo ${articleNumber}. ${expandedText}` : expandedText;
        
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
        
        toast({
          title: "Reproduzindo áudio",
          description: hasArticleNumber ? "Artigo sendo lido em voz alta" : "Texto sendo lido em voz alta",
        });
      } else {
        toast({
          title: "Recurso não disponível",
          description: "Seu navegador não suporta síntese de voz",
          variant: "destructive"
        });
      }
    };

    // Layout diferenciado baseado no tipo de conteúdo
    if (!hasArticleNumber) {
      // Layout compacto para textos legais (títulos, seções, etc.)
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:shadow-sm transition-all duration-300 glass-effect-modern border-border/30 bg-muted/20">
            <CardContent className="p-4 text-center">
              <div className="text-sm font-medium text-foreground/80 leading-relaxed">
                {articleText}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    // Layout completo para artigos com número
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-md transition-all duration-300 glass-effect-modern border-border/50">
          <CardContent className="p-4">
            {/* Cabeçalho com número do artigo */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">
                  {articleNumber}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`${isFavorited ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
                >
                  <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopy}
                  className="h-8 text-xs border-primary/20 hover:border-primary/40"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </Button>
              </div>
            </div>

            {/* Texto do artigo com fonte legível */}
            <div className="vademecum-text text-foreground mb-4 whitespace-pre-wrap">
              {articleText}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                onClick={() => callGeminiAPI('explicar')}
                disabled={loadingState !== null}
                className="bg-gradient-to-r from-primary to-accent-legal hover:from-primary/90 hover:to-accent-legal/90 text-primary-foreground border-none"
                size="sm"
              >
                {loadingState === 'explicar' ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                ) : (
                  <BookOpen className="h-4 w-4 mr-2" />
                )}
                {loadingState === 'explicar' ? 'Gerando explicação...' : 'Explicar'}
              </Button>
              <Button
                onClick={() => callGeminiAPI('exemplo')}
                disabled={loadingState !== null}
                variant="outline"
                size="sm"
                className="border-primary/30 hover:border-primary/50 hover:bg-primary/10"
              >
                {loadingState === 'exemplo' ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                ) : (
                  <Lightbulb className="h-4 w-4 mr-2" />
                )}
                {loadingState === 'exemplo' ? 'Gerando exemplo...' : 'Exemplo'}
              </Button>
              <Button
                onClick={playAudio}
                variant="ghost"
                size="sm"
                className="hover:bg-muted/50"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Ouvir
              </Button>
            </div>

            {/* Explanation Content - APENAS para artigos com número válido */}
            {showExplanation && explanation && hasArticleNumber && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-primary">Explicação</h4>
                </div>
                <div className="text-sm text-foreground">
                  <div dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }} />
                </div>
              </motion.div>
            )}

            {/* Example Content - APENAS para artigos com número válido */}
            {showExample && practicalExample && hasArticleNumber && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-success" />
                  <h4 className="font-semibold text-success">Exemplo Prático</h4>
                </div>
                <div className="text-sm text-foreground">
                  <div dangerouslySetInnerHTML={{ __html: practicalExample.replace(/\n/g, '<br />') }} />
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Explicação */}
        <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto z-50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Explicação - {hasArticleNumber ? articleNumber : 'Texto Legal'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="vademecum-text p-4 bg-muted/50 rounded-lg">
                {explanation ? (
                  explanation.split('\n').map((line, index) => (
                    <p key={index} className="mb-2 last:mb-0">{line}</p>
                  ))
                ) : (
                  <p>Carregando explicação...</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigator.clipboard.writeText(explanation)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Explicação
                </Button>
                <Button onClick={() => setShowExplanation(false)} size="sm">
                  Fechar
                </Button>
              </div>
              
              {/* Professora IA para tirar mais dúvidas */}
              <div className="pt-4 border-t">
                <ProfessoraIAFloatingButton onOpen={() => {}} />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Tem mais dúvidas? Converse com a Professora IA
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Exemplo */}
        <Dialog open={showExample} onOpenChange={setShowExample}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto z-50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                Exemplo Prático - {hasArticleNumber ? articleNumber : 'Texto Legal'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="vademecum-text p-4 bg-muted/50 rounded-lg">
                {practicalExample ? (
                  practicalExample.split('\n').map((line, index) => (
                    <p key={index} className="mb-2 last:mb-0">{line}</p>
                  ))
                ) : (
                  <p>Carregando exemplo...</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigator.clipboard.writeText(practicalExample)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Exemplo
                </Button>
                <Button onClick={() => setShowExample(false)} size="sm">
                  Fechar
                </Button>
              </div>
              
              {/* Professora IA para tirar mais dúvidas */}
              <div className="pt-4 border-t">
                <ProfessoraIAFloatingButton onOpen={() => {}} />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Tem mais dúvidas? Converse com a Professora IA
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
              placeholder="Buscar artigo (ex: 1, 123, direito)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <div className="absolute right-3 top-3 text-xs text-muted-foreground">
                {filteredArticles.length} encontrado(s)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredArticles.map((article) => (
            <VadeMecumArticleCard
              key={article.id}
              article={article}
              codeInfo={selectedCode}
              onCopy={() => copyArticle(article)}
            />
          ))}
          
          {filteredArticles.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum artigo encontrado para sua busca.' : 'Carregando artigos...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VadeMecumUltraFast;