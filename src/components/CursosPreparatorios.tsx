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

  // Views específicas para Faculdade

  // Visualização de tema com suas aulas (Faculdade)
  if (selectedTema && cursoTipo === 'faculdade') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selectedTema.nome}</h1>
          </div>
        </div>

        <div className="p-4">
          {/* Header do Tema */}
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="relative h-48 rounded-t-xl overflow-hidden">
              <img
                src={selectedTema.capa || '/placeholder.svg'}
                alt={selectedTema.nome}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2">{selectedTema.nome}</h1>
              </div>
            </div>
            
            <div className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <PlayCircle className="w-3 h-3" />
                    <span className="font-medium">{selectedTema.aulas.length} aulas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Aulas */}
          <div className="space-y-3">
            {selectedTema.aulas.map((aula, index) => {
              const progresso = obterProgresso(aula.id);
              
              return (
                <div
                  key={aula.id}
                  onClick={() => setSelectedAulaFaculdade(aula)}
                  className="bg-card rounded-lg overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      {aula.capa_assunto ? (
                        <img 
                          src={aula.capa_assunto} 
                          alt={aula.assunto}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{index + 1}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary">Aula {aula.numero_aula}</span>
                        <h3 className="font-medium truncate line-clamp-2 text-sm">{aula.assunto}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">{aula.tema}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">30min</span>
                        </div>
                        {progresso && (
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {progresso.percentualAssistido}% assistido
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {progresso?.concluida && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          Concluída
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {progresso && progresso.percentualAssistido > 0 && (
                    <div className="px-4 pb-3">
                      <Progress value={progresso.percentualAssistido} className="h-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Visualização de módulo com seus temas (Faculdade)
  if (selectedModuloFaculdade && cursoTipo === 'faculdade') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selectedModuloFaculdade.nome}</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedModuloFaculdade.temas.map((tema) => (
              <div
                key={tema.nome}
                onClick={() => setSelectedTema(tema)}
                className="bg-card rounded-lg overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors group"
              >
                <div className="relative h-32">
                  <img
                    src={tema.capa || '/placeholder.svg'}
                    alt={tema.nome}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-white font-medium text-sm truncate">{tema.nome}</h3>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{tema.aulas.length} aulas</span>
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

  // Visualização de semestre com seus módulos (Faculdade)
  if (selectedSemestre && cursoTipo === 'faculdade') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selectedSemestre.nome}</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {selectedSemestre.modulos.map((modulo) => (
              <div
                key={modulo.nome}
                onClick={() => setSelectedModuloFaculdade(modulo)}
                className="bg-card rounded-lg overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors group"
              >
                <div className="relative h-32">
                  <img
                    src={modulo.capa || '/placeholder.svg'}
                    alt={modulo.nome}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-white font-medium text-sm truncate">{modulo.nome}</h3>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{modulo.totalAulas} aulas</span>
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

  // Lista de semestres (Faculdade)
  if (cursoTipo === 'faculdade') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Faculdade de Direito</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">10 Semestres de Direito</h2>
            <p className="text-muted-foreground">Conteúdo completo da graduação em Direito</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {semestres.map((semestre) => (
              <div
                key={semestre.numero}
                onClick={() => setSelectedSemestre(semestre)}
                className="bg-card rounded-lg overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors group"
              >
                <div className="relative h-32">
                  <img
                    src={semestre.capa || '/placeholder.svg'}
                    alt={semestre.nome}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-white font-medium truncate">{semestre.nome}</h3>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{semestre.totalAulas} aulas</span>
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