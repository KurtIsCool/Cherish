import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import CategoryIcon from './CategoryIcon';

const LivingTimeline = ({ memories, loading }) => {
  if (loading) {
    return (
      <div className="pl-8 space-y-8 relative">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-slate-100 rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  if (!memories?.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No memories yet. Start the story!</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8 space-y-6">
      {/* Dashed Vertical Line */}
      <div className="absolute left-3 top-2 bottom-0 w-0.5 border-l-2 border-dashed border-slate-200" />

      {memories.map((memory, index) => (
        <motion.div
          key={memory.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Node on the line */}
          <div className="absolute -left-[29px] top-4 w-4 h-4 rounded-full bg-white border-4 border-slate-200 z-10" />

          {/* Chat Bubble Card */}
          <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1">
                <CategoryIcon category={memory.category} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                     {format(new Date(memory.memory_date), 'MMM d')}
                   </span>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {memory.description}
                </p>
                {/* Image attachment indicator or preview could go here */}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LivingTimeline;
