import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Play, BookOpen, Clock, Users, ChevronRight, PlayCircle, TrendingUp, GraduationCap, UserPlus } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useCursosOrganizados, useProgressoUsuario, CursoArea, CursoModulo, CursoAula } from '@/hooks/useCursosPreparatorios';
import { useFaculdadeOrganizada, useProgressoFaculdade, SemestreFaculdade, ModuloFaculdade, TemaFaculdade, AulaFaculdadeCompleta } from '@/hooks/useCursoFaculdade';
import { useCursosCoversPreloader } from '@/hooks/useCoverPreloader';
import { CursosVideoPlayer } from '@/components/CursosVideoPlayer';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import ProfessoraIA from './ProfessoraIA';
import { ProfessoraIAFloatingButton } from './ProfessoraIAFloatingButton';
import { LessonActionButtons } from './Cursos/LessonActionButtons';

type CursoTipo = 'iniciando' | 'faculdade' | null;

export const CursosPreparatorios = () => {
  const { setCurrentFunction } = useNavigation();
  const [cursoTipo, setCursoTipo] = useState<CursoTipo>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para Cursos Iniciando no Direito
  const [selectedArea, setSelectedArea] = useState<CursoArea | null>(null);
  const [selectedModulo, setSelectedModulo] = useState<CursoModulo | null>(null);
  const [selectedAula, setSelectedAula] = useState<CursoAula | null>(null);
  
  // Estados para Cursos de Faculdade
  const [selectedSemestre, setSelectedSemestre] = useState<SemestreFaculdade | null>(null);
  const [selectedModuloFaculdade, setSelectedModuloFaculdade] = useState<ModuloFaculdade | null>(null);
  const [selectedTema, setSelectedTema] = useState<TemaFaculdade | null>(null);
  const [selectedAulaFaculdade, setSelectedAulaFaculdade] = useState<AulaFaculdadeCompleta | null>(null);
  
  const [showProfessora, setShowProfessora] = useState(false);
  
  // Hooks para Cursos Iniciando no Direito
  const { areas, totalAreas, totalModulos, totalAulas, isLoading: isLoadingIniciando, error: errorIniciando } = useCursosOrganizados();
  const { 
    atualizarProgresso, 
    obterProgresso, 
    calcularProgressoModulo, 
    calcularProgressoArea 
  } = useProgressoUsuario();
  
  // Hooks para Cursos de Faculdade
  const { semestres, totalSemestres, totalModulos: totalModulosFaculdade, totalAulas: totalAulasFaculdade, isLoading: isLoadingFaculdade, error: errorFaculdade } = useFaculdadeOrganizada();
  const { 
    atualizarProgresso: atualizarProgressoFaculdade, 
    obterProgresso: obterProgressoFaculdade, 
    calcularProgressoTema, 
    calcularProgressoModulo: calcularProgressoModuloFaculdade, 
    calcularProgressoSemestre 
  } = useProgressoFaculdade();
  
  const isLoading = isLoadingIniciando || isLoadingFaculdade;
  const error = errorIniciando || errorFaculdade;
  
  // Preload covers for instant loading
  useCursosCoversPreloader(areas);

  const handleBack = () => {
    if (selectedAula) {
      setSelectedAula(null);
    } else if (selectedModulo) {
      setSelectedModulo(null);
    } else if (selectedArea) {
      setSelectedArea(null);
    } else if (selectedAulaFaculdade) {
      setSelectedAulaFaculdade(null);
    } else if (selectedTema) {
      setSelectedTema(null);
    } else if (selectedModuloFaculdade) {
      setSelectedModuloFaculdade(null);
    } else if (selectedSemestre) {
      setSelectedSemestre(null);
    } else if (cursoTipo) {
      setCursoTipo(null);
    } else {
      setCurrentFunction(null);
    }
  };

  const handleVideoProgress = (currentTime: number, duration: number) => {
    if (selectedAula) {
      atualizarProgresso(selectedAula.id, currentTime, duration);
    } else if (selectedAulaFaculdade) {
      atualizarProgressoFaculdade(selectedAulaFaculdade.id, currentTime, duration);
    }
  };

  const handleVideoEnd = () => {
    if (selectedAula && selectedModulo) {
      // Find next lesson in the current module
      const currentAulaIndex = selectedModulo.aulas.findIndex(a => a.id === selectedAula.id);
      const nextAula = selectedModulo.aulas[currentAulaIndex + 1];
      
      if (nextAula) {
        // Go to next lesson
        setSelectedAula(nextAula);
      } else {
        // No more lessons in this module, go back to module view
        setSelectedAula(null);
      }
    } else if (selectedAulaFaculdade && selectedTema) {
      // Find next lesson in the current theme
      const currentAulaIndex = selectedTema.aulas.findIndex(a => a.id === selectedAulaFaculdade.id);
      const nextAula = selectedTema.aulas[currentAulaIndex + 1];
      
      if (nextAula) {
        // Go to next lesson
        setSelectedAulaFaculdade(nextAula);
      } else {
        // No more lessons in this theme, go back to theme view
        setSelectedAulaFaculdade(null);
      }
    }
  };

  const handleNearVideoEnd = () => {
    // Mark current lesson as 100% complete when 3 seconds remaining
    if (selectedAula) {
      const durationInSeconds = selectedAula.duracao * 60;
      atualizarProgresso(selectedAula.id, durationInSeconds, durationInSeconds);
    } else if (selectedAulaFaculdade) {
      const durationInSeconds = selectedAulaFaculdade.duracao * 60;
      atualizarProgressoFaculdade(selectedAulaFaculdade.id, durationInSeconds, durationInSeconds);
    }
  };

  const filteredAreas = areas.filter(area =>
    area.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.modulos.some(modulo =>
      modulo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modulo.aulas.some(aula =>
        aula.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aula.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aula.assunto.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  const filteredSemestres = semestres.filter(semestre =>
    semestre.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    semestre.modulos.some(modulo =>
      modulo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modulo.temas.some(tema =>
        tema.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tema.aulas.some(aula =>
          aula.nome.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    )
  );

  if (isLoading) {
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando cursos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar cursos</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de seleção inicial - Iniciando no Direito ou Faculdade
  if (!cursoTipo) {
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

        <div className="p-4 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Escolha seu tipo de curso</h2>
            <p className="text-muted-foreground">
              Selecione o curso que melhor se adequa ao seu nível e objetivos
            </p>
          </div>

          <div className="grid gap-6">
            {/* Iniciando no Direito */}
            <div
              onClick={() => setCursoTipo('iniciando')}
              className="bg-card rounded-xl p-6 cursor-pointer hover:bg-accent/50 transition-colors border border-border group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <UserPlus className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Iniciando no Direito</h3>
                  <p className="text-muted-foreground mb-3">
                    Ideal para quem está começando a estudar direito agora
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{totalAreas} áreas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      <span>{totalAulas} aulas</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Faculdade */}
            <div
              onClick={() => setCursoTipo('faculdade')}
              className="bg-card rounded-xl p-6 cursor-pointer hover:bg-accent/50 transition-colors border border-border group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <GraduationCap className="w-8 h-8 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Faculdade</h3>
                  <p className="text-muted-foreground mb-3">
                    Todas as matérias que ensinam na faculdade de direito
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{totalSemestres} semestres</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      <span>{totalAulasFaculdade} aulas</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Visualização de aula individual para Faculdade
  if (selectedAulaFaculdade) {
    const progresso = obterProgressoFaculdade(selectedAulaFaculdade.id);
    
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <div className="ml-4 flex-1">
              <Badge variant="outline" className="mr-2">
                {selectedAulaFaculdade.semestre}º Semestre - {selectedAulaFaculdade.modulo}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          {/* Player de Vídeo */}
          <div className="mb-6">
            <CursosVideoPlayer
              videoUrl={selectedAulaFaculdade.video}
              title={selectedAulaFaculdade.nome}
              subtitle={`${selectedAulaFaculdade.semestre}º Semestre • ${selectedAulaFaculdade.tema}`}
              onProgress={handleVideoProgress}
              initialTime={progresso?.tempoAssistido || 0}
              onEnded={handleVideoEnd}
              onNearEnd={handleNearVideoEnd}
              autoPlay={true}
              lesson={{
                id: selectedAulaFaculdade.id,
                area: selectedAulaFaculdade.semestre + 'º Semestre',
                tema: selectedAulaFaculdade.tema,
                assunto: selectedAulaFaculdade.nome,
                conteudo: selectedAulaFaculdade.conteudo
              }}
            />
          </div>

          {/* Informações da Aula */}
          <div className="bg-card rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{selectedAulaFaculdade.nome}</h1>
            <p className="text-lg text-muted-foreground mb-4">{selectedAulaFaculdade.tema}</p>
            
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedAulaFaculdade.duracao}min</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{progresso?.percentualAssistido || 0}% assistido</span>
              </div>
            </div>

            {progresso && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progresso da aula</span>
                  <span className="text-sm text-muted-foreground">{progresso.percentualAssistido}%</span>
                </div>
                <Progress value={progresso.percentualAssistido} className="h-2" />
              </div>
            )}
          </div>

          {/* Conteúdo da Aula */}
          {selectedAulaFaculdade.conteudo && (
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Conteúdo da Aula</h2>
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-yellow-500 prose-strong:font-bold prose-li:text-muted-foreground prose-ul:space-y-2 prose-ol:space-y-2">
                <ReactMarkdown 
                  components={{
                    strong: ({ children }) => (
                      <strong className="text-yellow-500 font-bold">{children}</strong>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-2 ml-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-2 ml-4">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>
                    ),
                  }}
                >
                  {selectedAulaFaculdade.conteudo}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Material para Download */}
          {selectedAulaFaculdade.material && (
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Material de Apoio</h2>
              <Button variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Baixar Material
              </Button>
            </div>
          )}

        </div>
        
        {/* Botão Flutuante da Professora IA */}
        <ProfessoraIAFloatingButton 
          onOpen={() => setShowProfessora(true)}
        />
        
        {/* Modal da Professora IA */}
        <ProfessoraIA
          video={{
            title: selectedAulaFaculdade.nome,
            area: selectedAulaFaculdade.semestre + 'º Semestre',
            channelTitle: 'Faculdade de Direito'
          }}
          isOpen={showProfessora}
          onClose={() => setShowProfessora(false)}
        />
      </div>
    );
  }

  // Visualização de aula individual para Iniciando no Direito
  if (selectedAula) {
    const progresso = obterProgresso(selectedAula.id);
    
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <div className="ml-4 flex-1">
              <Badge variant="outline" className="mr-2">
                {selectedAula.area} - {selectedAula.modulo}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          {/* Player de Vídeo */}
          <div className="mb-6">
            <CursosVideoPlayer
              videoUrl={selectedAula.video}
              title={selectedAula.nome}
              subtitle={`${selectedAula.area} • ${selectedAula.tema}`}
              onProgress={handleVideoProgress}
              initialTime={progresso?.tempoAssistido || 0}
              onEnded={handleVideoEnd}
              onNearEnd={handleNearVideoEnd}
              autoPlay={true}
              lesson={{
                id: selectedAula.id,
                area: selectedAula.area,
                tema: selectedAula.tema,
                assunto: selectedAula.assunto,
                conteudo: selectedAula.conteudo
              }}
            />
          </div>

          {/* Informações da Aula */}
          <div className="bg-card rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{selectedAula.nome}</h1>
            <p className="text-lg text-muted-foreground mb-4">{selectedAula.tema}</p>
            
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedAula.duracao}min</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{progresso?.percentualAssistido || 0}% assistido</span>
              </div>
            </div>

            {progresso && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progresso da aula</span>
                  <span className="text-sm text-muted-foreground">{progresso.percentualAssistido}%</span>
                </div>
                <Progress value={progresso.percentualAssistido} className="h-2" />
              </div>
            )}
          </div>

          {/* Conteúdo da Aula */}
          {selectedAula.conteudo && (
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Conteúdo da Aula</h2>
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-yellow-500 prose-strong:font-bold prose-li:text-muted-foreground prose-ul:space-y-2 prose-ol:space-y-2">
                <ReactMarkdown 
                  components={{
                    strong: ({ children }) => (
                      <strong className="text-yellow-500 font-bold">{children}</strong>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-2 ml-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="space-y-2 ml-4">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>
                    ),
                  }}
                >
                  {selectedAula.conteudo}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Material para Download */}
          {selectedAula.material && (
            <div className="bg-card rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Material de Apoio</h2>
              <Button variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Baixar Material
              </Button>
            </div>
          )}

        </div>
        
        {/* Botão Flutuante da Professora IA */}
        <ProfessoraIAFloatingButton 
          onOpen={() => setShowProfessora(true)}
        />
        
        {/* Modal da Professora IA */}
        <ProfessoraIA
          video={{
            title: selectedAula.nome,
            area: selectedAula.area,
            channelTitle: 'Cursos Preparatórios'
          }}
          isOpen={showProfessora}
          onClose={() => setShowProfessora(false)}
        />
      </div>
    );
  }

  // Visualização de módulo com suas aulas
  if (selectedModulo) {
    const progressoModulo = calcularProgressoModulo(selectedModulo.aulas);
    
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selectedModulo.nome}</h1>
          </div>
        </div>

        <div className="p-4">
          {/* Header do Módulo */}
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="relative h-48 rounded-t-xl overflow-hidden">
              <img
                src={selectedModulo.capa || '/placeholder.svg'}
                alt={selectedModulo.nome}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2">{selectedModulo.nome}</h1>
              </div>
            </div>
            
            {/* Info compacta na área cinza */}
            <div className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <PlayCircle className="w-3 h-3" />
                    <span className="font-medium">{selectedModulo.aulas.length}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">{selectedModulo.totalDuracao}min</span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="font-medium text-primary">{progressoModulo}%</span>
                  </div>
                </div>
                <div className="w-24 bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all duration-300" 
                    style={{ width: `${progressoModulo}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Aulas */}
          <div className="space-y-3">
            {selectedModulo.aulas.map((aula, index) => {
              const progresso = obterProgresso(aula.id);
              
              return (
                <div
                  key={aula.id}
                  onClick={() => setSelectedAula(aula)}
                  className="bg-card rounded-lg overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Capa da Aula */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      {aula.capa ? (
                        <img 
                          src={aula.capa} 
                          alt={aula.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{index + 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Informações da Aula */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                        <h3 className="font-medium truncate line-clamp-2 text-sm">{aula.nome}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">{aula.tema}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{aula.duracao}min</span>
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

                    {/* Status da Aula */}
                    <div className="flex items-center gap-2">
                      {progresso?.concluida && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          Concluída
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Barra de Progresso */}
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

  // Visualização de área com seus módulos
  if (selectedArea) {
    const progressoArea = calcularProgressoArea(selectedArea);
    
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selectedArea.nome}</h1>
          </div>
        </div>

        <div className="p-4">
          {/* Header da Área */}
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="relative h-48 rounded-t-xl overflow-hidden">
              <img
                src={selectedArea.capa || '/placeholder.svg'}
                alt={selectedArea.nome}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2">{selectedArea.nome}</h1>
              </div>
            </div>
            
            {/* Info compacta na área cinza */}
            <div className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <BookOpen className="w-3 h-3" />
                    <span className="font-medium">{selectedArea.modulos.length}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <PlayCircle className="w-3 h-3" />
                    <span className="font-medium">{selectedArea.totalAulas}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="font-medium text-primary">{progressoArea}%</span>
                  </div>
                </div>
                <div className="w-24 bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all duration-300" 
                    style={{ width: `${progressoArea}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Módulos com Botão Player */}
          <div className="grid gap-4 md:grid-cols-2">
            {selectedArea.modulos.map((modulo, index) => {
              const progressoModulo = calcularProgressoModulo(modulo.aulas);
              
              return (
                <div
                  key={`${modulo.nome}-${index}`}
                  className="bg-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all group border border-border/50"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={modulo.capa || '/placeholder.svg'} 
                      alt={modulo.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Botão Player Centralizado */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        onClick={() => setSelectedModulo(modulo)}
                        size="lg"
                        className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-full w-16 h-16 shadow-lg"
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                    </div>
                    
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2">
                        {modulo.nome}
                      </h3>
                      
                      {/* Progresso visual */}
                      <div className="w-full bg-white/20 rounded-full h-1">
                        <div 
                          className="bg-primary rounded-full h-1 transition-all duration-300" 
                          style={{ width: `${progressoModulo}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModulo(modulo);
                        }}
                        size="sm"
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 border-none"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4" onClick={() => setSelectedModulo(modulo)}>
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Módulo completo com {modulo.aulas.length} aulas práticas sobre {modulo.nome.toLowerCase()}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                            <PlayCircle className="w-3 h-3" />
                            <span className="font-medium">{modulo.aulas.length}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">{modulo.totalDuracao}min</span>
                          </div>
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3 text-primary" />
                            <span className="font-medium text-primary">{progressoModulo}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    );
  }

  // Visualização de tema com suas aulas (Faculdade)
  if (selectedTema) {
    const progressoTema = calcularProgressoTema(selectedTema.aulas);
    
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
            
            {/* Info compacta na área cinza */}
            <div className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <PlayCircle className="w-3 h-3" />
                    <span className="font-medium">{selectedTema.aulas.length}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">{selectedTema.totalDuracao}min</span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="font-medium text-primary">{progressoTema}%</span>
                  </div>
                </div>
                <div className="w-24 bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all duration-300" 
                    style={{ width: `${progressoTema}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Aulas */}
          <div className="space-y-3">
            {selectedTema.aulas.map((aula, index) => {
              const progresso = obterProgressoFaculdade(aula.id);
              
              return (
                <div
                  key={aula.id}
                  onClick={() => setSelectedAulaFaculdade(aula)}
                  className="bg-card rounded-lg overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Capa da Aula */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      {aula.capa ? (
                        <img 
                          src={aula.capa} 
                          alt={aula.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{aula.numeroAula}</span>
                        </div>
                      )}
                    </div>

                    {/* Informações da Aula */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary">Aula {aula.numeroAula}</span>
                        <h3 className="font-medium truncate line-clamp-2 text-sm">{aula.nome}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-2">{aula.tema}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{aula.duracao}min</span>
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

                    {/* Status da Aula */}
                    <div className="flex items-center gap-2">
                      {progresso?.concluida && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          Concluída
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Barra de Progresso */}
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
  if (selectedModuloFaculdade) {
    const progressoModulo = calcularProgressoModuloFaculdade(selectedModuloFaculdade.temas);
    
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
          {/* Header do Módulo */}
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="relative h-48 rounded-t-xl overflow-hidden">
              <img
                src={selectedModuloFaculdade.capa || '/placeholder.svg'}
                alt={selectedModuloFaculdade.nome}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2">{selectedModuloFaculdade.nome}</h1>
                <p className="text-white/80">{selectedModuloFaculdade.semestre}º Semestre</p>
              </div>
            </div>
            
            {/* Info compacta na área cinza */}
            <div className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <BookOpen className="w-3 h-3" />
                    <span className="font-medium">{selectedModuloFaculdade.temas.length}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">{selectedModuloFaculdade.totalDuracao}min</span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="font-medium text-primary">{progressoModulo}%</span>
                  </div>
                </div>
                <div className="w-24 bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all duration-300" 
                    style={{ width: `${progressoModulo}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Temas */}
          <div className="grid gap-4 md:grid-cols-2">
            {selectedModuloFaculdade.temas.map((tema, index) => {
              const progressoTema = calcularProgressoTema(tema.aulas);
              
              return (
                <div
                  key={`${tema.nome}-${index}`}
                  className="bg-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all group border border-border/50"
                  onClick={() => setSelectedTema(tema)}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={tema.capa || '/placeholder.svg'}
                      alt={tema.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Badge de progresso */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-black/70 px-2 py-1 rounded-full text-xs text-white">
                        {progressoTema}%
                      </div>
                    </div>
                    
                    {/* Título sobreposto */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{tema.nome}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" />
                          <span>{tema.aulas.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{tema.totalDuracao}min</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="mb-3">
                      <Progress value={progressoTema} className="h-1.5" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {progressoTema}% concluído
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Visualização de semestre com seus módulos (Faculdade)
  if (selectedSemestre) {
    const progressoSemestre = calcularProgressoSemestre(selectedSemestre);
    
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
          {/* Header do Semestre */}
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="relative h-48 rounded-t-xl overflow-hidden">
              <img
                src={selectedSemestre.capa || '/placeholder.svg'}
                alt={selectedSemestre.nome}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2">{selectedSemestre.nome}</h1>
              </div>
            </div>
            
            {/* Info compacta na área cinza */}
            <div className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <BookOpen className="w-3 h-3" />
                    <span className="font-medium">{selectedSemestre.modulos.length}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <PlayCircle className="w-3 h-3" />
                    <span className="font-medium">{selectedSemestre.totalAulas}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="font-medium text-primary">{progressoSemestre}%</span>
                  </div>
                </div>
                <div className="w-24 bg-secondary rounded-full h-1.5">
                  <div 
                    className="bg-primary rounded-full h-1.5 transition-all duration-300" 
                    style={{ width: `${progressoSemestre}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Módulos */}
          <div className="grid gap-4 md:grid-cols-2">
            {selectedSemestre.modulos.map((modulo, index) => {
              const progressoModulo = calcularProgressoModuloFaculdade(modulo.temas);
              
              return (
                <div
                  key={`${modulo.nome}-${index}`}
                  className="bg-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all group border border-border/50"
                  onClick={() => setSelectedModuloFaculdade(modulo)}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={modulo.capa || '/placeholder.svg'}
                      alt={modulo.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Badge de progresso */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-black/70 px-2 py-1 rounded-full text-xs text-white">
                        {progressoModulo}%
                      </div>
                    </div>
                    
                    {/* Título sobreposto */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{modulo.nome}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{modulo.temas.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{modulo.totalDuracao}min</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="mb-3">
                      <Progress value={progressoModulo} className="h-1.5" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {progressoModulo}% concluído
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Lista principal para cursos de faculdade
  if (cursoTipo === 'faculdade') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Curso de Faculdade</h1>
          </div>
        </div>

        <div className="p-4">
          {/* Header dos Cursos */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Semestres de Direito</h2>
                <p className="text-muted-foreground">
                  {totalSemestres} semestres • {totalModulosFaculdade} módulos • {totalAulasFaculdade} aulas
                </p>
              </div>
            </div>

            {/* Barra de Pesquisa */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar semestres, módulos ou aulas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Semestres */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSemestres.map((semestre, index) => {
              const progressoSemestre = calcularProgressoSemestre(semestre);
              
              return (
                <div
                  key={`${semestre.numero}-${index}`}
                  className="bg-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all group border border-border/50"
                  onClick={() => setSelectedSemestre(semestre)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={semestre.capa || '/placeholder.svg'}
                      alt={semestre.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Badge de progresso */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-black/70 px-2 py-1 rounded-full text-xs text-white">
                        {progressoSemestre}%
                      </div>
                    </div>
                    
                    {/* Título sobreposto */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg mb-1">{semestre.nome}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{semestre.modulos.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <PlayCircle className="w-4 h-4" />
                          <span>{semestre.totalAulas}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="mb-3">
                      <Progress value={progressoSemestre} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {progressoSemestre}% concluído
                      </span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
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
          {/* Header com Estatísticas */}
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Curso Iniciando no Direito</h2>
            </div>
            
            <div className="relative mb-6">
              <Input
                type="text"
                placeholder="Buscar aulas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <div className="bg-card rounded-lg p-6 mb-6">
              <p className="text-sm text-primary mb-2">● Escolha sua Área de Estudo</p>
              <h3 className="text-2xl font-bold mb-2">Áreas de Conhecimento Jurídico</h3>
              <p className="text-muted-foreground mb-6">
                Selecione uma área para explorar os módulos e aulas especializadas
              </p>
              
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{totalAreas}</div>
                  <div className="text-sm text-muted-foreground">Áreas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{totalModulos}</div>
                  <div className="text-sm text-muted-foreground">Módulos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{totalAulas}</div>
                  <div className="text-sm text-muted-foreground">Aulas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Áreas - Capas Maiores com Botão Iniciar */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 max-w-4xl mx-auto">
            {filteredAreas.map((area, index) => {
              const progressoArea = calcularProgressoArea(area);
              
              return (
                <div
                  key={`${area.nome}-${index}`}
                  className="bg-card rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border border-border/50"
                >
                  <div className="relative">
                    <img 
                      src={area.capa} 
                      alt={area.nome}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Botão de Play Centralizado */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        onClick={() => setSelectedArea(area)}
                        size="lg"
                        className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-full w-20 h-20 shadow-lg animate-pulse-glow"
                      >
                        <Play className="h-8 w-8" />
                      </Button>
                    </div>
                    
                    {/* Informações da Área */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-3xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {area.nome}
                      </h3>
                      
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full">
                          <BookOpen className="h-4 w-4" />
                          <span className="text-sm font-medium">{area.modulos.length} módulos</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full">
                          <Play className="h-4 w-4" />
                          <span className="text-sm font-medium">{area.totalAulas} aulas</span>
                        </div>
                        <div className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">{progressoArea}%</span>
                        </div>
                      </div>
                      
                      {/* Botão Iniciar */}
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all duration-300" 
                              style={{ width: `${progressoArea}%` }}
                            />
                          </div>
                          <p className="text-sm text-white/80">
                            {area.totalAulas - Math.round((progressoArea / 100) * area.totalAulas)} aulas restantes
                          </p>
                        </div>
                        
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedArea(area);
                          }}
                          className="ml-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-full shadow-lg"
                        >
                          Iniciar Curso
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Fallback - não deveria chegar aqui
  return null;
};