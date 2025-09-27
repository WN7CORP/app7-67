import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<{ url: string; texto?: string }> => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use PDF ou imagens (JPG, PNG, WebP).');
      }

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 10MB.');
      }

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${userId}/${fileName}`;
      
      setUploadProgress(30);

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('redacao-arquivos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      // Obter URL público
      const { data: urlData } = supabase.storage
        .from('redacao-arquivos')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      setUploadProgress(80);

      // Salvar informações no banco
      const { data: fileRecord, error: dbError } = await supabase
        .from('redacao_arquivos')
        .insert({
          user_id: userId,
          nome_arquivo: file.name,
          tipo_arquivo: file.type,
          url_arquivo: fileUrl,
          tamanho_arquivo: file.size,
          status_processamento: 'concluido'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);

      let textoExtraido: string | undefined;

      // Se for PDF ou imagem, tentar extrair texto
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        try {
          const { data: ocrData, error: ocrError } = await supabase.functions.invoke('extract-text', {
            body: { 
              fileUrl, 
              fileType: file.type,
              fileName: file.name 
            }
          });

          if (ocrData && !ocrError) {
            textoExtraido = ocrData.texto;
            
            // Atualizar registro com texto extraído
            await supabase
              .from('redacao_arquivos')
              .update({ texto_extraido: textoExtraido })
              .eq('id', fileRecord.id);
          }
        } catch (ocrError) {
          console.warn('Erro na extração de texto:', ocrError);
          // Não falhar o upload se OCR falhar
        }
      }

      toast({
        title: "Upload concluído!",
        description: "Arquivo enviado com sucesso.",
      });

      return { 
        url: fileUrl, 
        texto: textoExtraido 
      };

    } catch (err) {
      console.error('Erro no upload:', err);
      toast({
        title: "Erro no upload",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('redacao-arquivos')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Arquivo excluído",
        description: "O arquivo foi removido com sucesso.",
      });
    } catch (err) {
      console.error('Erro ao excluir arquivo:', err);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o arquivo.",
        variant: "destructive",
      });
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadFile,
    deleteFile
  };
};