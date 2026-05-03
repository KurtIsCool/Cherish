import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { categoryConfig } from './CategoryIcon';

export default function MemoryViewModal({ open, onClose, memory }) {
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    let url = null;
    if (memory?.photo_url) {
      if (typeof memory.photo_url === 'string') {
        setPhotoUrl(memory.photo_url);
      } else {
        url = URL.createObjectURL(memory.photo_url);
        setPhotoUrl(url);
      }
    } else {
      setPhotoUrl(null);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [memory]);

  if (!memory) return null;

  const config = categoryConfig[memory.category] || categoryConfig['emotion'];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[2rem] p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-text-main capitalize">
                    {memory.category === 'diary' ? 'Diary Entry' : config.label}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {memory.memory_date ? format(new Date(memory.memory_date), 'MMMM d, yyyy') : ''}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {memory.location && (
              <div className="flex items-center gap-2 text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{memory.location}</span>
              </div>
            )}

            {photoUrl && (
              <div className="mb-6 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src={photoUrl} alt="Memory" className="w-full h-auto max-h-[40vh] object-cover" />
              </div>
            )}

            {memory.notes && (
              <div className="bg-rose-50/50 p-5 rounded-2xl">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-serif">
                  {memory.notes}
                </p>
              </div>
            )}

            <div className="h-8"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
