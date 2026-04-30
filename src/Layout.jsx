import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils'; // FIXED PATH
import { Home, Calendar, Archive, Settings, Heart } from 'lucide-react';
import { cn } from '@/lib/utils'; // FIXED PATH
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children, currentPageName }) {
  const hideNav = currentPageName === 'Welcome';
  const navigate = useNavigate();

  React.useEffect(() => {
    if (hideNav) return;

    // Check if it's been more than 7 days since last backup
    const lastBackupStr = localStorage.getItem('last_backup_date');
    const now = new Date();

    if (!lastBackupStr) {
      // First time check, set to now so we wait 7 days
      localStorage.setItem('last_backup_date', now.toISOString());
    } else {
      const lastBackup = new Date(lastBackupStr);
      const diffTime = Math.abs(now - lastBackup);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 7) {
        toast('Time to back up!', {
          description: "It's been a week since your last memory backup.",
          action: {
            label: 'Go to Settings',
            onClick: () => navigate(createPageUrl('Settings'))
          },
          duration: 10000,
        });
        // reset the timer so we don't spam them every time they change routes today
        // We'll give them another week before pestering again if they ignore it
        localStorage.setItem('last_backup_date', now.toISOString());
      }
    }
  }, [hideNav, navigate]);

  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Calendar', icon: Calendar, page: 'Calendar' },
    { name: 'Vault', icon: Archive, page: 'Vault' },
    { name: 'Settings', icon: Settings, page: 'Settings' }
  ];

  return (
    <div className="min-h-screen font-sans">
      <main className={cn(!hideNav && 'pb-24')}>
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
          {/* Floating glass bar */}
          <div className="max-w-md mx-auto bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-3xl px-4 py-2 flex items-center justify-around pointer-events-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className="flex flex-col items-center gap-1 relative group"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-out',
                    isActive
                      ? 'bg-primary/10 scale-100 shadow-sm'
                      : 'bg-transparent text-slate-400 group-hover:bg-slate-50'
                  )}>
                    <Icon 
                      className={cn(
                        'w-6 h-6 transition-all',
                        isActive
                          ? 'text-primary fill-primary/20'
                          : 'stroke-slate-400 group-hover:stroke-slate-600'
                      )} 
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            borderRadius: '16px',
            fontSize: '14px'
          }
        }}
      />
    </div>
  );
}