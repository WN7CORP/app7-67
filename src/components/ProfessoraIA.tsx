import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, GraduationCap, X, Volume2, VolumeX, Mic, MicOff, Camera, FileText, Upload, Paperclip, Image as ImageIcon, Eye, AlertCircle, BookOpen, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { ExplainThisPartModal } from './ExplainThisPartModal';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { MicrophonePermissionModal } from '@/components/MicrophonePermissionModal';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageData?: string;
  file?: {
    name: string;
    type: string;
    url: string;
  };
  showAnalysisOptions?: boolean;
}

interface ProfessoraIAProps {
  video?: any;
  livro?: any;
  area?: string;
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const ProfessoraIA = ({ video, livro, area, isOpen, onClose }: ProfessoraIAProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [showMicPermissionModal, setShowMicPermissionModal] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    isRecording, 
    isTranscribing, 
    startRecording, 
    stopRecording, 
    canRecord,
    error: micError 
  } = useVoiceRecording();

  // Mensagem inicial da professora baseada no contexto
  useEffect(() => {
    if (isOpen) {
      let content = '';
      
      if (video) {
        content = `👋 Olá! Sou a Professora IA e estou aqui para ajudar você com a videoaula "${video.title}"${video.area ? ` da área de ${video.area}` : ''}.

📖 Posso explicar conceitos jurídicos desta videoaula
📝 Esclarecer dúvidas sobre o conteúdo apresentado
🔍 Dar exemplos práticos dos temas abordados
📚 Criar exercícios para fixar o aprendizado
💡 Conectar este conteúdo com outras matérias

O que você gostaria de saber sobre esta videoaula?`;
      } else if (livro) {
        content = `👋 Olá! Sou a Professora IA e já sei que você está estudando o livro "${livro.livro}"${livro.area ? ` da área de ${livro.area}` : ''}${livro.autor ? ` do autor ${livro.autor}` : ''}.

📖 Posso explicar conceitos e capítulos específicos
📝 Esclarecer dúvidas sobre qualquer parte da obra  
🔍 Dar exemplos práticos dos temas abordados
📚 Criar exercícios baseados no conteúdo
💡 Relacionar com jurisprudência e casos práticos

Pode me perguntar qualquer coisa sobre este livro que estou aqui para ajudar!`;
      } else {
        content = `🎓 Olá! Eu sou sua Professora de Direito!

Estou aqui para te ensinar de forma prática e didática.

**exemplos reais**

📄 **Analisar documentos e casos práticos**
👩‍🎓 **Preparar você para OAB e concursos**  
🔍 **Tirar todas as suas dúvidas**
📝 **Revisar seus documentos (PDFs e imagens)**

💡 **Dica**: Pode me mandar qualquer dúvida ou documento que vou te explicar tudo passo a passo!

Vamos começar? O que você gostaria de aprender hoje? 🚀`;
      }

      const initialMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [video, livro, area, isOpen]);

  const sendMessage = async (imageData?: string, autoAnalyze?: boolean) => {
    if ((!inputMessage.trim() && !imageData && !uploadedFile) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: imageData ? 'Pode explicar esta parte?' : (uploadedFile ? (inputMessage || 'Documento enviado para análise') : inputMessage),
      timestamp: new Date(),
      imageData,
      file: uploadedFile ? {
        name: uploadedFile.name,
        type: uploadedFile.type,
        url: URL.createObjectURL(uploadedFile)
      } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentFile = uploadedFile;
    const currentMessage = inputMessage;
    setInputMessage('');
    setUploadedFile(null);
    setIsLoading(true);

    try {
      let contextMessage = '';
      
      if (video) {
        contextMessage = `Contexto: O usuário está assistindo à videoaula "${video.title}"${video.area ? ` da área de ${video.area}` : ''}${video.channelTitle ? ` do canal ${video.channelTitle}` : ''}.`;
      } else if (livro) {
        contextMessage = `Contexto: O usuário está lendo o livro "${livro.livro}"${livro.area ? ` da área de ${livro.area}` : ''}${livro.autor ? ` do autor ${livro.autor}` : ''}.`;
      } else {
        contextMessage = `Contexto: O usuário está estudando${area ? ` na área de ${area}` : ' Direito'}.`;
      }

      let messageToSend = inputMessage;
      let fileDataToSend = null;

      if (imageData) {
        messageToSend = `${contextMessage}

Como Professora IA especializada em Direito, analise a imagem anexada e explique de forma didática, clara e amigável o conteúdo mostrado. Se for parte de um livro ou documento jurídico, contextualize com a obra que o usuário está estudando.

Foque especificamente na área selecionada da imagem e forneça uma explicação detalhada dos conceitos apresentados.`;

        // Convert data URL to base64 without prefix
        const base64Data = imageData.split(',')[1];
        fileDataToSend = {
          data: base64Data,
          mimeType: 'image/png',
          name: 'screenshot.png'
        };
      } else if (currentFile) {
        // Handle PDF/document upload with auto-analysis
        if (autoAnalyze || !currentMessage) {
          messageToSend = `${contextMessage}

Como Professora IA especializada em Direito, analise o documento anexado automaticamente e forneça:

1. **Resumo do conteúdo**: O que o documento aborda
2. **Conceitos jurídicos identificados**: Principais temas jurídicos
3. **Legislação aplicável**: Leis e normas relacionadas
4. **Pontos importantes**: Destaques para estudo
5. **Conexões**: Como se relaciona com outras matérias

Após a análise, pergunte ao usuário o que ele gostaria de saber mais sobre o documento e adicione: ANALYSIS_COMPLETE:SHOW_OPTIONS`;
        } else {
          messageToSend = `${contextMessage}

Como Professora IA especializada em Direito, considerando o documento anexado, responda a seguinte pergunta de forma didática e clara:

${currentMessage}`;
        }

        // Convert file to base64
        const fileBuffer = await currentFile.arrayBuffer();
        const base64String = btoa(
          new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        fileDataToSend = {
          data: base64String,
          mimeType: currentFile.type,
          name: currentFile.name
        };
      } else {
        messageToSend = `${contextMessage}
          
Como Professora IA especializada em Direito, responda em formato MARKDOWN de forma didática, clara e amigável. Use formatação markdown para destacar conceitos importantes, criar listas quando apropriado, e organizar o conteúdo de forma visual. Use exemplos práticos quando possível e conecte com o conteúdo específico que o usuário está estudando.

Pergunta do usuário: ${currentMessage}`;
      }

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: messageToSend,
          fileData: fileDataToSend,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.type === 'user' ? 'user' : 'model',
            content: m.content
          }))
        }
      });

      if (error) throw error;

      // Check if response includes analysis options trigger
      const responseContent = data.response || 'Desculpe, não consegui processar sua solicitação.';
      const showOptions = responseContent.includes('ANALYSIS_COMPLETE:SHOW_OPTIONS');
      const cleanContent = responseContent.replace('ANALYSIS_COMPLETE:SHOW_OPTIONS', '').trim();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: cleanContent,
        timestamp: new Date(),
        showAnalysisOptions: showOptions,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Desculpe, houve um erro temporário. A chave da API foi configurada e a professora IA já deve estar funcionando. Tente novamente em alguns segundos.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrophonePermission = async () => {
    try {
      await startRecording();
      setMicPermissionGranted(true);
      setShowMicPermissionModal(false);
      setTimeout(() => stopRecording(), 100);
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    }
  };

  const handleVoiceRecording = async () => {
    if (!canRecord) {
      setShowMicPermissionModal(true);
      return;
    }

    if (!micPermissionGranted) {
      setShowMicPermissionModal(true);
      return;
    }

    if (isRecording) {
      const transcriptionText = await stopRecording();
      if (transcriptionText) {
        setInputMessage(transcriptionText);
      }
    } else {
      await startRecording();
    }
  };

  const handleExplainImageSelected = (imageData: string) => {
    sendMessage(imageData);
    setShowExplainModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, envie apenas arquivos PDF",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "Por favor, envie arquivos de até 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploadedFile(file);
      setTimeout(() => {
        sendMessage(undefined, true);
      }, 100);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, envie apenas imagens (JPG, PNG)",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "Por favor, envie arquivos de até 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploadedFile(file);
      setTimeout(() => {
        sendMessage(undefined, true);
      }, 100);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  const handleAnalysisOption = async (option: string, lastMessage: Message) => {
    let prompt = '';
    
    switch (option) {
      case 'detailed':
        prompt = 'Faça uma análise detalhada e completa deste documento, incluindo todos os aspectos jurídicos relevantes.';
        break;
      case 'problems':
        prompt = 'Identifique possíveis problemas, inconsistências ou pontos de atenção neste documento.';
        break;
      case 'summary':
        prompt = 'Faça um resumo executivo deste documento destacando os pontos principais.';
        break;
      case 'legal':
        prompt = 'Analise os aspectos legais deste documento e cite a legislação aplicável.';
        break;
      default:
        prompt = option;
    }
    
    setInputMessage(prompt);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const showExplainButton = livro || area === 'Biblioteca Jurídica';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={`fixed z-50 ${isMobile ? 'inset-0' : 'bottom-4 right-4 w-96 h-[600px]'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Chat Container - Dark Mode with Better Contrast */}
          <motion.div 
            className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {/* Header - Dark Theme */}
            <div className="bg-gray-900/95 backdrop-blur-sm p-4 flex items-center justify-between border-b border-gray-700/50 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Professora de Direito</h3>
                  <p className="text-gray-300 text-sm">IA Online agora</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showExplainButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExplainModal(true)}
                    className="text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-full p-2 transition-colors"
                    title="Explicar esta parte"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages - Fixed Scroll Issues */}
            <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pb-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div
                          className={`max-w-[90%] p-4 rounded-2xl break-words shadow-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
                          }`}
                        >
                          {message.imageData && (
                            <div className="mb-2">
                              <img 
                                src={message.imageData} 
                                alt="Imagem enviada" 
                                className="max-w-32 h-auto rounded border"
                              />
                            </div>
                          )}
                          {message.file && (
                            <div className="mb-2 flex items-center gap-2 p-2 bg-gray-700/50 rounded border">
                              {message.file.type.includes('pdf') ? 
                                <FileText className="h-4 w-4" /> : 
                                <Camera className="h-4 w-4" />
                              }
                              <span className="text-xs">{message.file.name}</span>
                            </div>
                          )}
                          {message.type === 'assistant' ? (
                            <div>
                              <MarkdownRenderer 
                                content={message.content} 
                                className="prose prose-invert prose-sm max-w-none text-gray-100 prose-headings:text-gray-100 prose-strong:text-blue-300 prose-em:text-gray-200 prose-code:text-green-300 prose-code:bg-gray-700/50 prose-pre:bg-gray-700/50 prose-blockquote:text-gray-200 prose-li:text-gray-100 prose-a:text-blue-400 prose-ul:text-gray-100 prose-ol:text-gray-100"
                              />
                              
                              {/* Quick Question Cards for Initial Message */}
                              {index === 0 && message.type === 'assistant' && !video && !livro && (
                                <motion.div 
                                  className="mt-6 space-y-3"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <p className="text-gray-300 text-sm font-medium mb-3 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Escolha uma pergunta para começar:
                                  </p>
                                  <div className="grid grid-cols-1 gap-2">
                                    <motion.button
                                      onClick={() => {
                                        setInputMessage("Como posso analisar documentos e casos práticos?");
                                        setTimeout(() => sendMessage(), 100);
                                      }}
                                      className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-3 text-left hover:bg-gray-600/50 transition-all duration-200 text-gray-100 text-sm flex items-center gap-3"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                                      <span className="font-medium">Analisar documentos e casos práticos</span>
                                    </motion.button>
                                    
                                    <motion.button
                                      onClick={() => {
                                        setInputMessage("Como você pode me preparar para OAB e concursos?");
                                        setTimeout(() => sendMessage(), 100);
                                      }}
                                      className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-3 text-left hover:bg-gray-600/50 transition-all duration-200 text-gray-100 text-sm flex items-center gap-3"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />
                                      <span className="font-medium">Preparar você para OAB e concursos</span>
                                    </motion.button>
                                    
                                    <motion.button
                                      onClick={() => {
                                        setInputMessage("Como posso tirar minhas dúvidas jurídicas?");
                                        setTimeout(() => sendMessage(), 100);
                                      }}
                                      className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-3 text-left hover:bg-gray-600/50 transition-all duration-200 text-gray-100 text-sm flex items-center gap-3"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                                      <span className="font-medium">Tirar todas as suas dúvidas</span>
                                    </motion.button>
                                    
                                    <motion.button
                                      onClick={() => {
                                        setInputMessage("Como você pode revisar meus documentos (PDFs e imagens)?");
                                        setTimeout(() => sendMessage(), 100);
                                      }}
                                      className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-3 text-left hover:bg-gray-600/50 transition-all duration-200 text-gray-100 text-sm flex items-center gap-3"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <Upload className="w-4 h-4 text-green-400 shrink-0" />
                                      <span className="font-medium">Revisar seus documentos (PDFs e imagens)</span>
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                              
                              {/* Analysis Options */}
                              {message.showAnalysisOptions && (
                                <motion.div 
                                  className="mt-4 space-y-3"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <p className="text-sm text-gray-300 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Escolha uma opção de análise:
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <motion.button
                                      onClick={() => handleAnalysisOption('detailed', message)}
                                      className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-3 text-gray-100 hover:bg-gray-600/50 transition-all duration-200 text-xs flex items-center gap-2"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Análise Detalhada</span>
                                    </motion.button>
                                    <motion.button
                                      onClick={() => handleAnalysisOption('problems', message)}
                                      className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-3 text-gray-100 hover:bg-gray-600/50 transition-all duration-200 text-xs flex items-center gap-2"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <AlertCircle className="w-3 h-3" />
                                      <span>Identificar Problemas</span>
                                    </motion.button>
                                    <motion.button
                                      onClick={() => handleAnalysisOption('summary', message)}
                                      className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-3 text-gray-100 hover:bg-gray-600/50 transition-all duration-200 text-xs flex items-center gap-2"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <BookOpen className="w-3 h-3" />
                                      <span>Resumo Executivo</span>
                                    </motion.button>
                                    <motion.button
                                      onClick={() => handleAnalysisOption('legal', message)}
                                      className="bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-3 text-gray-100 hover:bg-gray-600/50 transition-all duration-200 text-xs flex items-center gap-2"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <Scale className="w-3 h-3" />
                                      <span>Aspectos Legais</span>
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                          )}
                          <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-300' : 'text-gray-400'}`}>
                            {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div 
                      className="flex justify-start mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="max-w-[80%] p-4 rounded-2xl bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 animate-spin text-blue-400" />
                          <span className="text-sm">Professora IA está pensando...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Input Area - Dark Theme with Better UX */}
            <div className="p-4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 shrink-0">
              {/* Upload File Preview */}
              {uploadedFile && (
                <motion.div 
                  className="mb-3 p-3 bg-gray-800 rounded-xl border border-gray-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {uploadedFile.type.includes('pdf') ? 
                        <FileText className="h-4 w-4 text-blue-400" /> : 
                        <ImageIcon className="h-4 w-4 text-green-400" />
                      }
                      <span className="text-gray-100 text-sm font-medium">{uploadedFile.name}</span>
                      <span className="text-gray-400 text-xs bg-gray-700 px-2 py-1 rounded-full">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeUploadedFile}
                      className="text-gray-400 hover:text-gray-200 hover:bg-gray-700 h-6 w-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* Enhanced Analysis Buttons - Always visible */}
              <div className="mb-4 flex gap-3">
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-gray-800 backdrop-blur-sm border border-gray-600 text-gray-100 hover:bg-gray-700 transition-all duration-200 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Anexar PDF</span>
                </motion.button>
                <motion.button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex-1 bg-gray-800 backdrop-blur-sm border border-gray-600 text-gray-100 hover:bg-gray-700 transition-all duration-200 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ImageIcon className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Anexar Imagem</span>
                </motion.button>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua dúvida jurídica ou anexe um documento..."
                    className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 pr-12 rounded-2xl h-12 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    disabled={isLoading}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVoiceRecording}
                    className={`absolute right-2 top-2 w-8 h-8 p-0 rounded-full transition-all duration-200 ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    }`}
                    disabled={isLoading}
                    title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={(!inputMessage.trim() && !uploadedFile) || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 rounded-2xl w-12 h-12 p-0 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
              
              {/* Hidden File Inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept=".jpg,.jpeg,.png"
                className="hidden"
              />
              
              {/* Status indicators */}
              {isTranscribing && (
                <motion.div 
                  className="mt-2 text-gray-400 text-xs flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-blue-400 rounded-full"
                  />
                  Transcrevendo áudio...
                </motion.div>
              )}
            </div>

            <ExplainThisPartModal
              isOpen={showExplainModal}
              onClose={() => setShowExplainModal(false)}
              onImageSelected={handleExplainImageSelected}
            />
            
            <MicrophonePermissionModal
              isOpen={showMicPermissionModal}
              onRequestPermission={handleMicrophonePermission}
              onClose={() => setShowMicPermissionModal(false)}
              permissionGranted={micPermissionGranted}
              error={micError}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfessoraIA;