import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Download, Play, Star } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LivroIndicacao {
  id: number;
  Titulo: string;
  Autor: string;
  Sobre: string;
  capa: string;
  Download: string;
  audio: string;
}

export const IndicacoesLivros = () => {
  const { setCurrentFunction } = useNavigation();
  const [livros, setLivros] = useState<LivroIndicacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLivros = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('LIVROS-INDICACAO')
          .select('*')
          .order('Titulo', { ascending: true });

        if (error) throw error;
        setLivros(data || []);
      } catch (error) {
        console.error('Erro ao carregar indicações de livros:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as indicações de livros",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadLivros();
  }, []);

  const handleBack = () => {
    setCurrentFunction(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando indicações...</p>
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
            Indicações de Livros
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Indicações Jurídicas</h2>
            <p className="text-muted-foreground">
              Livros selecionados para aprimorar seus conhecimentos jurídicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {livros.map((livro) => (
              <Card key={livro.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  {livro.capa && (
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                      <img
                        src={livro.capa}
                        alt={livro.Titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                        {livro.Titulo}
                      </h3>
                      {livro.Autor && (
                        <p className="text-sm text-muted-foreground mt-1">
                          por {livro.Autor}
                        </p>
                      )}
                    </div>

                    {livro.Sobre && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {livro.Sobre}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Recomendado
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {livro.Download && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(livro.Download, '_blank')}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {livro.audio && (
                        <Button
                          size="sm"
                          onClick={() => window.open(livro.audio, '_blank')}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Áudio
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {livros.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma indicação encontrada</h3>
              <p className="text-muted-foreground">
                As indicações de livros serão carregadas em breve.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};