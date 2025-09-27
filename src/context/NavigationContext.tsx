
import React, { createContext, useContext, useState, memo, useCallback, useMemo } from 'react';

interface NavigationContextType {
  currentFunction: string | null;
  setCurrentFunction: (func: string | null) => void;
  isInFunction: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const [currentFunction, setCurrentFunction] = useState<string | null>(null);

  const handleSetCurrentFunction = useCallback((func: string | null) => {
    console.log('NavigationContext - Definindo função:', func);
    setCurrentFunction(func);
  }, []);

  const value = useMemo(() => ({
    currentFunction,
    setCurrentFunction: handleSetCurrentFunction,
    isInFunction: currentFunction !== null,
  }), [currentFunction, handleSetCurrentFunction]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
});

NavigationProvider.displayName = 'NavigationProvider';

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
