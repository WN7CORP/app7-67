import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Clock, Newspaper, ExternalLink, Brain, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { WebView } from '@/components/WebView';
import ReactMarkdown from 'react-markdown';
import { useLegalNewsRead } from '@/hooks/useLegalNewsRead';
import { LegalNewsChat } from '@/components/LegalNewsChat';
import { OptimizedImage } from '@/components/OptimizedImage';

interface LegalNews {
  id: string;
  portal: string;
  title: string;
  preview?: string;
  image_url?: string;
  news_url: string;
  published_at?: string;
  cached_at: string;
}

interface NewsContent {
  title?: string;
  description?: string;
  image_url?: string;
  content_html?: string;
  content_text?: string;
  success: boolean;
  error?: string;
}

const PORTAL_COLORS = {
  migalhas: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  conjur: 'bg-green-500/20 text-green-300 border-green-500/30',
  amodireito: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  jota: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  jusbrasil: 'bg-red-500/20 text-red-300 border-red-500/30',
  dizerodireito: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  espacovital: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
};

const PORTAL_NAMES = {
  migalhas: 'Migalhas',
  conjur: 'ConJur',
  amodireito: 'A&M Direito',
  jota: 'Jota',
  jusbrasil: 'JusBrasil',
  dizerodireito: 'Dizer o Direito',
  espacovital: 'Espaço Vital'
};

export const RadarJuridico = () => {
  const { setCurrentFunction } = useNavigation();
  const [news, setNews] = useState<LegalNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<LegalNews | null>(null);
  const [newsContent, setNewsContent] = useState<NewsContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [webViewTitle, setWebViewTitle] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();
  const { markAsRead, isRead } = useLegalNewsRead();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        toast({
          title: "Buscando notícias...",
          description: "Processando as últimas notícias jurídicas",
        });
      }

      const { data, error } = await supabase.functions.invoke('legal-news-radar');

      if (error) throw error;

      if (data.success) {
        // Filtrar apenas notícias do Conjur
        const conjurNews = data.data.filter((item: LegalNews) => item.portal === 'conjur');
        setNews(conjurNews);
        setLastUpdate(new Date());
        if (!silent) {
          toast({
            title: "Notícias atualizadas",
            description: `${conjurNews.length} notícias do Conjur carregadas`,
          });
        }
      } else {
        throw new Error(data.error || 'Erro ao carregar notícias');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      if (!silent) {
        toast({
          title: "Erro ao carregar notícias",
          description: "Tente novamente em alguns instantes",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNews();

    // Set up auto-refresh every 30 minutes
    intervalRef.current = setInterval(() => {
      fetchNews(true); // Silent update
    }, 30 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const openNewsReader = async (newsItem: LegalNews) => {
    // Mark as read when opening
    markAsRead(newsItem.id);
    
    setSelectedNews(newsItem);
    setLoadingContent(true);
    setNewsContent(null);
    setAiResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('news-content-proxy', {
        body: { url: newsItem.news_url }
      });

      if (error) throw error;

      if (data.success) {
        setNewsContent(data);
      } else {
        throw new Error(data.error || 'Erro ao carregar conteúdo');
      }
    } catch (error) {
      console.error('Error loading news content:', error);
      toast({
        title: "Erro ao carregar conteúdo",
        description: "Não foi possível carregar o artigo. Tente novamente.",
        variant: "destructive",
      });
      setNewsContent({ success: false, error: 'Erro ao carregar conteúdo' });
    } finally {
      setLoadingContent(false);
    }
  };

  const handleAiAction = async (action: 'resumir' | 'explicar') => {
    setLoadingAi(true);
    setAiResponse('');

    try {
      // Garantir que temos o conteúdo completo da notícia
      let fullContent = newsContent?.content_text;
      
      if (!fullContent) {
        throw new Error('Conteúdo da notícia não está disponível para análise');
      }

      const prompt = action === 'resumir' 
        ? `Você é um assistente especializado em direito. Analise COMPLETAMENTE o artigo jurídico a seguir e crie um RESUMO ESTRUTURADO em markdown. 

Siga exatamente esta estrutura:

# 📋 Resumo Executivo

## 🎯 Ponto Principal
[Uma frase clara do ponto principal da notícia]

## ⚖️ Decisão/Entendimento
[O que foi decidido ou qual o entendimento apresentado]

## 📚 Fundamentos Legais
- [Liste as leis, artigos ou jurisprudências mencionadas]

## 🔍 Detalhes Importantes
- [3-5 pontos-chave em bullet points]

## 💡 Implicações Práticas
[Como isso afeta advogados, empresas ou cidadãos]

---

ARTIGO COMPLETO A ANALISAR:
${fullContent}`
        : `Você é um professor de direito experiente. Leia COMPLETAMENTE o artigo jurídico a seguir e crie uma EXPLICAÇÃO DIDÁTICA em markdown.

Siga exatamente esta estrutura:

# 🎓 Explicação Didática

## 📖 Contexto e Situação
[Explique o cenário de forma simples]

## ⚖️ Questão Jurídica Principal
[Qual o problema jurídico sendo discutido]

## 🔍 Análise Passo a Passo

### 1️⃣ Primeiro Aspecto
[Explicação clara]

### 2️⃣ Segundo Aspecto  
[Explicação clara]

### 3️⃣ Terceiro Aspecto
[Se aplicável]

## 📚 Base Legal
- **Lei/Artigo:** [Fundamento específico]
- **Jurisprudência:** [Se houver precedentes]

## 💼 Exemplos Práticos
[2-3 situações onde isso se aplicaria]

## ✅ Conclusão Simplificada
[Resumo em linguagem acessível]

---

ARTIGO COMPLETO A ANALISAR:
${fullContent}`;

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: { 
          message: prompt,
          conversationHistory: []
        }
      });

      if (error) throw error;

      if (data.success) {
        setAiResponse(data.response);
      } else {
        throw new Error(data.error || 'Erro na IA');
      }
    } catch (error) {
      console.error('Error with AI:', error);
      toast({
        title: `Erro ao ${action}`,
        description: error.message || "Não foi possível processar com a IA. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingAi(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Agora';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d atrás`;
    if (diffHours > 0) return `${diffHours}h atrás`;
    return 'Agora';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentFunction(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Newspaper className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Radar Jurídico - ConJur</h2>
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-24 w-24 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* WebView Modal */}
      {webViewUrl && (
        <WebView
          url={webViewUrl}
          title={webViewTitle}
          onClose={() => {
            setWebViewUrl(null);
            setWebViewTitle('');
          }}
          showAIOptions={true}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentFunction(null)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Newspaper className="h-6 w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Radar Jurídico - ConJur</h2>
          </div>
          {lastUpdate && (
            <div className="text-xs text-muted-foreground">
              Atualizado: {formatDate(lastUpdate.toISOString())}
            </div>
          )}
        </div>

        {news.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notícia encontrada</h3>
              <p className="text-muted-foreground">
                Tente atualizar ou verifique sua conexão com a internet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <Card key={item.id} className={`border-border/50 hover:border-primary/30 transition-colors ${
                isRead(item.id) ? 'opacity-60' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-4">
                    {/* Header com badge e tempo */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="bg-green-500/20 text-green-300 border-green-500/30"
                        >
                          ConJur
                        </Badge>
                        {isRead(item.id) && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(item.published_at)}</span>
                      </div>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <OptimizedImage
                          src={item.image_url || '/placeholder.svg'}
                          alt={item.title}
                          className="w-24 h-24 rounded-lg border shadow-sm overflow-hidden bg-muted"
                          loading="lazy"
                          width={96}
                          height={96}
                          onError={() => {}}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight mb-2 hover:text-primary transition-colors cursor-pointer"
                            onClick={() => openNewsReader(item)}>
                          {item.title}
                        </h3>
                        
                        {item.preview && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {item.preview}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Botão de ação */}
                    <div className="flex justify-end pt-2 border-t border-border/30">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          markAsRead(item.id);
                          setWebViewUrl(item.news_url);
                          setWebViewTitle(item.title);
                        }}
                        className="gap-2 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                      >
                        Ler agora
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de leitura no app - agora simplificado */}
      <Dialog open={selectedNews !== null} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left text-lg">
              {selectedNews?.title}
            </DialogTitle>
          </DialogHeader>

          {loadingContent ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : newsContent?.success ? (
            <div className="space-y-6">
              {newsContent.image_url && (
                <img 
                  src={newsContent.image_url} 
                  alt={newsContent.title || selectedNews?.title}
                  className="w-full max-h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              <div 
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: newsContent.content_html || '' }}
              />

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => handleAiAction('resumir')}
                  disabled={loadingAi}
                  className="gap-2"
                  variant="outline"
                >
                  <Brain className="h-4 w-4" />
                  {loadingAi ? 'Analisando...' : 'Resumir'}
                </Button>
                
                <Button 
                  onClick={() => handleAiAction('explicar')}
                  disabled={loadingAi}
                  className="gap-2"
                  variant="outline"
                >
                  <FileText className="h-4 w-4" />
                  {loadingAi ? 'Analisando...' : 'Explicar'}
                </Button>
              </div>

              {aiResponse && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Análise da IA
                  </h4>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 text-primary" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-semibold mb-2 text-foreground" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-medium mb-2 text-foreground" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 text-sm text-foreground leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-sm text-foreground" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                        code: ({node, ...props}) => <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-4 border-border" {...props} />
                      }}
                    >
                      {aiResponse}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Chat interativo - só aparece após análise da IA */}
              {aiResponse && (
                <div className="mt-6">
                  <LegalNewsChat 
                    newsContent={newsContent?.content_text || ''}
                    newsTitle={selectedNews?.title || ''}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar o conteúdo da notícia.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  if (selectedNews) {
                    setWebViewUrl(selectedNews.news_url);
                    setWebViewTitle(selectedNews.title);
                    setSelectedNews(null);
                  }
                }}
                className="gap-2"
              >
                Abrir no navegador
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};