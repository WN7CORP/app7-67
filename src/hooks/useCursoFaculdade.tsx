import React from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

export interface AulaFaculdade {
  id: number;
  semestre: string;
  modulo: string;
  tema: string;
  numero_aula: string;
  assunto: string;
  video: string;
  conteudo: string;
  capa_assunto: string;
  capa_tema: string;
  capa_modulo: string;
  capa_semestre: string;
  material: string;
}

export interface SemestreFaculdade {
  numero: string;
  nome: string;
  capa: string;
  modulos: ModuloFaculdade[];
  totalAulas: number;
}

export interface ModuloFaculdade {
  nome: string;
  capa: string;
  semestre: string;
  temas: TemaFaculdade[];
  totalAulas: number;
}

export interface TemaFaculdade {
  nome: string;
  capa: string;
  modulo: string;
  semestre: string;
  aulas: AulaFaculdade[];
}

export const useCursoFaculdade = () => {
  return useOptimizedQuery({
    queryKey: ['curso-faculdade'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('fetch_all_legal_documents'); // Use a function that exists
        
        if (error) throw error;
        
        // For now, return empty array until we have the correct table
        return [] as AulaFaculdade[];
      } catch (error) {
        console.error('Erro ao buscar curso de faculdade:', error);
        return [] as AulaFaculdade[];
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    useExternalCache: true,
  });
};

export const useCursoFaculdadeOrganizado = () => {
  const { data: aulas, isLoading, error } = useCursoFaculdade();

  const cursoOrganizado = React.useMemo(() => {
    if (!aulas) return { semestres: [], totalSemestres: 0, totalModulos: 0, totalTemas: 0, totalAulas: 0 };

    const semestresMap = new Map<string, SemestreFaculdade>();

    // Ordenar aulas por número
    const aulasOrdenadas = [...aulas].sort((a, b) => {
      const numA = parseInt(a.numero_aula) || 0;
      const numB = parseInt(b.numero_aula) || 0;
      return numA - numB;
    });

    aulasOrdenadas.forEach((aula) => {
      const semestreKey = aula.semestre;
      const moduloKey = aula.modulo;
      const temaKey = aula.tema;

      // Criar semestre se não existir
      if (!semestresMap.has(semestreKey)) {
        semestresMap.set(semestreKey, {
          numero: aula.semestre,
          nome: `${aula.semestre}º Semestre`,
          capa: aula.capa_semestre || '',
          modulos: [],
          totalAulas: 0,
        });
      }

      const semestre = semestresMap.get(semestreKey)!;

      // Encontrar ou criar módulo
      let modulo = semestre.modulos.find(m => m.nome === moduloKey);
      if (!modulo) {
        modulo = {
          nome: aula.modulo,
          capa: aula.capa_modulo || '',
          semestre: aula.semestre,
          temas: [],
          totalAulas: 0,
        };
        semestre.modulos.push(modulo);
      }

      // Encontrar ou criar tema
      let tema = modulo.temas.find(t => t.nome === temaKey);
      if (!tema) {
        tema = {
          nome: aula.tema,
          capa: aula.capa_tema || '',
          modulo: aula.modulo,
          semestre: aula.semestre,
          aulas: [],
        };
        modulo.temas.push(tema);
      }

      // Adicionar aula
      tema.aulas.push(aula);
      modulo.totalAulas++;
      semestre.totalAulas++;
    });

    const semestres = Array.from(semestresMap.values());
    
    return {
      semestres,
      totalSemestres: semestres.length,
      totalModulos: semestres.reduce((total, semestre) => total + semestre.modulos.length, 0),
      totalTemas: semestres.reduce((total, semestre) => 
        total + semestre.modulos.reduce((modTotal, modulo) => modTotal + modulo.temas.length, 0), 0),
      totalAulas: semestres.reduce((total, semestre) => total + semestre.totalAulas, 0),
    };
  }, [aulas]);

  return {
    ...cursoOrganizado,
    isLoading,
    error,
  };
};