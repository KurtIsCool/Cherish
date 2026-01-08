import React from 'react';
import { Utensils, Gift, MapPin, Film, Heart, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils'; // Updated to use the new utils file

export const categoryConfig = {
  dining: { 
    icon: Utensils, 
    label: 'Dining', 
    color: 'bg-amber-50 text-amber-600',
    dotColor: 'bg-amber-400' 
  },
  gift: { 
    icon: Gift, 
    label: 'Gift', 
    color: 'bg-rose-50 text-rose-500',
    dotColor: 'bg-rose-400'
  },
  date: { 
    icon: MapPin, 
    label: 'Date', 
    color: 'bg-emerald-50 text-emerald-600',
    dotColor: 'bg-emerald-400'
  },
  media: { 
    icon: Film, 
    label: 'Media', 
    color: 'bg-violet-50 text-violet-500',
    dotColor: 'bg-violet-400'
  },
  emotion: { 
    icon: Heart, 
    label: 'Moment', 
    color: 'bg-pink-50 text-pink-500',
    dotColor: 'bg-pink-400'
  },
  conflict: { 
    icon: Cloud, 
    label: 'Reflect', 
    color: 'bg-slate-100 text-slate-500',
    dotColor: 'bg-slate-400'
  }
};

export default function CategoryIcon({ category, size = 'md', onClick, selected }) {
  const config = categoryConfig[category];
  if (!config) return null;
  
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex flex-col items-center gap-2 transition-all duration-300',
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
      )}
    >
      <div className={cn(
        'rounded-2xl flex items-center justify-center transition-all duration-300',
        sizeClasses[size],
        config.color,
        selected && 'ring-2 ring-offset-2 ring-current scale-110'
      )}>
        <Icon className={iconSizes[size]} strokeWidth={1.5} />
      </div>
      <span className="text-xs font-medium text-slate-500">{config.label}</span>
    </button>
  );
}