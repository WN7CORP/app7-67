import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'audio' | 'livro' | 'artigo' | 'resumo' | 'flashcard' | 'noticia' | 'lei' | 'jusblog';
  category: string;
  preview: string;
  metadata: {
    author?: string;
    area?: string;
    tema?: string;
    duration?: string;
    originalData?: any;
    tableSource?: string;
    [key: string]: any;
  };
}

const searchInTable = async (table: string, searchTerm: string, type: SearchResult['type'], titleField: string, contentField: string, categoryField?: string) => {
  try {
    const { data, error } = await supabase
      .from(table as any)
      .select('*')
      .or(`${titleField}.ilike.%${searchTerm}%,${contentField}.ilike.%${searchTerm}%${categoryField ? `,${categoryField}.ilike.%${searchTerm}%` : ''}`);

    if (error) {
      console.error(`Error searching in ${table}:`, error);
      return [];
    }

      return data?.map((item: any, index: number) => ({
        id: `${table}-${item.id || index}`,
        title: item[titleField] || 'Sem título',
        content: item[contentField] || '',
        type,
        category: item[categoryField] || item.area || item['Área'] || item.Area || 'Geral',
        preview: (item[contentField] || '').substring(0, 150) + (item[contentField]?.length > 150 ? '...' : ''),
        metadata: {
          author: item.autor || item.Autor,
          area: item.area || item['Área'] || item.Area,
          tema: item.tema || item.Tema,
          assunto: item.Assunto,
          modulo: item.Modulo,
          capa: item.capa || item['Capa-livro'] || item['Capa-area'],
          imagem: item.imagem,
          'capa-area': item['capa-area'] || item['Capa-area'],
          'capa-modulo': item['capa-modulo'] || item['Capa-livro'],
          'capa-livro-link': item['Capa-livro-link'],
          'capa-area-link': item['Capa-area-link'],
          video: item.video,
          link: item.link || item.Link,
          download: item.download || item.Download,
          portal: item.portal,
          data: item.data,
          lei: item.lei,
          numeroArtigo: item['Número do Artigo'],
          originalData: item, // Dados originais para navegação específica
          tableSource: table, // Fonte da tabela para navegação
          ...item
        }
      })) || [];
  } catch (error) {
    console.error(`Error searching in ${table}:`, error);
    return [];
  }
};

export const useGlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['globalSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      setIsSearching(true);
      
      try {
        // Busca otimizada - categorias específicas corrigidas
        const searchPromises = [
          // CURSOS PREPARATÓRIOS - apenas tabela específica de cursos
          searchInTable('CURSOS-APP-VIDEO', searchTerm, 'video', 'Aula', 'conteudo', 'Area'),
          
          // RESUMOS - Resumos jurídicos
          searchInTable('RESUMOS-NOVOS', searchTerm, 'resumo', 'Subtema', 'Resumo detalhado', 'Área'),
          
          // LEIS - Vade Mecum (priorizadas)
          searchInTable('CF88', searchTerm, 'lei', 'Número do Artigo', 'Artigo', ''),
          searchInTable('CC', searchTerm, 'lei', 'Número do Artigo', 'Artigo', ''),
          searchInTable('CDC', searchTerm, 'lei', 'Número do Artigo', 'Artigo', ''),
          searchInTable('CLT', searchTerm, 'lei', 'Número do Artigo', 'Artigo', ''),
          searchInTable('CP', searchTerm, 'lei', 'Número do Artigo', 'Artigo', ''),
          searchInTable('CPC', searchTerm, 'lei', 'Número do Artigo', 'Artigo', ''),
          searchInTable('CPP', searchTerm, 'lei', 'Número do Artigo', 'Artigo', ''),
          
          // Artigos comentados (categorizados como artigos)
          searchInTable('ARITIGOS-COMENTADOS', searchTerm, 'artigo', 'artigo', 'texto', 'Area'),
          
          // Áudio-aulas
          searchInTable('AUDIOAULAS', searchTerm, 'audio', 'titulo', 'descricao', 'area'),
          
          // Notícias
          searchInTable('NOTICIAS-AUDIO', searchTerm, 'noticia', 'Titulo', 'Resumo breve', 'portal'),
          
          // Flashcards
          searchInTable('FLASHCARDS', searchTerm, 'flashcard', 'pergunta', 'resposta', 'area'),
          
          // Biblioteca - Livros (otimizado)
          searchInTable('BIBILIOTECA-NOVA-490', searchTerm, 'livro', 'Tema', 'Sobre', 'Área'),
          searchInTable('BIBLIOTECA-JURIDICA', searchTerm, 'livro', 'livro', 'sobre', 'area'),
          searchInTable('BIBLIOTECA-CLASSICOS', searchTerm, 'livro', 'livro', 'sobre', 'area'),
          
          // Questões OAB
          searchInTable('OAB -EXAME', searchTerm, 'artigo', 'Enunciado', 'comentario', 'area'),
          
          // JusBlog - busca condicional otimizada
          ...(searchTerm.toLowerCase().includes('jusblog') || 
              searchTerm.toLowerCase().includes('blog') ||
              searchTerm.toLowerCase().includes('juridico') ? [
            searchInTable('blog_juridico_artigos', searchTerm, 'jusblog', 'titulo', 'conteudo', 'categoria'),
          ] : [])
        ];

        const results = await Promise.all(searchPromises);
        const flattened = results.flat();
        
        // Ordenação otimizada por relevância e categoria
        const sorted = flattened.sort((a, b) => {
          const searchLower = searchTerm.toLowerCase();
          const aInTitle = a.title.toLowerCase().includes(searchLower);
          const bInTitle = b.title.toLowerCase().includes(searchLower);
          
          // Prioridade 1: Títulos exatos
          if (aInTitle && !bInTitle) return -1;
          if (!aInTitle && bInTitle) return 1;
          
          // Prioridade 2: Por categoria (cursos, resumos, leis primeiro)
          const priorityTypes = ['video', 'resumo', 'lei', 'artigo'];
          const aPriority = priorityTypes.indexOf(a.type);
          const bPriority = priorityTypes.indexOf(b.type);
          
          if (aPriority !== -1 && bPriority === -1) return -1;
          if (aPriority === -1 && bPriority !== -1) return 1;
          if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
          
          return 0;
        });

        // Limitar resultados para melhor performance
        return sorted.slice(0, 100);
      } finally {
        setIsSearching(false);
      }
    },
    enabled: searchTerm.trim().length > 2,
    staleTime: 1000 * 60, // 1 minute cache
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const search = (term: string) => {
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    const key = result.type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<SearchResult['type'], SearchResult[]>);

  return {
    searchTerm,
    searchResults,
    groupedResults,
    isLoading: isLoading || isSearching,
    search,
    clearSearch,
    totalResults: searchResults.length
  };
};