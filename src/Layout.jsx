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
    <div className="min-h-screen bg-slate-50">
      <main className={cn(!hideNav && 'pb-20')}>
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-4 py-2 z-50">
          <div className="max-w-lg mx-auto flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300',
                    isActive 
                      ? 'text-slate-700' 
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                    isActive && 'bg-rose-50'
                  )}>
                    <Icon 
                      className={cn(
                        'w-5 h-5 transition-colors',
                        isActive ? 'text-rose-500' : ''
                      )} 
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium',
                    isActive && 'text-rose-600'
                  )}>
                    {item.name}
                  </span>
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