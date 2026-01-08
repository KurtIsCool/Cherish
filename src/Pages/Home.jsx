import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils'; // FIXED PATH
import { differenceInDays, differenceInMonths, addYears } from 'date-fns';
import TimeTogether from '@/components/cherish/TimeTogether';
import CategoryIcon from '@/components/cherish/CategoryIcon';
import InsightCard from '@/components/cherish/InsightCard';
import MemoryCard from '@/components/cherish/MemoryCard';
import QuickLogModal from '@/components/cherish/QuickLogModal';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: partners, isLoading: loadingPartner } = useQuery({
    queryKey: ['partner'],
    queryFn: () => base44.entities.Partner.list()
  });

  const { data: memories, isLoading: loadingMemories } = useQuery({
    queryKey: ['memories'],
    queryFn: () => base44.entities.Memory.list('-memory_date', 50)
  });

  const partner = partners?.[0];

  useEffect(() => {
    if (!loadingPartner && !partner) {
      navigate(createPageUrl('Welcome'));
    }
  }, [loadingPartner, partner, navigate]);

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
    queryClient.invalidateQueries(['memories']);
  };

  const recentMemories = memories?.slice(0, 5) || [];
  const insight = getInsight();

  if (loadingPartner) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Skeleton className="h-24 w-48 mx-auto mb-8" />
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
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 to-slate-50">
      <div className="max-w-lg mx-auto px-5 pb-24">
        {/* Header */}
        <TimeTogether startDate={partner.start_date} partnerName={partner.partner_name} />

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-3 mb-8 overflow-x-auto py-2"
        >
          {categories.map((cat) => (
            <CategoryIcon
              key={cat}
              category={cat}
              size="md"
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </motion.div>

        {/* Insight Card */}
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <InsightCard 
              type={insight.type} 
              data={insight.data} 
              partnerName={partner.partner_name} 
            />
          </motion.div>
        )}

        {/* Recent Memories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-700">Recent Memories</h2>
            {memories?.length > 0 && (
              <button 
                onClick={() => navigate(createPageUrl('Calendar'))}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                View all
              </button>
            )}
          </div>

          {loadingMemories ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : recentMemories.length > 0 ? (
            <div className="space-y-3">
              {recentMemories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="mb-2">No memories yet</p>
              <p className="text-sm">Tap an icon above to log your first moment</p>
            </div>
          )}
        </motion.div>
      </div>

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