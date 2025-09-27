import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: string;
  category?: string;
}

interface SearchPreviewBarProps {
  placeholder?: string;
  data: any[];
  searchFields: string[];
  onItemClick: (item: any) => void;
  renderResult?: (item: any) => SearchResult;
  maxResults?: number;
  className?: string;
}

export const SearchPreviewBar = ({
  placeholder = "Pesquisar...",
  data = [],
  searchFields,
  onItemClick,
  renderResult,
  maxResults = 5,
  className = ""
}: SearchPreviewBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchQuery = query.toLowerCase();
    const filtered = data.filter(item => 
      searchFields.some(field => {
        const value = getNestedValue(item, field);
        return value && value.toString().toLowerCase().includes(searchQuery);
      })
    ).slice(0, maxResults);

    setResults(filtered);
    setIsOpen(filtered.length > 0);
  }, [query, data, searchFields, maxResults]);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleItemClick = (item: any) => {
    onItemClick(item);
    setQuery('');
    setIsOpen(false);
  };

  const defaultRenderResult = (item: any): SearchResult => ({
    id: item.id || Math.random(),
    title: item.title || item.nome || item.livro || 'Item',
    subtitle: item.subtitle || item.autor || item.area,
    image: item.image || item.imagem || item.capa,
    category: item.category || item.area
  });

  const renderFunc = renderResult || defaultRenderResult;

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="shadow-lg border-border/50 bg-background/95 backdrop-blur-sm">
              <div className="max-h-80 overflow-y-auto">
                {results.map((item, index) => {
                  const result = renderFunc(item);
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleItemClick(item)}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b border-border/30 last:border-0"
                    >
                      {result.image && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {result.subtitle}
                          </p>
                        )}
                        {result.category && (
                          <p className="text-xs text-primary/70 mt-1">
                            {result.category}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};