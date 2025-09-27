import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Play, BookOpen, Clock, Users, ChevronRight, PlayCircle, TrendingUp, GraduationCap, BookOpen as BookOpenIcon } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useCursosOrganizados, useProgressoUsuario, CursoArea, CursoModulo, CursoAula } from '@/hooks/useCursosPreparatorios';
import { useCursoFaculdadeOrganizado, SemestreFaculdade, ModuloFaculdade, TemaFaculdade, AulaFaculdade } from '@/hooks/useCursoFaculdade';
import { useCursosCoversPreloader } from '@/hooks/useCoverPreloader';
import { CursosVideoPlayer } from '@/components/CursosVideoPlayer';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import ProfessoraIA from './ProfessoraIA';
import { ProfessoraIAFloatingButton } from './ProfessoraIAFloatingButton';

type CursoTipo = 'inicial' | 'iniciando' | 'faculdade';

export const CursosPreparatorios = () => {
  const { setCurrentFunction } = useNavigation();
  const [cursoTipo, setCursoTipo] = useState<CursoTipo>('inicial');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para curso "Iniciando no Direito"
  const [selectedArea, setSelectedArea] = useState<CursoArea | null>(null);
  const [selectedModulo, setSelectedModulo] = useState<CursoModulo | null>(null);
  const [selectedAula, setSelectedAula] = useState<CursoAula | null>(null);
  
  // Estados para curso "Faculdade"
  const [selectedSemestre, setSelectedSemestre] = useState<SemestreFaculdade | null>(null);
  const [selectedModuloFaculdade, setSelectedModuloFaculdade] = useState<ModuloFaculdade | null>(null);
  const [selectedTema, setSelectedTema] = useState<TemaFaculdade | null>(null);
  const [selectedAulaFaculdade, setSelectedAulaFaculdade] = useState<AulaFaculdade | null>(null);
  
  const [showProfessora, setShowProfessora] = useState(false);

  // Hooks para "Iniciando no Direito"
  const { areas, totalAreas, totalModulos, totalAulas, isLoading: isLoadingIniciando, error: errorIniciando } = useCursosOrganizados();
  
  // Hooks para "Faculdade"
  const { semestres, totalSemestres, totalModulos: totalModulosFaculdade, totalTemas, totalAulas: totalAulasFaculdade, isLoading: isLoadingFaculdade, error: errorFaculdade } = useCursoFaculdadeOrganizado();
  
  const { 
    atualizarProgresso, 
    obterProgresso, 
    calcularProgressoModulo, 
    calcularProgressoArea 
  } = useProgressoUsuario();
  
  // Preload covers for instant loading
  useCursosCoversPreloader(areas);
  
  const isLoading = isLoadingIniciando || isLoadingFaculdade;
  const error = errorIniciando || errorFaculdade;

  const handleBack = () => {
    if (cursoTipo === 'iniciando') {
      if (selectedAula) {
        setSelectedAula(null);
      } else if (selectedModulo) {
        setSelectedModulo(null);
      } else if (selectedArea) {
        setSelectedArea(null);
      } else {
        setCursoTipo('inicial');
      }
    } else if (cursoTipo === 'faculdade') {
      if (selectedAulaFaculdade) {
        setSelectedAulaFaculdade(null);
      } else if (selectedTema) {
        setSelectedTema(null);
      } else if (selectedModuloFaculdade) {
        setSelectedModuloFaculdade(null);
      } else if (selectedSemestre) {
        setSelectedSemestre(null);
      } else {
        setCursoTipo('inicial');
      }
    } else {
      setCurrentFunction(null);
    }
  };

  // Tela inicial com as duas opções de curso
  if (cursoTipo === 'inicial') {
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

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Escolha seu curso</h2>
              <p className="text-muted-foreground">Selecione o curso ideal para o seu nível de conhecimento</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Iniciando no Direito */}
              <div 
                onClick={() => setCursoTipo('iniciando')}
                className="bg-card rounded-xl p-6 cursor-pointer hover:bg-accent/50 transition-all group border hover:border-primary/30"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <BookOpenIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Iniciando no Direito</h3>
                  <p className="text-muted-foreground mb-4">
                    Para quem está começando agora no mundo jurídico. Conceitos fundamentais e base sólida.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      <span>{totalAreas} áreas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{totalAulas} aulas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Faculdade */}
              <div 
                onClick={() => setCursoTipo('faculdade')}
                className="bg-card rounded-xl p-6 cursor-pointer hover:bg-accent/50 transition-all group border hover:border-primary/30"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Faculdade</h3>
                  <p className="text-muted-foreground mb-4">
                    Todas as matérias ensinadas na faculdade de Direito. Conteúdo completo dos 10 semestres.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      <span>{totalSemestres} semestres</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{totalAulasFaculdade} aulas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lista principal para "Iniciando no Direito"
  if (cursoTipo === 'iniciando') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Iniciando no Direito</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <div
                key={area.nome}
                onClick={() => setSelectedArea(area)}
                className="bg-card rounded-lg overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors group"
              >
                <div className="relative h-32">
                  <img
                    src={area.capa || '/placeholder.svg'}
                    alt={area.nome}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-white font-medium truncate">{area.nome}</h3>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{area.totalAulas} aulas</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};