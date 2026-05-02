import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartner } from '@/hooks/usePartner';
import { useMemories } from '@/hooks/useMemories';
import { createPageUrl } from '@/lib/utils'; // FIXED PATH
import { differenceInDays, differenceInMonths, addYears } from 'date-fns';
import TimeTogether from '@/components/cherish/TimeTogether';
import CategoryIcon from '@/components/cherish/CategoryIcon';
import InsightCard from '@/components/cherish/InsightCard';
import LivingTimeline from '@/components/cherish/LivingTimeline';
import ProfileCover from '@/components/cherish/ProfileCover';
import SparkWidget from '@/components/cherish/SparkWidget';
import QuickLogModal from '@/components/cherish/QuickLogModal';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, staggerContainer, tapScale } from '@/lib/animations';

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: partners, isPending: loadingPartner } = usePartner();

  const { data: allMemories, isPending: loadingMemories } = useMemories();

  const memories = useMemo(() => {
    if (!allMemories) return null;
    return [...allMemories].sort((a, b) => {
        const valA = a['memory_date'] ?? '';
        const valB = b['memory_date'] ?? '';
        return valA < valB ? 1 : (valA > valB ? -1 : 0);
    }).slice(0, 50);
  }, [allMemories]);

  const partner = partners?.[0];

  useEffect(() => {
    if (!loadingPartner && !partner) {
      navigate(createPageUrl('Welcome'));
    }
  }, [loadingPartner, partner, navigate]);

  const daysTogether = partner ? differenceInDays(new Date(), new Date(partner.start_date)) : 0;

  const getInsight = () => {
    if (!memories?.length || !partner) return null;

    const now = new Date();
    const startDate = new Date(partner.start_date);
    
    // Check for upcoming anniversary
    const nextAnniversary = addYears(startDate, differenceInDays(now, startDate) / 365 + 1);
    const daysUntilAnniversary = differenceInDays(nextAnniversary, now);
    if (daysUntilAnniversary > 0 && daysUntilAnniversary <= 7) {
      return {
        type: 'milestone',
        data: { message: `Your anniversary is in ${daysUntilAnniversary} day${daysUntilAnniversary > 1 ? 's' : ''}. Something special planned?` }
      };
    }

    // Check last date
    const lastDate = memories.find(m => m.category === 'date');
    if (!lastDate || differenceInDays(now, new Date(lastDate.memory_date)) > 14) {
      return { type: 'date_suggestion' };
    }

    // Check last gift
    const lastGift = memories.find(m => m.category === 'gift');
    if (!lastGift || differenceInMonths(now, new Date(lastGift.memory_date)) >= 3) {
      return { type: 'gift_suggestion' };
    }

    // Check emotional moments
    const lastEmotion = memories.find(m => m.category === 'emotion');
    if (!lastEmotion || differenceInDays(now, new Date(lastEmotion.memory_date)) > 30) {
      return { type: 'emotional_check' };
    }

    return null;
  };

  const handleCategorySave = () => {
    // Left empty as mutations now handle invalidation
  };

  const recentMemories = memories?.slice(0, 5) || [];
  const insight = getInsight();

  if (loadingPartner) {
    return (
      <div className="min-h-dvh bg-vault-cream p-6">
        <Skeleton className="h-64 w-full rounded-3xl mb-8" />
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="w-14 h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!partner) return null;

  const categories = ['dining', 'gift', 'date', 'media', 'emotion', 'conflict'];

  return (
    <div className="min-h-dvh bg-slate-50">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto px-5 pb-32 pt-6"
      >
        {/* Profile Cover Card */}
        <motion.div variants={slideUp}>
          <ProfileCover
            partnerName={partner.partner_name}
            startDate={partner.start_date}
            daysTogether={daysTogether}
          />
        </motion.div>

        {/* Daily Spark Widget */}
        <motion.div variants={slideUp}>
          <SparkWidget />
        </motion.div>

        {/* Quick Actions (Floating Bubbles) */}
        <motion.div variants={slideUp} className="mb-8">
          <h3 className="font-serif text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Log a memory</h3>
          <div className="flex justify-between gap-2 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat, idx) => (
              <motion.div key={cat} variants={fadeIn} whileTap={tapScale}>
                <CategoryIcon
                  category={cat}
                  size="md"
                  onClick={() => setSelectedCategory(cat)}
                  className="min-w-[44px] min-h-[44px] active:scale-95 transition-transform bg-gradient-to-br from-white to-vault-sand shadow-sm border border-vault-sand/50"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Insight Card */}
        {insight && (
          <motion.div
            variants={slideUp}
            className="mb-10"
          >
            <InsightCard 
              type={insight.type} 
              data={insight.data} 
              partnerName={partner.partner_name} 
            />
          </motion.div>
        )}

        {/* Living Timeline */}
        <motion.div
          variants={slideUp}
        >
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="font-serif text-2xl font-bold text-vault-taupe">Latest Moments</h2>
            {memories?.length > 0 && (
              <motion.button
                whileTap={tapScale}
                onClick={() => navigate(createPageUrl('Calendar'))}
                className="text-sm font-semibold text-vault-rose active:bg-vault-sand transition-colors bg-white shadow-sm border border-vault-sand/50 px-4 py-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center bg-gradient-to-r from-white to-vault-sand/30"
              >
                View Calendar
              </motion.button>
            )}
          </div>

          <LivingTimeline memories={recentMemories} loading={loadingMemories} />
        </motion.div>
      </motion.div>

      {/* Quick Log Modal */}
      <QuickLogModal
        open={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        onSave={handleCategorySave}
      />
    </div>
  );
}