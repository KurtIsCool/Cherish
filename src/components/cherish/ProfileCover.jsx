import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // FIXED PATH

const ProfileCover = ({ partnerName, startDate, daysTogether }) => {
  return (
    <div className="relative mb-8 rounded-3xl overflow-hidden bg-white shadow-xl shadow-slate-200/50">
      {/* Cover Image Placeholder */}
      <div className="h-48 w-full bg-gradient-to-tr from-rose-200 via-orange-100 to-rose-100 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=3387&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-white via-white/80 to-transparent">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-sm text-slate-500 font-semibold mb-1 uppercase tracking-wider">Cherishing</h2>
            <h1 className="text-3xl font-bold text-slate-800">{partnerName}</h1>
          </div>

          {/* Glass Badge */}
          <div className="flex flex-col items-end">
             <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-lg rounded-2xl px-4 py-2 flex flex-col items-center">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-0.5">Together</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{daysTogether}</span>
                  <span className="text-xs font-bold text-slate-500">days</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCover;
