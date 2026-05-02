import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartner } from '@/hooks/usePartner';
import { useMemories } from '@/hooks/useMemories';
import { createPageUrl } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import QuickLogModal from '@/components/cherish/QuickLogModal';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { staggerContainer, slideUp } from '@/lib/animations';
import { Plus } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const { data: partners, isPending: loadingPartner } = usePartner();
  const { data: allMemories, isPending: loadingMemories } = useMemories();

  const memories = useMemo(() => {
    if (!allMemories) return null;
    return [...allMemories].sort((a, b) => {
        const valA = a['memory_date'] ?? '';
        const valB = b['memory_date'] ?? '';
        return valA < valB ? 1 : (valA > valB ? -1 : 0);
    });
  }, [allMemories]);

  const partner = partners?.[0];

  useEffect(() => {
    if (!loadingPartner && !partner) {
      navigate(createPageUrl('Welcome'));
    }
  }, [loadingPartner, partner, navigate]);

  const latestMemory = memories?.[0];

  useEffect(() => {
    let url = null;
    if (latestMemory?.photo_url) {
      if (typeof latestMemory.photo_url === 'string') {
        setPhotoUrl(latestMemory.photo_url);
      } else {
        url = URL.createObjectURL(latestMemory.photo_url);
        setPhotoUrl(url);
      }
    } else {
      setPhotoUrl(null);
    }
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [latestMemory]);

  const daysTogether = partner ? differenceInDays(new Date(), new Date(partner.start_date)) : 0;

  const handleCategorySave = () => {
    // Left empty as mutations now handle invalidation
  };

  if (loadingPartner || loadingMemories) {
    return (
      <div className="min-h-dvh bg-taupe-50 p-6 flex flex-col items-center pt-8">
        <Skeleton className="h-40 w-full max-w-sm rounded-3xl mb-8" />
        <Skeleton className="h-64 w-full max-w-sm rounded-3xl" />
      </div>
    );
  }

  if (!partner) return null;

  return (
    <div className="min-h-dvh bg-taupe-50 pb-20 relative">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto px-5 pt-8 flex flex-col gap-8 items-center"
      >
        {/* Hero Section: Days Together Counter */}
        <motion.div variants={slideUp} className="w-full">
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center flex flex-col items-center justify-center">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-2">
              Days Together
            </h2>
            <span className="font-serif text-6xl text-text-main">
              {daysTogether}
            </span>
            <p className="text-slate-500 mt-2 font-medium">with {partner.partner_name}</p>
          </div>
        </motion.div>

        {/* Latest Memory (The Polaroid) */}
        {latestMemory && (
          <motion.div variants={slideUp} className="w-full">
            <h3 className="font-serif text-xl font-bold text-text-main mb-4 px-2">Latest Memory</h3>
            <div className="bg-white rounded-xl shadow-md p-4 pb-6 transform rotate-2 mx-2">
              {photoUrl ? (
                <div className="w-full aspect-square bg-slate-100 mb-4 rounded overflow-hidden">
                  <img src={photoUrl} alt="Latest memory" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full aspect-square bg-taupe-50 mb-4 rounded flex items-center justify-center">
                  <span className="text-slate-400 italic">No photo attached</span>
                </div>
              )}
              <div className="px-2">
                <p className="font-serif text-lg text-text-main leading-snug line-clamp-2">
                  {latestMemory.notes || latestMemory.location || "A beautiful moment."}
                </p>
                <p className="text-xs text-slate-400 mt-2 uppercase tracking-wide">
                  {latestMemory.memory_date}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Primary Action: Log Memory FAB */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setSelectedCategory('emotion')}
        className="fixed bottom-24 right-6 z-50 bg-rose-primary text-white rounded-full shadow-lg h-14 px-6 flex items-center justify-center gap-2 font-medium"
      >
        <Plus className="w-5 h-5" />
        Log Memory
      </motion.button>

      {/* Quick Log Modal */}
      <QuickLogModal
        open={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory || 'emotion'}
        onSave={handleCategorySave}
      />
    </div>
  );
}