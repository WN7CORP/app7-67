import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap, ExternalLink } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const SimuladosOAB = () => {
  const { setCurrentFunction } = useNavigation();
  const [link, setLink] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLink = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('APP')
          .select('link')
          .eq('funcao', 'Simulados OAB')
          .single();

        if (error) throw error;
        setLink(data?.link || '');
      } catch (error) {
        console.error('Erro ao carregar link:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o link",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadLink();
  }, []);

  const handleBack = () => {
    setCurrentFunction(null);
  };

  const handleOpenLink = () => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Simulados OAB
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Simulados OAB</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Prepare-se com simulados realistas do Exame da OAB com correção detalhada e questões atualizadas
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleOpenLink}
              disabled={!link}
              size="lg"
              className="w-full max-w-md h-14 text-lg"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Acessar Simulados OAB
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Será aberto em uma nova aba
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Questões Atualizadas</h3>
              <p className="text-sm text-muted-foreground">
                Baseadas nos últimos exames da OAB
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Correção Detalhada</h3>
              <p className="text-sm text-muted-foreground">
                Explicações completas para cada questão
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Ambiente Realista</h3>
              <p className="text-sm text-muted-foreground">
                Simule as condições reais do exame
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};