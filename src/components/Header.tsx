import { Button } from "@/components/ui/button";
import { MessageSquare, Vote, UserX, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  activeTab: 'feed' | 'anonymous' | 'admin';
  onTabChange: (tab: 'feed' | 'anonymous' | 'admin') => void;
  isAdmin?: boolean;
}

const Header = ({ activeTab, onTabChange, isAdmin = false }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-gradient-card backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-post">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Digital Notice Board
              </h1>
              <p className="text-sm text-muted-foreground">College Community Hub</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Button
              variant={activeTab === 'feed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('feed')}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </Button>
            
            <Button
              variant={activeTab === 'anonymous' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabChange('anonymous')}
              className="flex items-center space-x-2"
            >
              <UserX className="h-4 w-4" />
              <span className="hidden sm:inline">Anonymous</span>
            </Button>
            
            {isAdmin && (
              <Button
                variant={activeTab === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('admin')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;