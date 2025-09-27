import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, GraduationCap, UserPlus } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { CursoIniciando } from './Cursos/CursoIniciando';
import { CursoFaculdade } from './Cursos/CursoFaculdade';
import { CursoArtigoPorArtigo } from './Cursos/CursoArtigoPorArtigo';

type CursoTipo = 'iniciando' | 'faculdade' | 'artigo' | null;

export const CursosPreparatorios = () => {
  const { setCurrentFunction } = useNavigation();
  const [cursoTipo, setCursoTipo] = useState<CursoTipo>(null);

  const handleBack = () => {
    if (cursoTipo) {
      setCursoTipo(null);
    } else {
      setCurrentFunction(null);
    }
  };
  
  // Renderizar componente baseado no tipo selecionado
  if (cursoTipo === 'iniciando') {
    return <CursoIniciando onBack={handleBack} />;
  }
  
  if (cursoTipo === 'faculdade') {
    return <CursoFaculdade onBack={handleBack} />;
  }
  
  if (cursoTipo === 'artigo') {
    return <CursoArtigoPorArtigo onBack={handleBack} />;
  }

  // Tela principal de seleção de curso
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Cursos Preparatórios</h1>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Escolha seu Curso</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Selecione o curso que melhor se adequa ao seu nível de conhecimento
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Iniciando no Direito */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 group border-2 hover:border-primary/50"
            onClick={() => setCursoTipo('iniciando')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Iniciando no Direito</h3>
              <p className="text-muted-foreground mb-4">
                Perfeito para quem está começando a estudar Direito. Conteúdo introdutório e essencial.
              </p>
              <div className="text-sm text-primary font-medium">
                ✓ Conceitos fundamentais<br />
                ✓ Áreas do Direito<br />
                ✓ Base sólida para estudos
              </div>
            </CardContent>
          </Card>

          {/* Faculdade */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 group border-2 hover:border-primary/50"
            onClick={() => setCursoTipo('faculdade')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Faculdade</h3>
              <p className="text-muted-foreground mb-4">
                Conteúdo completo por semestre. Ideal para estudantes universitários.
              </p>
              <div className="text-sm text-primary font-medium">
                ✓ Conteúdo por semestre<br />
                ✓ Matérias universitárias<br />
                ✓ Preparação acadêmica
              </div>
            </CardContent>
          </Card>

          {/* Artigo por Artigo */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 group border-2 hover:border-primary/50"
            onClick={() => setCursoTipo('artigo')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Artigo por Artigo</h3>
              <p className="text-muted-foreground mb-4">
                Estudo detalhado do Código Civil com análise profunda de cada artigo.
              </p>
              <div className="text-sm text-primary font-medium">
                ✓ Código Civil completo<br />
                ✓ Análise detalhada<br />
                ✓ Videoaulas explicativas
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};