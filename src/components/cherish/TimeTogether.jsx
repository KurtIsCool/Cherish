import React from 'react';
import { differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';
import { Heart } from 'lucide-react';

export default function TimeTogether({ startDate, partnerName }) {
  const now = new Date();
  const start = new Date(startDate);
  
  const years = differenceInYears(now, start);
  const months = differenceInMonths(now, start) % 12;
  const days = differenceInDays(now, start) % 30;

  const formatTime = () => {
    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (years === 0 && months === 0 && days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    
    if (parts.length === 0) return "It starts today";
    
    return parts.join(', ');
  };

  return (
    <div className="text-center py-8">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-rose-400" fill="currentColor" strokeWidth={0} />
        <span className="text-slate-400 text-sm tracking-wide uppercase">Together</span>
        <Heart className="w-4 h-4 text-rose-400" fill="currentColor" strokeWidth={0} />
      </div>
      
      <h1 className="text-2xl font-light text-slate-700 mb-2">
        {partnerName}
      </h1>
     
      <p className="text-slate-400 text-sm">
        {formatTime()}
      </p>
    </div>
  );
}