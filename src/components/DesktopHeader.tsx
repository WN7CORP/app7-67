import { Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DesktopHeader = () => {
  return (
    <>
      <header data-desktop-header className="h-20 bg-background/95 backdrop-blur-sm border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
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