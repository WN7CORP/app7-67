import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNativeSpeed } from '@/hooks/useNativeSpeed';

export interface VadeMecumLegalCode {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
  textColor?: string;
}

export interface VadeMecumArticle {
  id: string;
  numero: string;
  conteudo: string;
  codigo_id: string;
  "Número do Artigo"?: string;
  "Artigo"?: string;
}

// Cache em memória para dados críticos
const articlesCache = new Map<string, VadeMecumArticle[]>();
const popularCodes = ['CC', 'CF88', 'CP', 'CPC'];

export const useVadeMecumInstant = () => {
  const [mainView, setMainView] = useState<'selection' | 'categories' | 'articles'>('selection');
  const [categoryType, setCategoryType] = useState<'articles' | 'statutes' | null>(null);
  const [selectedCode, setSelectedCode] = useState<VadeMecumLegalCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<VadeMecumArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCodeId, setLoadingCodeId] = useState<string | null>(null);
  
  const { getInstantData, setInstantData, hasInstantData, instantQuery } = useNativeSpeed();

  // Preload dos códigos mais populares
  useEffect(() => {
    const preloadPopularCodes = async () => {
      const tableMap: Record<string, string> = {
        'CC': 'CC',
        'CF88': 'CF88',
        'CP': 'CP',
        'CPC': 'CPC'
      };

      for (const table of popularCodes) {
        const cacheKey = `articles-${table.toLowerCase()}`;
        if (!hasInstantData(cacheKey)) {
          try {
            const { data } = await supabase
              .from(table as any)
              .select('id, "Número do Artigo", Artigo')
              .order('id', { ascending: true });

            if (data) {
              const transformedArticles = data.map((item: any) => ({
                id: item.id.toString(),
                numero: item["Número do Artigo"] || item.id.toString(),
                conteudo: item.Artigo || '',
                codigo_id: table.toLowerCase(),
                "Número do Artigo": item["Número do Artigo"],
                "Artigo": item.Artigo
              }));
              
              setInstantData(cacheKey, transformedArticles);
              articlesCache.set(cacheKey, transformedArticles);
            }
          } catch (error) {
            console.log(`Preload failed for ${table}:`, error);
          }
        }
      }
    };

    preloadPopularCodes();
  }, [hasInstantData, setInstantData]);

  // Códigos jurídicos
  const articleCodes: VadeMecumLegalCode[] = useMemo(() => [
    { 
      id: 'cc', name: 'CC', fullName: 'Código Civil', 
      description: 'Relações civis entre particulares', 
      icon: '🤝', 
      color: 'bg-gradient-to-br from-blue-600/90 to-blue-700/80 border border-blue-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cdc', name: 'CDC', fullName: 'Código de Defesa do Consumidor', 
      description: 'Proteção dos direitos do consumidor', 
      icon: '🛡️', 
      color: 'bg-gradient-to-br from-green-600/90 to-green-700/80 border border-green-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cf', name: 'CF88', fullName: 'Constituição Federal de 1988', 
      description: 'Lei fundamental do Brasil', 
      icon: '🏛️', 
      color: 'gradient-legal border border-yellow-500/30',
      textColor: 'text-background'
    },
    { 
      id: 'clt', name: 'CLT', fullName: 'Consolidação das Leis do Trabalho', 
      description: 'Direitos e deveres trabalhistas', 
      icon: '👷', 
      color: 'bg-gradient-to-br from-purple-600/90 to-purple-700/80 border border-purple-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cp', name: 'CP', fullName: 'Código Penal', 
      description: 'Crimes e suas punições', 
      icon: '⚖️', 
      color: 'gradient-elegant-red border border-red-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cpc', name: 'CPC', fullName: 'Código de Processo Civil', 
      description: 'Procedimentos processuais cíveis', 
      icon: '📋', 
      color: 'bg-gradient-to-br from-indigo-600/90 to-indigo-700/80 border border-indigo-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'cpp', name: 'CPP', fullName: 'Código de Processo Penal', 
      description: 'Procedimentos penais', 
      icon: '🔍', 
      color: 'bg-gradient-to-br from-orange-600/90 to-orange-700/80 border border-orange-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'ctn', name: 'CTN', fullName: 'Código Tributário Nacional', 
      description: 'Normas gerais de direito tributário', 
      icon: '💰', 
      color: 'bg-gradient-to-br from-teal-600/90 to-teal-700/80 border border-teal-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'ctb', name: 'CTB', fullName: 'Código de Trânsito Brasileiro', 
      description: 'Normas de trânsito', 
      icon: '🚗', 
      color: 'bg-gradient-to-br from-cyan-600/90 to-cyan-700/80 border border-cyan-500/30',
      textColor: 'text-white'
    },
    { 
      id: 'ce', name: 'CE', fullName: 'Código Eleitoral', 
      description: 'Normas eleitorais', 
      icon: '🗳️', 
      color: 'bg-gradient-to-br from-pink-600/90 to-pink-700/80 border border-pink-500/30',
      textColor: 'text-white'
    },
  ], []);

  // Estatutos
  const statuteCodes: VadeMecumLegalCode[] = useMemo(() => [
    { 
      id: 'estatuto-oab', name: 'Estatuto da OAB', fullName: 'Estatuto da Advocacia e da OAB', 
      description: 'Lei nº 8.906/1994', 
      icon: '🎓', 
      color: 'gradient-tools border border-yellow-500/30',
      textColor: 'text-background'
    },
    { 
      id: 'estatuto-idoso', name: 'Estatuto do Idoso', fullName: 'Estatuto do Idoso', 
      description: 'Lei nº 10.741/2003', 
      icon: '👴', 
      color: 'bg-gradient-to-br from-emerald-600/90 to-emerald-700/80 border border-emerald-500/30',
      textColor: 'text-white'
    }
  ], []);

  const currentCodes = categoryType === 'articles' ? articleCodes : statuteCodes;

  // Busca otimizada e instantânea
  const filteredArticles = useMemo(() => {
    const articlesWithNumber = articles.filter(article => 
      article["Número do Artigo"] && article["Número do Artigo"].trim() !== ''
    );
    
    if (!searchTerm.trim()) return articlesWithNumber;
    
    const searchTerm_clean = searchTerm.trim();
    
    // 1. Busca EXATA por número - prioridade máxima
    const exactMatch = articlesWithNumber.find(article => {
      const articleNumber = article["Número do Artigo"]?.trim();
      return articleNumber === searchTerm_clean || 
             articleNumber === `${searchTerm_clean}º` ||
             articleNumber === `Art. ${searchTerm_clean}` ||
             articleNumber === `Artigo ${searchTerm_clean}`;
    });
    
    if (exactMatch) {
      return [exactMatch];
    }
    
    // 2. Busca por número numérico apenas
    const searchNumbers = searchTerm_clean.match(/\d+/g);
    if (searchNumbers && searchNumbers.length > 0) {
      const searchNumber = searchNumbers[0];
      const numberMatch = articlesWithNumber.find(article => {
        const articleNumbers = article["Número do Artigo"]?.match(/\d+/g);
        return articleNumbers && articleNumbers[0] === searchNumber;
      });
      if (numberMatch) {
        return [numberMatch];
      }
    }
    
    // 3. Busca parcial como fallback
    const searchLower = searchTerm_clean.toLowerCase();
    return articlesWithNumber.filter(article => {
      const articleNumber = article["Número do Artigo"]?.toLowerCase() || '';
      const articleContent = article.Artigo?.toLowerCase() || '';
      
      return articleNumber.includes(searchLower) || articleContent.includes(searchLower);
    }).slice(0, 50); // Limitar resultados para performance
  }, [articles, searchTerm]);

  // Buscar artigos com cache instantâneo
  const fetchArticles = useCallback(async (codeId: string) => {
    const cacheKey = `articles-${codeId}`;
    
    // Tentar cache em memória primeiro
    const cachedData = articlesCache.get(cacheKey) || getInstantData(cacheKey);
    if (cachedData) {
      setArticles(cachedData);
      return;
    }

    setLoading(true);
    setLoadingCodeId(codeId);
    try {
      const tableMap: Record<string, string> = {
        'cc': 'CC',
        'cdc': 'CDC', 
        'cf': 'CF88',
        'clt': 'CLT',
        'cp': 'CP',
        'cpc': 'CPC',
        'cpp': 'CPP',
        'ctn': 'CTN',
        'ctb': 'CTB',
        'ce': 'CE',
        'estatuto-oab': 'ESTATUTO - OAB',
        'estatuto-idoso': 'ESTATUTO - IDOSO'
      };

      const tableName = tableMap[codeId];
      if (!tableName) return;

      const { data } = await supabase
        .from(tableName as any)
        .select('id, "Número do Artigo", Artigo')
        .order('id', { ascending: true });

      if (data) {
        const transformedArticles = data.map((item: any) => ({
          id: item.id.toString(),
          numero: item["Número do Artigo"] || item.id.toString(),
          conteudo: item.Artigo || '',
          codigo_id: codeId,
          "Número do Artigo": item["Número do Artigo"],
          "Artigo": item.Artigo
        }));
        
        setArticles(transformedArticles);
        // Duplo cache para máxima performance
        setInstantData(cacheKey, transformedArticles);
        articlesCache.set(cacheKey, transformedArticles);
      }
    } catch (error) {
      console.error('Erro ao buscar artigos:', error);
    } finally {
      setLoading(false);
      setLoadingCodeId(null);
    }
  }, [getInstantData, setInstantData]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    if (mainView === 'articles') {
      setMainView('categories');
      setSelectedCode(null);
      setSearchTerm('');
    } else if (mainView === 'categories') {
      setMainView('selection');
      setCategoryType(null);
    }
  }, [mainView]);

  const handleCategorySelection = useCallback((type: 'articles' | 'statutes') => {
    setCategoryType(type);
    setMainView('categories');
  }, []);

  const handleCodeClick = useCallback((code: VadeMecumLegalCode) => {
    setSelectedCode(code);
    setMainView('articles');
    fetchArticles(code.id);
  }, [fetchArticles]);

  return {
    mainView,
    categoryType,
    selectedCode,
    searchTerm,
    setSearchTerm,
    articles: filteredArticles,
    loading,
    loadingCodeId,
    currentCodes,
    handleBack,
    handleCategorySelection,
    handleCodeClick
  };
};