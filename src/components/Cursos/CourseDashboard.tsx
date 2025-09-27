import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  Clock, 
  BookOpen,
  Brain,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Flame
} from 'lucide-react';
import { useUserAchievements, useStudySessions } from '@/hooks/useCourseEnhancements';
import { useProgressoUsuario } from '@/hooks/useCursosPreparatorios';
import { useProgressoFaculdade } from '@/hooks/useCursoFaculdade';

interface CourseDashboardProps {
  courseType: 'iniciando' | 'faculdade';
}

export const CourseDashboard = ({ courseType }: CourseDashboardProps) => {
  const { achievements, isLoading: loadingAchievements } = useUserAchievements();
  const { sessions, currentSession, startSession } = useStudySessions();
  const progressoIniciando = useProgressoUsuario();
  const progressoFaculdade = useProgressoFaculdade();

  const [weeklyStats, setWeeklyStats] = useState({
    totalMinutes: 0,
    lessonsWatched: 0,
    quizzesCompleted: 0,
    notesTaken: 0,
    streak: 0
  });

  // Calcular estatísticas da semana
  useEffect(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekSessions = sessions.filter(s => 
      new Date(s.session_date) >= oneWeekAgo
    );

    const stats = weekSessions.reduce((acc, session) => ({
      totalMinutes: acc.totalMinutes + session.total_minutes,
      lessonsWatched: acc.lessonsWatched + session.lessons_watched,
      quizzesCompleted: acc.quizzesCompleted + session.quizzes_completed,
      notesTaken: acc.notesTaken + session.notes_taken
    }), { totalMinutes: 0, lessonsWatched: 0, quizzesCompleted: 0, notesTaken: 0 });

    // Calcular streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasActivity = sessions.some(s => s.session_date === dateStr && s.total_minutes > 0);
      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }

    setWeeklyStats({ ...stats, streak });
  }, [sessions]);

  const achievementsByType = achievements.reduce((acc, achievement) => {
    acc[achievement.achievement_type] = (acc[achievement.achievement_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo de Estudo
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.totalMinutes}min</div>
            <p className="text-xs text-muted-foreground">nos últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aulas Assistidas
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.lessonsWatched}</div>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quizzes Concluídos
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.quizzesCompleted}</div>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sequência
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{weeklyStats.streak}</div>
            <p className="text-xs text-muted-foreground">dias consecutivos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        {/* Conquistas */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Suas Conquistas ({achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAchievements ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando conquistas...</p>
                </div>
              ) : achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma conquista ainda</h3>
                  <p className="text-muted-foreground">
                    Continue estudando para desbloquear suas primeiras conquistas!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.slice(0, 6).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-yellow-800">
                            {achievement.achievement_data?.title || achievement.achievement_type}
                          </h4>
                          <p className="text-sm text-yellow-700">
                            {achievement.achievement_data?.description || 'Conquista desbloqueada!'}
                          </p>
                          <p className="text-xs text-yellow-600 mt-1">
                            {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progresso */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Progresso Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {courseType === 'iniciando' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progresso Total</span>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <p className="text-sm text-muted-foreground">Módulos Concluídos</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">48</div>
                      <p className="text-sm text-muted-foreground">Aulas Assistidas</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progresso da Faculdade</span>
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">3</div>
                      <p className="text-sm text-muted-foreground">Semestres</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">24</div>
                      <p className="text-sm text-muted-foreground">Disciplinas</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Atividade */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma atividade ainda</h3>
                    <p className="text-muted-foreground">
                      Comece a estudar para ver seu histórico aqui!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.slice(0, 10).map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(session.session_date).toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{session.total_minutes}min estudados</span>
                            <span>{session.lessons_watched} aulas</span>
                            <span>{session.quizzes_completed} quizzes</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {session.total_minutes >= 60 && (
                            <Badge variant="outline" className="text-green-600">
                              <Zap className="h-3 w-3 mr-1" />
                              Dedicado
                            </Badge>
                          )}
                          {session.notes_taken >= 5 && (
                            <Badge variant="outline" className="text-blue-600">
                              <Star className="h-3 w-3 mr-1" />
                              Anotador
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};