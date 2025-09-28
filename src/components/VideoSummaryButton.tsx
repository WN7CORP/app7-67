import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface VideoSummaryButtonProps {
  videoUrl?: string;
  videoTitle?: string;
}

export const VideoSummaryButton = ({ videoUrl, videoTitle }: VideoSummaryButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');

  const generateSummary = async () => {
    if (!videoUrl) {
      toast.error('URL do vídeo não encontrada');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-video-summary', {
        body: { 
          videoUrl,
          videoTitle: videoTitle || 'Vídeo'
        }
      });

      if (error) throw error;

      setSummary(data.summary || 'Não foi possível gerar o resumo.');
      toast.success('Resumo gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      toast.error('Erro ao gerar resumo do vídeo');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    setIsOpen(true);
    if (!summary) {
      generateSummary();
    }
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        className="fixed bottom-20 right-4 z-50"
      >
        <Button
          onClick={handleClick}
          size="lg"
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <FileText className="h-6 w-6" />
        </Button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumo do Vídeo
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {videoTitle && (
              <div>
                <h3 className="font-semibold text-primary">{videoTitle}</h3>
              </div>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Gerando resumo...</span>
              </div>
            ) : summary ? (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {summary}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Clique em "Gerar Resumo" para criar um resumo do vídeo
              </div>
            )}
            
            {!loading && !summary && (
              <Button onClick={generateSummary} className="w-full">
                Gerar Resumo
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};