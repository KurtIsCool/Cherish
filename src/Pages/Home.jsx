import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartner } from '@/hooks/usePartner';
import { useMemories } from '@/hooks/useMemories';
import { createPageUrl } from '@/lib/utils';
import { differenceInDays, differenceInMonths } from 'date-fns';
import QuickLogModal from '@/components/cherish/QuickLogModal';
import DiaryModal from '@/components/cherish/DiaryModal';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { staggerContainer, slideUp } from '@/lib/animations';
import { Plus, Sparkles, Flame, Heart, Bird, Shuffle } from 'lucide-react';

const LOVE_LANGUAGE_PROMPTS = [
  // Words of Affirmation
  "Leave a handwritten note in their bag today.",
  "Text them something specific you appreciate about them.",
  "Say 'I'm proud of you' after a long day.",
  "Compliment something they don't usually notice about themselves.",
  // Acts of Service
  "Do something helpful for them without being asked.",
  "Clean their space or organize their things.",
  "Cook or buy their favorite meal when they're tired.",
  "Help them with school/work tasks.",
  // Receiving Gifts
  "Give a small, meaningful surprise.",
  "Buy their favorite snack on your way to see them.",
  "Pick up something that reminded you of them.",
  "Give a simple handmade item (like a drawing or playlist).",
  // Quality Time
  "Be fully present with them.",
  "Plan a simple date (walk, movie, or coffee).",
  "Put your phone away and just talk.",
  "Do something they enjoy, even if it's not your favorite.",
  // Physical Touch
  "Show affection through contact.",
  "Hold their hand while walking.",
  "Give random hugs during the day.",
  "Sit close or lean on them when you're together."
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [initialNotes, setInitialNotes] = useState('');
  const [dailyPrompt, setDailyPrompt] = useState('');
  const [diaryOpen, setDiaryOpen] = useState(false);

  const { data: partners, isPending: loadingPartner } = usePartner();
  const { data: allMemories, isPending: loadingMemories } = useMemories();

  const regularMemories = useMemo(() => {
    if (!allMemories) return null;
    return allMemories
      .filter((m) => m.category !== 'diary')
      .sort((a, b) => {
        const valA = a['memory_date'] ?? '';
        const valB = b['memory_date'] ?? '';
        return valA < valB ? 1 : (valA > valB ? -1 : 0);
      });
  }, [allMemories]);

  const diaryMemories = useMemo(() => {
    if (!allMemories) return null;
    return allMemories
      .filter((m) => m.category === 'diary')
      .sort((a, b) => {
        const valA = a['memory_date'] ?? '';
        const valB = b['memory_date'] ?? '';
        return valA < valB ? 1 : (valA > valB ? -1 : 0);
      });
  }, [allMemories]);

  const partner = partners?.[0];

  // Set random daily prompt on mount or refresh
  useEffect(() => {
    const randomPrompt = LOVE_LANGUAGE_PROMPTS[Math.floor(Math.random() * LOVE_LANGUAGE_PROMPTS.length)];
    setDailyPrompt(randomPrompt);
  }, []);

  const handleShufflePrompt = () => {
    let newPrompt;
    do {
      newPrompt = LOVE_LANGUAGE_PROMPTS[Math.floor(Math.random() * LOVE_LANGUAGE_PROMPTS.length)];
    } while (newPrompt === dailyPrompt && LOVE_LANGUAGE_PROMPTS.length > 1);
    setDailyPrompt(newPrompt);
  };

  useEffect(() => {
    if (!loadingPartner && !partner) {
      navigate(createPageUrl('Welcome'));
    }
  }, [loadingPartner, partner, navigate]);

  const latestMemory = regularMemories?.[0];
  const latestDiary = diaryMemories?.[0];

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
  const monthsTogether = partner ? differenceInMonths(new Date(), new Date(partner.start_date)) : 0;

  // Calculate next monthsary
  const nextMonthsary = monthsTogether + 1;
  const partnerStartDate = partner ? new Date(partner.start_date) : new Date();
  const nextMonthsaryDate = new Date(partnerStartDate);
  nextMonthsaryDate.setMonth(nextMonthsaryDate.getMonth() + nextMonthsary);
  const daysUntilMonthsary = differenceInDays(nextMonthsaryDate, new Date());

  const handleCategorySave = () => {
    // Left empty as mutations now handle invalidation
  };

  const handlePulseClick = (note) => {
    setInitialNotes(note);
    setDiaryOpen(true);
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
    <div className="min-h-dvh bg-taupe-50 pb-24 relative">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto px-6 pt-8 flex flex-col gap-6 items-center"
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

            {/* Custom Milestone: Monthsary Countdown */}
            <div className="w-full max-w-[220px] mt-8">
              <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">
                {nextMonthsary} Month Milestone
              </p>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-rose-400 transition-all duration-500"
                  style={{
                    width: `${Math.max(5, ((30 - daysUntilMonthsary) / 30) * 100)}%`
                  }}
                />
              </div>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                {daysUntilMonthsary} {daysUntilMonthsary === 1 ? 'day' : 'days'} to go
              </p>
            </div>
          </div>
        </motion.div>

        {/* The Hyper-Personalized Whisper */}
        <motion.div variants={slideUp} className="w-full">
          <div className="bg-rose-50 text-rose-900 text-sm italic pl-4 pr-1 py-1 rounded-2xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{dailyPrompt}</span>
            </div>
            <button
              onClick={handleShufflePrompt}
              className="w-11 h-11 flex items-center justify-center flex-shrink-0 text-rose-400 active:scale-95 transition-all hover:bg-rose-100 rounded-full"
              aria-label="Shuffle prompt"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* The Pulse */}
        <motion.div variants={slideUp} className="w-full flex flex-col items-center">
          <h3 className="font-serif text-lg font-semibold text-text-main mb-4">
            How are you feeling right now?
          </h3>
          <div className="flex flex-row justify-center gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePulseClick('I feel butterflies because of my partner')}
              className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-sm text-rose-400 hover:bg-rose-50 transition-colors"
              aria-label="I feel butterflies"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                <path d="M15 13h.01" />
                <path d="M9 13h.01" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePulseClick("I'm peaceful because of my partner")}
              className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-sm text-blue-400 hover:bg-blue-50 transition-colors"
              aria-label="I feel peaceful"
            >
              <Bird className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePulseClick('I feel passionate about my partner')}
              className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-sm text-orange-500 hover:bg-orange-50 transition-colors"
              aria-label="I feel passionate"
            >
              <Flame className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePulseClick('I miss my partner')}
              className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-sm text-pink-500 hover:bg-pink-50 transition-colors"
              aria-label="I miss you"
            >
              <Heart className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* The Spark Prompt */}
        <motion.div variants={slideUp} className="w-full">
          <button
            onClick={() => handlePulseClick('')}
            className="w-full bg-white shadow-sm rounded-2xl p-5 flex items-start gap-3 hover:shadow-md transition-shadow text-left"
          >
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-rose-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-serif text-base font-medium text-text-main mb-1">
                Daily Spark
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                "Write something for your partner."
              </p>
            </div>
          </button>
        </motion.div>

        {/* Latest Memory (The Polaroid) */}
        {latestMemory && (
          <motion.div variants={slideUp} className="w-full">
            <h3 className="font-serif text-xl font-bold text-text-main mb-4">Latest Memory</h3>
            <div className="bg-white rounded-xl shadow-md p-4 pb-6 transform rotate-1">
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

        {/* Latest Diary */}
        {latestDiary && (
          <motion.div variants={slideUp} className="w-full mt-4">
            <h3 className="font-serif text-xl font-bold text-text-main mb-4">Latest Diary</h3>
            <div className="bg-white rounded-xl shadow-md p-4 pb-6 transform -rotate-1">
              <div className="px-2">
                <p className="font-serif text-lg text-text-main leading-snug line-clamp-3">
                  {latestDiary.notes || "A thoughtful entry."}
                </p>
                <p className="text-xs text-slate-400 mt-4 uppercase tracking-wide">
                  {latestDiary.memory_date}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Floating Action Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSelectedCategory('emotion')}
        className="fixed bottom-24 right-6 z-50 bg-rose-primary text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center"
        aria-label="Log Memory"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Quick Log Modal */}
      <QuickLogModal
        open={!!selectedCategory}
        onClose={() => {
          setSelectedCategory(null);
          setInitialNotes('');
        }}
        category={selectedCategory || 'emotion'}
        onSave={handleCategorySave}
        initialNotes={initialNotes}
      />

      <DiaryModal
        open={diaryOpen}
        onClose={() => {
          setDiaryOpen(false);
          setInitialNotes('');
        }}
        onSave={handleCategorySave}
        initialText={initialNotes}
      />
    </div>
  );
}
