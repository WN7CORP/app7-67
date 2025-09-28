import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, GraduationCap, UserPlus, BookOpen, Clock, Users } from 'lucide-react';
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
      {/* Header Sticky */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center h-16 px-4 gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="text-xl font-bold">Cursos Preparatórios</h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 border-b">
        <div className="p-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Cursos Preparatórios
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Escolha o curso que melhor se adequa ao seu nível de conhecimento e objetivos de estudo
          </p>
          
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Modalidades</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">500+</div>
              <div className="text-sm text-muted-foreground">Videoaulas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">100%</div>
              <div className="text-sm text-muted-foreground">Gratuito</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 mb-8">
          {/* Iniciando no Direito */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-500 group hover:scale-[1.02] overflow-hidden border-2 hover:border-primary/50 bg-gradient-to-br from-background to-secondary/5"
            onClick={() => setCursoTipo('iniciando')}
          >
            <div className="relative h-48 bg-gradient-to-br from-green-500/20 to-green-600/10 overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="w-16 h-16 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-3 group-hover:text-green-600 transition-colors">
                Iniciando no Direito
              </h3>
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                Perfeito para quem está começando a estudar Direito. Conteúdo introdutório e essencial para uma base sólida.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span>Conceitos fundamentais</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-green-500" />
                  <span>Áreas do Direito</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Base sólida para estudos</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-green-500/10 rounded-full px-3 py-1 text-center">
                  <span className="text-sm font-medium text-green-600">Iniciante</span>
                </div>
                <div className="text-sm text-muted-foreground">50+ aulas</div>
              </div>
            </CardContent>
          </Card>

          {/* Faculdade */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-500 group hover:scale-[1.02] overflow-hidden border-2 hover:border-primary/50 bg-gradient-to-br from-background to-secondary/5"
            onClick={() => setCursoTipo('faculdade')}
          >
            <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-blue-600/10 overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                Faculdade
              </h3>
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                Conteúdo completo organizado por semestre. Ideal para estudantes universitários de Direito.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span>Conteúdo por semestre</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Matérias universitárias</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Preparação acadêmica</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-blue-500/10 rounded-full px-3 py-1 text-center">
                  <span className="text-sm font-medium text-blue-600">Universitário</span>
                </div>
                <div className="text-sm text-muted-foreground">200+ aulas</div>
              </div>
            </CardContent>
          </Card>

          {/* Artigo por Artigo */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-500 group hover:scale-[1.02] overflow-hidden border-2 hover:border-primary/50 bg-gradient-to-br from-background to-secondary/5 md:col-span-2 xl:col-span-1"
            onClick={() => setCursoTipo('artigo')}
          >
            <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-purple-600/10 overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="w-16 h-16 bg-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">
                Artigo por Artigo
              </h3>
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                Estudo detalhado do Código Civil com análise profunda e explicação de cada artigo.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  <span>Código Civil completo</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Análise detalhada</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span>Videoaulas explicativas</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-purple-500/10 rounded-full px-3 py-1 text-center">
                  <span className="text-sm font-medium text-purple-600">Aprofundado</span>
                </div>
                <div className="text-sm text-muted-foreground">1000+ artigos</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Features Section */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center mb-8">O que você terá acesso</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Videoaulas HD</h4>
              <p className="text-sm text-muted-foreground">Aulas em alta qualidade com áudio cristalino</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Acesso 24h</h4>
              <p className="text-sm text-muted-foreground">Estude no seu ritmo, quando quiser</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Suporte IA</h4>
              <p className="text-sm text-muted-foreground">Professora IA para tirar suas dúvidas</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Material Extra</h4>
              <p className="text-sm text-muted-foreground">PDFs e materiais de apoio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};