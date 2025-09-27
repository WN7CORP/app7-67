import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Monitor, Play, X, Brain, Zap, ArrowLeft, MessageSquare, ExternalLink, BookOpen, Sparkles, FileText } from 'lucide-react';
import { useAppFunctions } from '@/hooks/useAppFunctions';
import { useNavigation } from '@/context/NavigationContext';
import { useToast } from '@/components/ui/use-toast';
import { AIDocumentAnalyzer } from './AIDocumentAnalyzer';

export const AssistenteIA = () => {
  const {
    functions
  } = useAppFunctions();
  const {
    setCurrentFunction
  } = useNavigation();
  const { toast } = useToast();
  const [showVideo, setShowVideo] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Se showAIChat é true, renderizar o componente de chat
  if (showAIChat) {
    return <AIDocumentAnalyzer onBack={() => setShowAIChat(false)} />;
  }

  // Encontrar o link do Assistente IA na tabela
  const assistenteIAFunction = functions.find(func => func.funcao.toLowerCase().includes('assistente') && func.funcao.toLowerCase().includes('ia'));
  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send/?phone=5511940432865&text=Ol%C3%A1%2C+Evelyn%21+Poderia+me+ajudar+com+o+Assistente+IA?&type=phone_number&app_absent=0', '_blank');
  };
  const handleAppClick = () => {
    if (assistenteIAFunction?.link) {
      // Abrir no app via webview usando o sistema de navegação
      setCurrentFunction('Assistente IA Jurídica');
    }
  };
  const handleVideoClick = () => {
    setShowVideo(true);
  };
  const closeVideo = () => {
    setShowVideo(false);
  };
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header minimalista */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <Brain className="h-6 w-6 sm:h-8 md:h-10 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-ia">
              Assistente IA
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Transforme sua experiência jurídica com nossa IA especializada. 
            Análises precisas, respostas inteligentes e suporte 24/7.
          </p>
        </div>

        {/* Botão de voltar */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentFunction(null)}
            className="gap-2 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Grid de cartões */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          
          {/* Análise de Documentos */}
          <Card className="group hover:shadow-lg transition-all duration-300 border border-orange-500/20 hover:border-orange-500/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-3 sm:pb-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-orange-500/20 transition-colors">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-orange-600">
                Análise de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm">
                Upload de PDFs e imagens para análise jurídica inteligente
              </p>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-orange-500/20 hover:bg-orange-500/10 text-orange-600 hover:text-orange-700"
                onClick={() => setShowAIChat(true)}
              >
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Iniciar Chat
              </Button>
            </CardContent>
          </Card>
          
          {/* Jurischat */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-purple-500/20 hover:border-purple-500/40 bg-card/50 backdrop-blur-sm" onClick={() => window.open('https://wesleycostat-app-react-chat.vercel.app/', '_blank')}>
            <CardHeader className="text-center pb-3 sm:pb-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-purple-500/20 transition-colors">
                <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-purple-600">
                Jurischat
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm">
                Chat inteligente para consultas jurídicas rápidas e precisas
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-purple-500/20 hover:bg-purple-500/10 text-purple-600 hover:text-purple-700"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('https://wesleycostat-app-react-chat.vercel.app/', '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Acessar
              </Button>
            </CardContent>
          </Card>

          {/* IA dos Livros */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-green-500/20 hover:border-green-500/40 bg-card/50 backdrop-blur-sm" onClick={() => window.open('https://ia-dos-livros.vercel.app/', '_blank')}>
            <CardHeader className="text-center pb-3 sm:pb-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-green-500/20 transition-colors">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-green-600">
                IA dos Livros
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm">
                Converse com livros jurídicos usando inteligência artificial
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-500/20 hover:bg-green-500/10 text-green-600 hover:text-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('https://ia-dos-livros.vercel.app/', '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Acessar
              </Button>
            </CardContent>
          </Card>

          {/* App IA */}
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-blue-500/20 hover:border-blue-500/40 bg-card/50 backdrop-blur-sm" onClick={handleAppClick}>
            <CardHeader className="text-center pb-3 sm:pb-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-500/20 transition-colors relative">
                <Monitor className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
              <CardTitle className="text-lg sm:text-xl text-blue-600 flex items-center justify-center gap-2">
                <span>IA Premium</span>
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm">
                Assistente IA completo para análise de documentos e consultoria jurídica avançada
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-500/20 hover:bg-blue-500/10 text-blue-600 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWhatsAppClick();
                }}
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Card de recursos premium */}
        <Card className="border border-gradient-to-r from-blue-500/20 to-purple-500/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg sm:text-xl font-semibold">Recursos Avançados</h3>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Nossa IA jurídica oferece análise avançada de documentos, geração de peças processuais, 
                pesquisa jurisprudencial inteligente e consultoria personalizada - tudo isso 
                treinada para auxiliar em questões jurídicas, elaboração de peças processuais e esclarecimentos legais.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Video Modal */}
        {showVideo && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-background rounded-lg w-full max-w-4xl h-[70vh] relative">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b py-[7px] px-[10px]">
                <h3 className="text-base sm:text-lg font-semibold">Demonstração da IA Jurídica</h3>
                <Button variant="ghost" size="icon" onClick={closeVideo}>
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
              <div className="p-3 sm:p-4 h-full px-0 py-[3px]">
                <iframe 
                  src="https://www.youtube.com/embed/HlE9u1c_MPQ" 
                  className="w-full h-full rounded" 
                  title="Demonstração da IA Jurídica" 
                  frameBorder="0" 
                  allowFullScreen 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};