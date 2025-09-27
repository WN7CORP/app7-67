import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { cacheManager } from '@/utils/cacheManager';

export interface VadeMecumLegalCode {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
}

export interface VadeMecumArticle {
  id: string;
  numero: string;
  conteudo: string;
  codigo_id: string;
  "Número do Artigo"?: string;
  "Artigo"?: string;
}

export const useVadeMecumOptimized = () => {
  const [viewMode, setViewMode] = useState<'categories' | 'articles' | 'reader'>('categories');
  const [selectedCode, setSelectedCode] = useState<VadeMecumLegalCode | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<VadeMecumArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<VadeMecumArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search for better performance
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const legalCodes: VadeMecumLegalCode[] = useMemo(() => [
    {
      id: 'cc',
      name: 'CC',
      fullName: 'Código Civil',
      description: 'Lei nº 10.406/2002 - Regula as relações civis',
      icon: '⚖️',
      color: 'from-blue-600 to-blue-800'
    },
    {
      id: 'cf',
      name: 'CF',
      fullName: 'Constituição Federal',
      description: 'Carta Magna do Brasil de 1988',
      icon: '🏛️',
      color: 'from-green-600 to-green-800'
    },
    {
      id: 'cp',
      name: 'CP',
      fullName: 'Código Penal',
      description: 'Decreto-Lei nº 2.848/1940 - Define crimes e penas',
      icon: '⚔️',
      color: 'from-red-600 to-red-800'
    },
    {
      id: 'cpc',
      name: 'CPC',
      fullName: 'Código de Processo Civil',
      description: 'Lei nº 13.105/2015 - Regula o processo civil',
      icon: '📋',
      color: 'from-purple-600 to-purple-800'
    },
    {
      id: 'cpp',
      name: 'CPP',
      fullName: 'Código de Processo Penal',
      description: 'Decreto-Lei nº 3.689/1941 - Regula o processo penal',
      icon: '🔍',
      color: 'from-orange-600 to-orange-800'
    },
    {
      id: 'clt',
      name: 'CLT',
      fullName: 'Consolidação das Leis do Trabalho',
      description: 'Decreto-Lei nº 5.452/1943 - Direito do trabalho',
      icon: '👷',
      color: 'from-indigo-600 to-indigo-800'
    }
  ], []);

  const filteredArticles = useMemo(() => {
    if (!debouncedSearchTerm) return articles;
    return articles.filter(article => 
      article.numero.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      article.conteudo.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [articles, debouncedSearchTerm]);

  const fetchArticles = useCallback(async (codeId: string) => {
    const cacheKey = `articles-${codeId}`;
    
    // Check cache first
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      setArticles(cached);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch real data from Supabase based on code
      let data: any = [];
      let fetchError: any = null;
      
      switch(codeId) {
        case 'cf':
          ({ data, error: fetchError } = await supabase
            .from('CF88')
            .select('id, "Número do Artigo", Artigo')
            .order('id', { ascending: true })
            .limit(50));
          break;
        case 'cc':
          ({ data, error: fetchError } = await supabase
            .from('CC')
            .select('id, "Número do Artigo", Artigo')
            .order('id', { ascending: true })
            .limit(50));
          break;
        case 'cp':
          ({ data, error: fetchError } = await supabase
            .from('CP')
            .select('id, "Número do Artigo", Artigo')
            .order('id', { ascending: true })
            .limit(50));
          break;
        case 'cpc':
          ({ data, error: fetchError } = await supabase
            .from('CPC')
            .select('id, "Número do Artigo", Artigo')
            .order('id', { ascending: true })
            .limit(50));
          break;
        default:
          ({ data, error: fetchError } = await supabase
            .from('CF88')
            .select('id, "Número do Artigo", Artigo')
            .order('id', { ascending: true })
            .limit(50));
      }

      if (fetchError) throw fetchError;
      
      // Transform data to match expected format
      const transformedArticles = data?.map((item: any) => ({
        id: item.id.toString(),
        numero: item["Número do Artigo"] || item.id.toString(),
        conteudo: item.Artigo || '',
        codigo_id: codeId,
        "Número do Artigo": item["Número do Artigo"],
        "Artigo": item.Artigo
      })) || [];
      
      setArticles(transformedArticles);
      // Cache for 30 minutes
      cacheManager.set(cacheKey, transformedArticles, 30 * 60 * 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    if (viewMode === 'reader') {
      setViewMode('articles');
      setSelectedArticle(null);
    } else if (viewMode === 'articles') {
      setViewMode('categories');
      setSelectedCode(null);
      setArticles([]);
      setSearchTerm('');
    }
  }, [viewMode]);

  const handleCategoryClick = useCallback((code: VadeMecumLegalCode) => {
    setSelectedCode(code);
    setViewMode('articles');
    fetchArticles(code.id);
  }, [fetchArticles]);

  const handleArticleClick = useCallback((article: VadeMecumArticle) => {
    setSelectedArticle(article);
    setViewMode('reader');
  }, []);

  const getPageTitle = useCallback(() => {
    if (viewMode === 'reader' && selectedArticle) {
      return `Art. ${selectedArticle.numero}`;
    } else if (viewMode === 'articles' && selectedCode) {
      return selectedCode.name;
    }
    return 'Vade Mecum';
  }, [viewMode, selectedArticle, selectedCode]);

  return {
    viewMode,
    selectedCode,
    selectedArticle,
    searchTerm,
    setSearchTerm,
    articles: filteredArticles,
    loading,
    error,
    legalCodes,
    handleBack,
    handleCategoryClick,
    handleArticleClick,
    getPageTitle
  };
};