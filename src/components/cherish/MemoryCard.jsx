import React, { useState } from 'react';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';
import { categoryConfig } from './CategoryIcon';

export default function MemoryCard({ memory }) {
  const [imageError, setImageError] = useState(false);
  const config = categoryConfig[memory.category];
  
  // Guard clause: if config is missing or category is invalid, don't crash
  if (!config) return null;
  
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Category Icon Box */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        
        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700 capitalize">
              {config.label}
            </span>
            <span className="text-xs text-slate-400">
              {/* Parse date safely to avoid Invalid Date errors */}
              {memory.memory_date ? format(new Date(memory.memory_date), 'MMM d') : ''}
            </span>
          </div>
          
          {memory.location && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{memory.location}</span>
            </div>
          )}
          
          {memory.notes && (
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{memory.notes}</p>
          )}
        </div>
      </div>
      
      {/* Image Section with Error Handling */}
      {memory.photo_url && !imageError && (
        <div className="mt-3 rounded-xl overflow-hidden bg-slate-50">
          <img 
            src={memory.photo_url} 
            alt="Memory" 
            className="w-full h-32 object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}