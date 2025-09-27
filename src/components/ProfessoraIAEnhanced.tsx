import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Upload, Mic, Brain, FileText, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProfessoraIAEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  bookContext?: {
    titulo: string;
    autor?: string;
    area: string;
    sobre?: string;
  };
}

export const ProfessoraIAEnhanced = ({ isOpen, onClose, bookContext }: ProfessoraIAEnhancedProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && bookContext) {
      // Mensagem inicial com contexto do livro
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Olá! Sou sua professora de Direito. Vejo que você está estudando "${bookContext.titulo}"${bookContext.autor ? ` de ${bookContext.autor}` : ''} na área de ${bookContext.area}. 

Como posso ajudá-la com seus estudos? Posso:
📚 Explicar conceitos do livro
🔍 Analisar documentos ou prints que você enviar
❓ Responder dúvidas específicas
📝 Criar resumos e exercícios
⚖️ Dar exemplos práticos jurídicos

O que gostaria de estudar hoje?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else if (isOpen) {
      // Mensagem inicial sem contexto específico
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Olá! Sou sua professora de Direito. Como posso ajudá-la com seus estudos hoje?

Posso:
📚 Explicar conceitos jurídicos
🔍 Analisar documentos ou prints que você enviar
❓ Responder dúvidas específicas
📝 Criar resumos e exercícios
⚖️ Dar exemplos práticos

O que gostaria de estudar?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, bookContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && !files?.length) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || 'Documento anexado',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let prompt = content;
      
      // Se há contexto do livro, incluir nas mensagens
      if (bookContext) {
        prompt = `Contexto: O aluno está estudando o livro "${bookContext.titulo}"${bookContext.autor ? ` de ${bookContext.autor}` : ''} na área de ${bookContext.area}.${bookContext.sobre ? ` Sobre o livro: ${bookContext.sobre}` : ''}

Pergunta do aluno: ${content}

Responda como uma professora de Direito experiente, relacionando a pergunta com o contexto do livro quando relevante.`;
      }

      // Processar arquivos se existirem
      if (files?.length) {
        // Aqui você pode implementar upload e análise de arquivos
        prompt += `\n\nO aluno enviou ${files.length} arquivo(s) para análise.`;
      }

      const { data, error } = await supabase.functions.invoke('gemini-ai-chat', {
        body: {
          message: prompt,
          conversationHistory: messages.slice(-10) // Últimas 10 mensagens para contexto
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em alguns segundos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') || 
      file.type === 'application/pdf' ||
      file.size <= 10 * 1024 * 1024 // 10MB
    );

    if (validFiles.length > 0) {
      sendMessage(`Analisando ${validFiles.length} arquivo(s)...`, validFiles);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Envie apenas imagens ou PDFs de até 10MB.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-gradient-to-br from-background to-background/95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center">
              👩‍🏫
            </div>
            Professora de Direito
            {bookContext && (
              <span className="text-sm font-normal text-muted-foreground">
                • {bookContext.titulo}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Área de mensagens */}
          <ScrollArea 
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card className={`max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center text-white flex-shrink-0">
                              👩‍🏫
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-white animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12 border-2 border-dashed border-primary rounded-lg bg-primary/5"
                >
                  <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-primary font-semibold">
                    Solte aqui para enviar à professora
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Imagens, PDFs ou documentos (máx. 10MB)
                  </p>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Área de input */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua pergunta ou dúvida..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(inputMessage);
                  }
                }}
                className="flex-1"
                disabled={isLoading}
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => sendMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>Você pode enviar PDFs, imagens ou fazer perguntas sobre o livro</span>
            </div>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          accept="image/*,application/pdf"
          multiple
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
};