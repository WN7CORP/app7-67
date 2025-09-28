
import { ReactNode, useState } from 'react';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { DesktopHeader } from '@/components/DesktopHeader';
import { FooterMenu } from '@/components/FooterMenu';
import { useNavigation } from '@/context/NavigationContext';


interface DesktopLayoutProps {
  children: ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentFunction } = useNavigation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar - apenas quando não há função ativa */}
      {!currentFunction && (
        <DesktopSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      )}
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${!currentFunction ? (sidebarCollapsed ? 'ml-16' : 'ml-72') : 'ml-0'} flex flex-col min-w-0`}>
        {/* Desktop Header - apenas quando não há função ativa */}
        {!currentFunction && <DesktopHeader />}
        
        {/* Main Content */}
        <main className={`flex-1 overflow-hidden ${!currentFunction ? 'pt-0' : ''}`}>
          <div className={`h-full ${!currentFunction ? 'max-w-7xl mx-auto px-6 py-8' : ''}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Professora IA Flutuante - removido do layout global */}
    </div>
  );
};
