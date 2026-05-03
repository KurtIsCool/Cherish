import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils'; // FIXED PATH
import { Home, Calendar, Archive, Settings, Heart } from 'lucide-react';
import { cn } from '@/lib/utils'; // FIXED PATH
import { Toaster } from 'sonner';

export default function Layout({ children, currentPageName }) {
  const hideNav = currentPageName === 'Welcome';

  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Calendar', icon: Calendar, page: 'Calendar' },
    { name: 'Vault', icon: Archive, page: 'Vault' },
    { name: 'Settings', icon: Settings, page: 'Settings' }
  ];

  return (
    <div className="min-h-screen font-sans relative">
      {/* Subtle Premium Pattern Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'80\\' height=\\'80\\' viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23D9777F\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z\\' transform=\\'scale(0.4) translate(20, 20)\\'/%3E%3Cpath d=\\'M12 2L14 9L21 11L14 13L12 20L10 13L3 11L10 9L12 2Z\\' transform=\\'scale(0.4) translate(120, 60)\\'/%3E%3Cpath d=\\'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z\\' transform=\\'scale(0.3) translate(160, 150)\\'/%3E%3Cpath d=\\'M12 2L13 8L19 9L13 10L12 16L11 10L5 9L11 8L12 2Z\\' transform=\\'scale(0.4) translate(40, 140)\\'/%3E%3C/g%3E%3C/svg%3E')",
          backgroundSize: '80px 80px'
        }}
      />

      <main className={cn(!hideNav && 'pb-24', 'max-w-md mx-auto px-6')}>
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