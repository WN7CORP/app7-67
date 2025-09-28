import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

interface LivroJuridico {
  id: number;
  'Área': string;
  'Profissões': string;
  'Ordem': string;
  'Tema': string;
  'Download': string;
  'Link': string;
  'Capa-area': string;
  'Capa-livro': string;
  'Sobre': string;
  'profissões-area': string;
  'capa-profissao': string;
}

export const useBibliotecaConcursoPublico = () => {
  return useOptimizedQuery({
    queryKey: ['biblioteca-concurso-publico'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('BIBILIOTECA-CONCURSO')
        .select('*')
        .not('Profissões', 'is', null)
        .not('Profissões', 'eq', '')
        .order('Ordem', { ascending: true });

      if (error) {
        console.error('Erro ao buscar biblioteca concurso público:', error);
        throw error;
      }

      return data as LivroJuridico[];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    useExternalCache: true,
  });
};

// Hook para organizar livros por profissão para concurso público
export const useLivrosPorProfissao = () => {
  const { data: livros, isLoading, error } = useBibliotecaConcursoPublico();

  // Criar uma estrutura para organizar por profissões
  const livrosPorProfissao = livros?.reduce((acc, livro) => {
    if (livro['Profissões']) {
      const profissoes = livro['Profissões'].split(',').map(p => p.trim());
      const profissoesArea = livro['profissões-area']?.split(',').map(p => p.trim()) || [];
      const capas = livro['capa-profissao']?.split(',').map(p => p.trim()) || [];
      
      // Para cada profissão, criar entrada se não existir
      profissoes.forEach((profissao, index) => {
        if (profissao && profissao !== '' && !profissao.toLowerCase().includes('oab')) {
          if (!acc[profissao]) {
            // Tentar pegar a capa específica da profissão ou usar a primeira disponível
            let capaEspecifica = capas[index] || null;
            
            // Se não encontrar capa específica, procurar por uma capa que contenha o nome da profissão
            if (!capaEspecifica && livro['Capa-livro']) {
              const nomeSimplificado = profissao.toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[áàâã]/g, 'a')
                .replace(/[éèê]/g, 'e')
                .replace(/[íì]/g, 'i')
                .replace(/[óòôõ]/g, 'o')
                .replace(/[úù]/g, 'u')
                .replace(/ç/g, 'c');
              
              if (livro['Capa-livro'].toLowerCase().includes(nomeSimplificado) || 
                  livro['Capa-livro'].toLowerCase().includes(profissao.toLowerCase())) {
                capaEspecifica = livro['Capa-livro'];
              }
            }
            
            acc[profissao] = {
              livros: [],
              area: profissoesArea[index] || profissao,
              capa: capaEspecifica || livro['Capa-area']
            };
          }
          
          // Se ainda não tem capa e esta é uma imagem relacionada, usar ela
          if (!acc[profissao].capa && livro['Capa-livro']) {
            const nomeSimplificado = profissao.toLowerCase()
              .replace(/\s+/g, '')
              .replace(/[áàâã]/g, 'a')
              .replace(/[éèê]/g, 'e')
              .replace(/[íì]/g, 'i')
              .replace(/[óòôõ]/g, 'o')
              .replace(/[úù]/g, 'u')
              .replace(/ç/g, 'c');
            
            if (livro['Capa-livro'].toLowerCase().includes(nomeSimplificado) || 
                livro['Capa-livro'].toLowerCase().includes(profissao.toLowerCase())) {
              acc[profissao].capa = livro['Capa-livro'];
            }
          }
          
          acc[profissao].livros.push(livro);
        }
      });
    }
    return acc;
  }, {} as Record<string, { livros: LivroJuridico[], area: string, capa: string | null }>) || {};

  const profissoes = Object.keys(livrosPorProfissao).sort();

  return {
    livrosPorProfissao,
    profissoes,
    livros: livros || [],
    isLoading,
    error
  };
};