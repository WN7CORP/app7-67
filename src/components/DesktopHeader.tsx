import { Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DesktopHeader = () => {
  return (
    <>
      <header data-desktop-header className="fixed top-0 right-0 left-72 h-20 bg-background/95 backdrop-blur-sm border-b border-border z-30">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-4">
            {/* Espaço reservado para logo ou título */}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};