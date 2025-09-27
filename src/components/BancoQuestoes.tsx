import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Target, BookOpen, Brain, Clock, Award, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data para demonstração
const mockQuestoes = [
  {
    id: 1,
    area: "Direito Civil",
    enunciado: "Sobre a capacidade civil das pessoas naturais, é correto afirmar que:",
    alternativas: [
      "A menoridade cessa aos 16 anos completos",
      "A emancipação pode ocorrer pelo casamento",
      "A interdição sempre remove a capacidade civil",
      "A capacidade civil é sempre plena para maiores de idade"
    ],
    respostaCorreta: 1,
    explicacao: "A emancipação pelo casamento é uma das formas previstas no Código Civil para cessar a menoridade.",
    nivel: "Intermediário",
    concurso: "OAB 2023",
    tema: "Capacidade Civil"
  },
  {
    id: 2,
    area: "Direito Penal",
    enunciado: "Em relação aos crimes contra o patrimônio, analise as assertivas:",
    alternativas: [
      "O furto sempre exige violência ou grave ameaça",
      "A apropriação indébita pressupõe coisa alheia móvel",
      "O roubo é modalidade simples de furto",
      "A extorsão não admite tentativa"
    ],
    respostaCorreta: 1,
    explicacao: "A apropriação indébita ocorre quando alguém se apropria de coisa alheia móvel que já estava em sua posse licitamente.",
    nivel: "Básico",
    concurso: "Delegado 2023",
    tema: "Crimes Patrimoniais"
  },
  {
    id: 3,
    area: "Direito Constitucional",
    enunciado: "Sobre os direitos fundamentais na Constituição de 1988:",
    alternativas: [
      "São cláusulas pétreas apenas os direitos individuais",
      "Podem ser restringidos por lei ordinária em qualquer caso",
      "Incluem direitos sociais, individuais e coletivos",
      "Não se aplicam às pessoas jurídicas"
    ],
    respostaCorreta: 2,
    explicacao: "A Constituição de 1988 estabelece um amplo catálogo de direitos fundamentais, incluindo direitos sociais, individuais e coletivos.",
    nivel: "Intermediário",
    concurso: "Procurador 2023",
    tema: "Direitos Fundamentais"
  }
];

const areas = ["Todas as Áreas", "Direito Civil", "Direito Penal", "Direito Constitucional", "Direito Administrativo", "Direito Tributário"];
const niveis = ["Todos os Níveis", "Básico", "Intermediário", "Avançado"];
const concursos = ["Todos os Concursos", "OAB", "Delegado", "Procurador", "Magistratura"];

export const BancoQuestoes = () => {
  const [questoes, setQuestoes] = useState(mockQuestoes);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null);
  const [mostrarResposta, setMostrarResposta] = useState(false);
  const [areaFiltro, setAreaFiltro] = useState("Todas as Áreas");
  const [nivelFiltro, setNivelFiltro] = useState("Todos os Níveis");
  const [concursoFiltro, setConcursoFiltro] = useState("Todos os Concursos");
  const [searchQuery, setSearchQuery] = useState("");
  const [acertos, setAcertos] = useState(0);
  const [tentativas, setTentativas] = useState(0);

  const questoesFiltradas = questoes.filter(questao => {
    const matchArea = areaFiltro === "Todas as Áreas" || questao.area === areaFiltro;
    const matchNivel = nivelFiltro === "Todos os Níveis" || questao.nivel === nivelFiltro;
    const matchConcurso = concursoFiltro === "Todos os Concursos" || questao.concurso.includes(concursoFiltro);
    const matchSearch = !searchQuery || 
      questao.enunciado.toLowerCase().includes(searchQuery.toLowerCase()) ||
      questao.tema.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchArea && matchNivel && matchConcurso && matchSearch;
  });

  const questaoCorrente = questoesFiltradas[questaoAtual];

  const handleResposta = (alternativaIndex: number) => {
    if (mostrarResposta) return;
    
    setRespostaSelecionada(alternativaIndex);
    setMostrarResposta(true);
    setTentativas(prev => prev + 1);
    
    if (alternativaIndex === questaoCorrente?.respostaCorreta) {
      setAcertos(prev => prev + 1);
    }
  };

  const proximaQuestao = () => {
    if (questaoAtual < questoesFiltradas.length - 1) {
      setQuestaoAtual(prev => prev + 1);
      setRespostaSelecionada(null);
      setMostrarResposta(false);
    }
  };

  const questaoAnterior = () => {
    if (questaoAtual > 0) {
      setQuestaoAtual(prev => prev - 1);
      setRespostaSelecionada(null);
      setMostrarResposta(false);
    }
  };

  const reiniciarFiltros = () => {
    setAreaFiltro("Todas as Áreas");
    setNivelFiltro("Todos os Níveis");
    setConcursoFiltro("Todos os Concursos");
    setSearchQuery("");
    setQuestaoAtual(0);
    setRespostaSelecionada(null);
    setMostrarResposta(false);
  };

  if (!questaoCorrente) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Nenhuma questão encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros para encontrar questões.
            </p>
            <Button onClick={reiniciarFiltros}>
              Reiniciar Filtros
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-bold gradient-text mb-3 text-center text-2xl">
            Banco de Questões
          </h1>
          <p className="text-muted-foreground text-base text-center">
            Milhares de questões para concursos públicos
          </p>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{questoesFiltradas.length}</p>
              <p className="text-sm text-muted-foreground">Questões</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{tentativas}</p>
              <p className="text-sm text-muted-foreground">Tentativas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{acertos}</p>
              <p className="text-sm text-muted-foreground">Acertos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">
                {tentativas > 0 ? Math.round((acertos / tentativas) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Aproveitamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar questões ou temas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={areaFiltro} onValueChange={setAreaFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Área do Direito" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={nivelFiltro} onValueChange={setNivelFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Nível de Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  {niveis.map(nivel => (
                    <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={concursoFiltro} onValueChange={setConcursoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Concurso" />
                </SelectTrigger>
                <SelectContent>
                  {concursos.map(concurso => (
                    <SelectItem key={concurso} value={concurso}>{concurso}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questão */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{questaoCorrente.area}</Badge>
                  <Badge variant={questaoCorrente.nivel === 'Básico' ? 'default' : questaoCorrente.nivel === 'Intermediário' ? 'secondary' : 'destructive'}>
                    {questaoCorrente.nivel}
                  </Badge>
                  <Badge variant="outline">{questaoCorrente.tema}</Badge>
                </div>
                <CardTitle className="text-base">
                  Questão {questaoAtual + 1} de {questoesFiltradas.length}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{questaoCorrente.concurso}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base mb-6 leading-relaxed">{questaoCorrente.enunciado}</p>
            
            <div className="space-y-3">
              {questaoCorrente.alternativas.map((alternativa, index) => (
                <button
                  key={index}
                  onClick={() => handleResposta(index)}
                  disabled={mostrarResposta}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    mostrarResposta
                      ? index === questaoCorrente.respostaCorreta
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : index === respostaSelecionada && index !== questaoCorrente.respostaCorreta
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-muted/50 border-border'
                      : respostaSelecionada === index
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      mostrarResposta
                        ? index === questaoCorrente.respostaCorreta
                          ? 'bg-green-500 border-green-500'
                          : index === respostaSelecionada && index !== questaoCorrente.respostaCorreta
                          ? 'bg-red-500 border-red-500'
                          : 'border-muted-foreground'
                        : respostaSelecionada === index
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {mostrarResposta && index === questaoCorrente.respostaCorreta && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                      {mostrarResposta && index === respostaSelecionada && index !== questaoCorrente.respostaCorreta && (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="flex-1">{alternativa}</span>
                  </div>
                </button>
              ))}
            </div>

            {mostrarResposta && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <h4 className="font-semibold text-blue-800 mb-2">Explicação:</h4>
                <p className="text-blue-700">{questaoCorrente.explicacao}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Navegação */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={questaoAnterior}
            disabled={questaoAtual === 0}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {questaoAtual + 1} / {questoesFiltradas.length}
          </span>
          
          <Button
            onClick={proximaQuestao}
            disabled={questaoAtual === questoesFiltradas.length - 1 || !mostrarResposta}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
};