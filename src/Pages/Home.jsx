import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartner } from '@/hooks/usePartner';
import { useMemories, useCreateMemory } from '@/hooks/useMemories';
import { createPageUrl } from '@/lib/utils';
import { differenceInDays, format, addMonths, isBefore, isSameDay } from 'date-fns';
import QuickLogModal from '@/components/cherish/QuickLogModal';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { staggerContainer, slideUp } from '@/lib/animations';
import { Plus, Flower2, Bird, Flame, Heart, PenLine } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const { data: partners, isPending: loadingPartner } = usePartner();
  const { data: allMemories, isPending: loadingMemories } = useMemories();
  const createMemory = useCreateMemory();

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

  let nextMonthsarry = null;
  let daysUntilMilestone = 0;

  if (partner) {
    const start = new Date(partner.start_date);
    const now = new Date();

    // Find the next monthsarry
    let monthsToAdd = 1;
    let nextDate = addMonths(start, monthsToAdd);

    while (isBefore(nextDate, now) && !isSameDay(nextDate, now)) {
      monthsToAdd++;
      nextDate = addMonths(start, monthsToAdd);
    }

    nextMonthsarry = nextDate;
    daysUntilMilestone = differenceInDays(nextDate, now);
    if (daysUntilMilestone < 0) daysUntilMilestone = 0;
  }

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
        className="max-w-md mx-auto px-6 pt-8 flex flex-col gap-8 items-center"
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
            {/* The Horizon */}
            <div className="w-full max-w-[200px] h-1 rounded-full bg-slate-200 mt-6 overflow-hidden">
              <div className="h-full bg-rose-400" style={{ width: `${Math.min(100, Math.max(0, 100 - (daysUntilMilestone / 30) * 100))}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 uppercase tracking-wider font-medium">
              {daysUntilMilestone} {daysUntilMilestone === 1 ? 'day' : 'days'} until your Monthsarry
            </p>
          </div>
        </motion.div>

        {/* The Vault Whisper */}
        <motion.div variants={slideUp} className="w-full">
          <div className="bg-rose-50 text-rose-900 text-sm italic py-3 px-4 rounded-2xl flex items-center justify-center text-center">
            <span>"Quality time check: A quiet walk tonight could mean the world."</span>
          </div>
        </motion.div>

        {/* The Pulse */}
        <motion.div variants={slideUp} className="w-full flex flex-col items-center">
          <h3 className="font-serif text-lg font-bold text-text-main mb-4">How are you feeling right now?</h3>
          <div className="flex flex-row justify-center gap-4 w-full">
            {[
              { icon: Flower2, label: 'Butterflies', note: 'i feel butterflies because of my partner', color: 'text-sky-500' },
              { icon: Bird, label: 'Peaceful', note: 'im peaceful because partner', color: 'text-emerald-500' },
              { icon: Flame, label: 'Passionate', note: 'i feel passionate about my partner', color: 'text-orange-500' },
              { icon: Heart, label: 'Missing You', note: 'i miss my partner', color: 'text-rose-500' }
            ].map((item, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={async () => {
                  await createMemory.mutateAsync({
                    category: 'emotion',
                    memory_date: format(new Date(), 'yyyy-MM-dd'),
                    notes: item.note,
                  });
                  toast.success(`Quick log saved: ${item.label}`);
                }}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm"
                aria-label={item.label}
              >
                <item.icon className={`w-6 h-6 ${item.color}`} strokeWidth={1.5} />
              </motion.button>
            ))}
          </div>
        </motion.div>


        {/* The Spark */}
        <motion.div variants={slideUp} className="w-full">
          <div className="bg-white shadow-sm rounded-2xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setSelectedCategory('emotion')}>
            <div className="flex items-center gap-2 text-rose-primary">
              <PenLine className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Daily Spark</span>
            </div>
            <p className="font-serif text-text-main text-lg leading-snug">
              What was the exact moment you realized you loved them?
            </p>
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
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-rose-primary text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
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