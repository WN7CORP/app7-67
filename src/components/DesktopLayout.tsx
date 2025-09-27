
import { ReactNode, useState } from 'react';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { DesktopHeader } from '@/components/DesktopHeader';
import { FooterMenu } from '@/components/FooterMenu';


interface DesktopLayoutProps {
  children: ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-72'}`}>
        {/* Desktop Header */}
        <DesktopHeader />
        
        {/* Main Content */}
        <main className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            {children}
          </div>
        </main>
      </div>

      {/* Professora IA Flutuante - removido do layout global */}
    </div>
  );
};
