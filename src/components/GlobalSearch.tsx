import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ArrowLeft, 
  X,
  Video, 
  Volume2, 
  BookOpen, 
  FileText, 
  ScrollText, 
  Brain,
  Newspaper,
  Sparkles,
  Loader2,
  Clock,
  Play,
  ExternalLink
} from 'lucide-react';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { useAISearchAssistant } from '@/hooks/useAISearchAssistant';
import { useNavigation } from '@/context/NavigationContext';

const typeIcons: Record<SearchResult['type'], any> = {
  video: Video,
  audio: Volume2,
  livro: BookOpen,
  artigo: FileText,
  resumo: ScrollText,
  flashcard: Brain,
  noticia: Newspaper,
  lei: ScrollText,
  jusblog: FileText
};

const typeLabels: Record<SearchResult['type'], string> = {
  video: 'Vídeo',
  audio: 'Áudio',
  livro: 'Livro',
  artigo: 'Artigo',
  resumo: 'Resumo',
  flashcard: 'Flashcard',
  noticia: 'Notícia',
  lei: 'Lei',
  jusblog: 'JusBlog'
};

const typeColors: Record<SearchResult['type'], string> = {
  video: 'bg-red-100 text-red-800 border-red-200',
  audio: 'bg-blue-100 text-blue-800 border-blue-200',
  livro: 'bg-green-100 text-green-800 border-green-200',
  artigo: 'bg-purple-100 text-purple-800 border-purple-200',
  resumo: 'bg-orange-100 text-orange-800 border-orange-200',
  flashcard: 'bg-pink-100 text-pink-800 border-pink-200',
  noticia: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  lei: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  jusblog: 'bg-teal-100 text-teal-800 border-teal-200'
};

interface GlobalSearchProps {
  onClose: () => void;
}

export const GlobalSearch = ({ onClose }: GlobalSearchProps) => {
  const [inputValue, setInputValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchResult['type'] | 'all' | 'cursos' | 'resumos' | 'leis'>('all');
  const { setCurrentFunction } = useNavigation();
  const { 
    searchTerm, 
    searchResults, 
    groupedResults, 
    isLoading, 
    search, 
    clearSearch, 
    totalResults 
  } = useGlobalSearch();
  const { isLoading: aiLoading, suggestions, askAI, clearSuggestions } = useAISearchAssistant();

  // Hide footer menu and other elements when search is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Hide footer menu by adding class to body
    document.body.classList.add('search-modal-open');
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('search-modal-open');
    };
  }, []);

  const handleSearch = () => {
    if (inputValue.trim()) {
      search(inputValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setInputValue('');
    clearSearch();
    clearSuggestions();
    setActiveFilter('all');
  };

  const handleAIHelp = () => {
    if (inputValue.trim()) {
      askAI(inputValue.trim());
    }
  };

  // Filter results based on active filter and limit for performance
  const filteredResults = useMemo(() => {
    let filtered = searchResults;
    
    if (activeFilter === 'cursos') {
      filtered = searchResults.filter(result => result.type === 'video');
    } else if (activeFilter === 'resumos') {
      filtered = searchResults.filter(result => result.type === 'resumo');
    } else if (activeFilter === 'leis') {
      filtered = searchResults.filter(result => result.type === 'lei' || result.type === 'artigo');
    } else if (activeFilter !== 'all') {
      filtered = searchResults.filter(result => result.type === activeFilter);
    }
    
    // Limit to 50 results to prevent UI freezing
    return filtered.slice(0, 50);
  }, [searchResults, activeFilter]);

  // Navigate to function when clicking on result
  const handleResultClick = (result: SearchResult) => {
    // Navegação específica baseada no tipo de conteúdo
    const { tableSource, originalData } = result.metadata;
    
    if (result.type === 'video' && tableSource === 'CURSOS-APP-VIDEO') {
      // Vai para Cursos Preparatórios com o curso específico
      setCurrentFunction('Cursos Preparatórios');
    } else if (result.type === 'resumo') {
      // Vai para Resumos Jurídicos com o resumo específico
      setCurrentFunction('Resumos Jurídicos');
    } else if (result.type === 'lei' || result.type === 'artigo') {
      // Vai para Vade Mecum com a lei específica
      setCurrentFunction('Vade Mecum Digital');
    } else if (result.type === 'livro') {
      // Vai para a biblioteca específica baseada na tabela
      if (tableSource?.includes('CLASSICOS')) {
        setCurrentFunction('Biblioteca Clássicos');
      } else if (tableSource?.includes('JURIDICA')) {
        setCurrentFunction('Biblioteca de Estudos');
      } else {
        setCurrentFunction('Biblioteca Clássicos');
      }
    } else {
      // Mapeamento padrão para outros tipos
      const functionMap: Record<SearchResult['type'], string> = {
        video: 'Videoaulas',
        audio: 'Áudio-aulas', 
        livro: 'Biblioteca Clássicos',
        artigo: 'Artigos Comentados',
        resumo: 'Resumos Jurídicos',
        flashcard: 'Flashcards',
        noticia: 'Notícias Comentadas',
        lei: 'Vade Mecum Digital',
        jusblog: 'Blog Jurídico'
      };
      
      const functionName = functionMap[result.type];
      if (functionName) {
        setCurrentFunction(functionName);
      }
    }
    
    onClose();
  };

  const ResultCard = ({ result }: { result: SearchResult }) => {
    const Icon = typeIcons[result.type];
    
    // Get image/capa from metadata with priority for different content types
    const imageUrl = result.metadata.capa || 
                     result.metadata['Capa-livro'] || 
                     result.metadata['Capa-area'] || 
                     result.metadata['capa-area'] || 
                     result.metadata['capa-modulo'] || 
                     result.metadata.imagem;
    
    return (
      <div 
        className="p-3 rounded-lg border border-border/50 hover:border-border transition-colors duration-200 cursor-pointer bg-background/50 hover:bg-background/80 group"
        onClick={() => handleResultClick(result)}
      >
        <div className="flex items-start gap-3">
          {/* Image/Capa */}
          {imageUrl && (
            <div className="flex-shrink-0">
              <img 
                src={imageUrl} 
                alt={result.title}
                className="w-16 h-12 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Icon when no image */}
          {!imageUrl && (
            <div className="flex-shrink-0 mt-1">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                {result.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {result.type === 'video' && (
                  <Play className="h-3 w-3 text-red-500" />
                )}
                {result.type === 'audio' && (
                  <Volume2 className="h-3 w-3 text-blue-500" />
                )}
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5"
                >
                  {typeLabels[result.type]}
                </Badge>
              </div>
            </div>
            
            {result.category && (
              <p className="text-xs text-muted-foreground mb-1">{result.category}</p>
            )}
            
            {result.preview && (
              <div className="text-xs text-foreground/70 line-clamp-2 mb-2">
                <ReactMarkdown>
                  {result.preview}
                </ReactMarkdown>
              </div>
            )}
            
            {result.metadata.author && (
              <p className="text-xs text-muted-foreground">
                Por: {result.metadata.author}
              </p>
            )}
            
            {/* Video specific info */}
            {result.type === 'video' && (result.metadata.Tema || result.metadata.Assunto) && (
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {result.metadata.Tema || result.metadata.Assunto}
                </p>
              </div>
            )}
            
            {/* Click to access indicator */}
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary">Clique para acessar</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
    >
      {/* Full Screen Modal */}
      <div className="flex flex-col h-screen">
        
        {/* Top Header - Minimal */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2 h-8 px-3 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar</span>
          </Button>
          
          <Button 
            onClick={handleAIHelp}
            disabled={!inputValue.trim() || aiLoading}
            variant="outline"
            className="h-8 px-3 text-xs text-white/70 border-white/20 hover:bg-white/10"
          >
            {aiLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            Ajuda
          </Button>
        </div>

        {/* Center Content Area */}
        <div className="flex-1 flex flex-col items-center justify-start pt-16 px-4">
          
          {!searchTerm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full max-w-lg"
            >
              {/* Search Icon */}
              <Search className="h-16 w-16 text-white/30 mx-auto mb-6" />
              
              {/* Title */}
              <h1 className="text-2xl font-bold text-white mb-4">Busca Global</h1>
              <p className="text-white/70 mb-8 text-sm">
                Digite pelo menos 3 caracteres para buscar em todos os conteúdos
              </p>
              
              {/* Search Bar - Centered */}
              <div className="flex items-center gap-3 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  <Input
                    placeholder="Pesquisar..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 pr-4 h-12 text-white bg-white/10 border-white/20 placeholder:text-white/50 focus:bg-white/15 focus:border-white/30 rounded-xl"
                    autoFocus
                  />
                  {inputValue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-white/50 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <Button 
                  onClick={handleSearch} 
                  disabled={!inputValue.trim() || isLoading}
                  className="h-12 px-8 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Search className="h-5 w-5 mr-2" />
                  )}
                  Buscar
                </Button>
              </div>
              
              {/* Category Pills - Main Categories */}
              <div className="flex flex-wrap justify-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white/70 text-sm">
                  <Video className="h-4 w-4" />
                  Cursos preparatórios
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white/70 text-sm">
                  <ScrollText className="h-4 w-4" />
                  Resumos
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white/70 text-sm">
                  <FileText className="h-4 w-4" />
                  Leis
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white/70 text-sm">
                  <Volume2 className="h-4 w-4" />
                  Artigo
                </div>
              </div>
            </motion.div>
          ) : (
            /* Results Content */
            <div className="w-full max-w-4xl">
              {/* Search Bar - Always visible when searching */}
              <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Pesquisar..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-11 pr-10 h-10 text-white bg-transparent border-0 placeholder:text-white/50 focus:outline-none"
                  />
                  {inputValue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white/50 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <Button 
                  onClick={handleSearch} 
                  disabled={!inputValue.trim() || isLoading}
                  className="h-10 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-1" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>

              {/* Results Area */}
              <div className="bg-background/95 rounded-xl border border-white/10 max-h-[60vh] overflow-hidden">
                {/* AI Suggestions */}
                <AnimatePresence>
                  {suggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 border-b border-border/50"
                    >
                      <div className="text-sm bg-primary/5 p-3 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                          <Sparkles className="h-4 w-4" />
                          <span className="font-medium">Sugestão da IA</span>
                        </div>
                        <p className="text-foreground/90">{suggestions.content}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearSuggestions}
                          className="mt-2 h-6 px-2 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Fechar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter Tabs */}
                {totalResults > 0 && (
                  <div className="p-3 border-b border-border/50 bg-muted/30">
                    <div className="flex gap-1 overflow-x-auto">
                      <button
                        onClick={() => setActiveFilter('all')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          activeFilter === 'all' 
                            ? 'bg-foreground text-background' 
                            : 'bg-background border text-foreground/70 hover:text-foreground'
                        }`}
                      >
                        Todos ({totalResults})
                      </button>
                      
                      {/* Specific Category Filters */}
                      <button
                        onClick={() => setActiveFilter('cursos')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          activeFilter === 'cursos' 
                            ? 'bg-foreground text-background' 
                            : 'bg-background border text-foreground/70 hover:text-foreground'
                        }`}
                      >
                        <Video className="h-3 w-3" />
                        Cursos preparatórios ({groupedResults.video?.length || 0})
                      </button>
                      
                      <button
                        onClick={() => setActiveFilter('resumos')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          activeFilter === 'resumos' 
                            ? 'bg-foreground text-background' 
                            : 'bg-background border text-foreground/70 hover:text-foreground'
                        }`}
                      >
                        <ScrollText className="h-3 w-3" />
                        Resumos ({groupedResults.resumo?.length || 0})
                      </button>
                      
                      <button
                        onClick={() => setActiveFilter('leis')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          activeFilter === 'leis' 
                            ? 'bg-foreground text-background' 
                            : 'bg-background border text-foreground/70 hover:text-foreground'
                        }`}
                      >
                        <FileText className="h-3 w-3" />
                        Leis ({(groupedResults.lei?.length || 0) + (groupedResults.artigo?.length || 0)})
                      </button>
                      
                      {/* Existing Type Filters */}
                      {Object.entries(groupedResults).map(([type, results]) => {
                        if (['video', 'resumo', 'lei', 'artigo'].includes(type)) return null;
                        const Icon = typeIcons[type as SearchResult['type']];
                        const label = typeLabels[type as SearchResult['type']];
                        return (
                          <button
                            key={type}
                            onClick={() => setActiveFilter(type as SearchResult['type'])}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              activeFilter === type 
                                ? 'bg-foreground text-background' 
                                : 'bg-background border text-foreground/70 hover:text-foreground'
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            {label} ({results.length})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Results List - Virtual scrolling for performance */}
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredResults.length > 50 && (
                    <div className="p-2 text-xs text-muted-foreground text-center border-b">
                      Mostrando primeiros 50 resultados de {totalResults} encontrados
                    </div>
                  )}
                  <div className="divide-y divide-border/30">
                    {isLoading ? (
                      <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-sm font-medium">Pesquisando...</p>
                        <p className="text-xs text-muted-foreground">
                          Buscando por "{searchTerm}"
                        </p>
                      </div>
                    ) : filteredResults.length === 0 ? (
                      <div className="text-center py-12 px-6">
                        <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Não encontramos conteúdos para "{searchTerm}"
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        {filteredResults.map((result) => (
                          <ResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};