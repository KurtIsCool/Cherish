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
import { Plus, Sparkles, Shuffle } from 'lucide-react';

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
          <div className="flex flex-row justify-center gap-4 w-full">
            {/* Butterflies/Giddy */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePulseClick('I feel butterflies because of my partner')}
              className="flex flex-col items-center gap-2"
              aria-label="I feel butterflies"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-rose-50 transition-colors">
                <svg
                  className="w-7 h-7 text-rose-400"
                  viewBox="0 0 600 555"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M248.5 41.98c-6.1-3.3-7.3-10.7-2.7-15.8 2.8-3.1 7.1-4.1 11.7-2.6 1.6.5 3.7-.9 9.2-5.9 10.5-9.6 16.8-19.6 22.9-36.3l2.4-6.6-2.9-3.1c-7.7-8.1-8.6-17.4-2.6-28 5.7-10.3 3.6-15.7-2.3-5.9-15.6 25.7-46.5 52.6-75.2 65.5-17.6 7.9-26.5 10.1-40 10.3-13 .1-16.2-.9-22.8-6.9-5.7-5.1-7.7-10.9-7.6-21.5.1-9.9 1.8-14.8 11.2-33.6 7-14.1 8.6-19.3 10.6-36.4 1.6-14 3.9-21.3 9.6-29.8 6.4-9.5 16-15.2 29.8-17.5l7.5-1.3-5.2-3.3c-7.2-4.6-17.2-15.8-20.9-23.3-13.9-28.3-4-59.4 23.3-72.9 9.5-4.6 17.5-6.3 26.7-5.6 18.5 1.5 38 18.2 52.1 44.6l4.4 8.2 1.2-7.8c2.7-17.3 6.2-26.3 11.3-28.9 4.4-2.3 7.7-1.7 11.3 1.9 3.8 3.8 5.9 10.1 8.5 25l1.6 9.9 3.8-7.4c5.8-10.9 11.1-18.5 19-26.6 16-16.6 31.6-22.2 49.1-17.7 36.4 9.4 51.9 48.6 32.3 81.3-4 6.6-14.1 17-19.1 19.7-4.3 2.3-4.7 3.5-1.1 3.5 4.1 0 14.3 2.9 19.6 5.6 14.2 7.2 20.3 18.3 23.8 43.1 2.8 19.8 3.1 20.6 11.5 37.8 8.7 17.7 10.9 25.2 10.3 35-.7 11-5.6 18.6-14.8 22.9-6.3 2.9-22.2 2.8-33.6-.2-25.7-6.8-52.3-22.9-73.9-44.7-9-9-21.7-25-24.9-31.2-2-3.9-3.3-4.2-4.2-.9-.4 1.8.4 4.2 3.3 8.7 3.4 5.6 3.8 6.9 3.8 12.8-.1 7.3-1.7 11.2-6.4 15.7l-2.9 2.7 2.5 7.1c5.8 16.3 15.6 31 25.7 38.6 4.6 3.5 5.7 3.9 7.9 3.1 3.4-1.3 9.3.4 11.2 3.2 7.2 11.1-7.5 22.7-15.9 12.6-1.4-1.7-2.6-4.1-2.6-5.4 0-1.7-1.3-3.3-4.3-5.4-6.6-4.5-16.2-15.3-21.2-23.9-4.5-7.7-10.5-21.7-10.5-24.7 0-1.1-1.2-1.5-4.9-1.5l-4.8 0-2.3 6.3c-7 19.4-18.8 36.3-31.2 44.5-2.7 1.7-3.8 3.2-3.8 4.9 0 6.8-8.4 11.5-14.5 8.1z"/>
                </svg>
              </div>
              <span className="text-xs text-slate-500 font-medium">Giddy</span>
            </motion.button>

            {/* Peaceful */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePulseClick("I'm peaceful because of my partner")}
              className="flex flex-col items-center gap-2"
              aria-label="I feel peaceful"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-blue-50 transition-colors">
                <svg
                  className="w-7 h-7 text-blue-400"
                  viewBox="0 0 600 555"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M293.6 1.4c-8.1-8.8-16.7-20.4-21.7-29.3-2.3-4.2-4.5-7.7-4.8-7.7-.4.1-2 2-3.7 4.3-1.7 2.3-6.2 6.8-10 9.8-6.7 5.5-19.9 13.9-21.7 13.9-2.6 0-13.1-27.8-15.2-40.2-.3-2.1-.8-3.8-1.1-3.8-.2 0-2.6 1.1-5.3 2.4-9.1 4.6-29.2 9.6-38.9 9.6-3.8 0-5.2-2.2-2.9-4.8 5.1-5.9 7.8-17 8.6-36.2.4-8.5.6-15.6.5-15.8 0-.1-2.8 1.1-6 2.6-9.6 4.7-19.1 6.6-30.3 5.9-9.2-.5-20.1-3-20.1-4.5 0-.4 2.4-3 5.3-5.9 7-6.8 9.5-11.7 16.3-31.8 10.5-31.5 20.2-46.6 38.5-60.5 8.3-6.2 22.1-13.5 27.7-14.6 4.1-.8 4-.17-.3-3.3-1.9-.6-6-3.1-9.2-5.5-4.8-3.4-7.6-4.6-15.8-6.5-29.6-7-50-17.9-53.6-28.8-1.6-4.8 1-11.2 6.3-15.7 18.1-15.5 73.8-28.4 130.8-30.2l17.5-.6 7.8 7.9 7.8 8 7.7-8 7.7-8 17.5.7c47.3 1.7 94.7 10.7 119.5 22.8 8.8 4.2 17.1 12.1 18 17.1.9 4.7-2.3 11.5-7.3 15.8-8 6.6-27.5 14.6-46.7 18.9-6.9 1.6-11.1 3.2-13.5 5-5.5 4.3-11.8 8-13.5 8-2.8 0-1.5 1.8 1.8 2.4 8.7 1.6 25.9 12 36.6 22.2 12.1 11.4 21.2 26.7 27.5 46.4 8.7 26.9 10.7 31 18.6 38.4 2.7 2.6 5 5.1 5 5.6 0 1.8-10.6 4.3-20.1 4.7-10.9.6-22-1.6-31.1-6.2-2.8-1.4-5.1-2.4-5.2-2.3-.1.2.1 7.1.5 15.3.7 16.8 3.2 28.3 7.5 34.8 4.6 7 2.8 7.7-13.4 5.2-11.4-1.7-16.2-3.1-25.6-7.4-3.8-1.7-7-3.1-7.1-3.1-.2 0-.8 3-1.5 6.8-2.2 11.8-12.3 37.2-14.9 37.2-.4 0-4.7-2.4-9.4-5.4-9.6-6-20.1-14.9-23.2-19.6-1.1-1.6-2.2-3-2.5-3-.3 0-2.3 3.3-4.5 7.2-7.2 12.7-25.4 35.8-28.3 35.8-.6 0-3.5-2.7-6.6-6z"/>
                </svg>
              </div>
              <span className="text-xs text-slate-500 font-medium">Peaceful</span>
            </motion.button>

            {/* Passionate */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePulseClick('I feel passionate about my partner')}
              className="flex flex-col items-center gap-2"
              aria-label="I feel passionate"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-orange-50 transition-colors">
                <svg
                  className="w-7 h-7 text-orange-500"
                  viewBox="0 0 600 555"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M291.7-2.2c-9.9-9.7-15.2-19.3-16.7-29.8-1-7.3.1-18 2.6-23.8 5.7-13.6 5.1-24.3-1.8-31.8-2.2-2.4-4.3-4.4-4.7-4.4-.3 0-.6 4.2-.6 9.3 0 7.8-.4 10.1-2.7 14.9-3.5 7.5-9.5 13.8-16.8 17.7-7.2 3.9-8.2 2.9-4.5-4.3 4.8-9.4 3-18.3-6.3-33-2.5-3.9-5.3-9-6.4-11.5-6.9-16.1-2.8-35.6 10.2-48.1l6-5.8-4.2 1c-5 1.1-15.9.3-22.6-1.8-2.6-.7-4.8-1.4-4.9-1.4 0 0 .1 1.8.4 3.9 1.2 8.7-1.8 13.7-13.6 23-4.9 3.9-7.1 8.3-7.4 14.9-.2 5.4-1.8 6.3-4.4 2.5-4.6-6.6-5.5-15.2-2.4-24 1.8-5.2 1.8-5.3-.1-5.3-2.8 0-7.6 3.7-9.4 7.3-.9 1.7-2.7 6.2-4 10-3.2 9.4-6.6 14.9-11.7 19-7.1 5.8-19 10.8-21 8.8-.5-.5.5-2.8 2.3-5.2 1.7-2.4 3.8-5.9 4.6-7.8 2-4.7 1.7-14.5-.6-21.9-2.2-7.1-2.6-17.1-.8-22.3.6-1.9 4.1-8 7.6-13.7 7.3-11.6 8.9-17.9 5.8-22.7-3.7-5.6-8.8-1.4-10.6 8.5-1.4 8.1-4.9 14.3-10 17.6-4.5 3-12.7 5.7-13.5 4.4-.3-.5 1-2.9 2.9-5.4 4.7-6.1 5.7-11.8 4.5-24.1-.5-5.5-.7-12.9-.3-16.5 2.1-21.2 15.9-43.6 37.6-61 5.5-4.5 11.7-9.2 13.8-10.5 2.2-1.4 5.7-5.1 7.9-8.4 14.9-21.9 43.5-48.3 75.6-69.8 11.6-7.7 27.4-17.3 28.5-17.3 1.3 0 20.2 11.4 29.5 17.8 32.6 22.5 54.9 42.9 72.3 66 5.1 6.9 9 10.9 13.4 13.9 23.2 15.8 38.6 34.8 45.9 56.8 2.1 6.4 2.3 8.5 2.1 25-.2 19.6.3 22.9 5 28.8 3.6 4.6 3 5.9-2 4.5-10.6-2.8-16.4-9.3-18.8-20.9-.8-4-2.2-8.2-3.1-9.1-4.4-4.9-9.3-2.3-9.3 4.9 0 4.8 2.9 11.2 9.2 20.6 2.2 3.2 4.6 7.3 5.4 9.2 2 4.9 1.7 15.8-.6 24-3.6 12.5-2.3 21.1 4.6 30.1 3.4 4.4 2.3 5.8-3.1 4.3-14-3.9-23.3-12.9-27.6-26.9-3.5-11.2-8.6-18-13.8-18-1.9 0-1.9.1 0 5 3.4 9.1 1.7 21.6-3.7 26.1-2 1.7-2.5.9-2.9-4.9-.6-8.1-2.5-10.7-14-19.6-2-1.6-4.6-4.7-5.6-7-2.1-4.7-2.5-11.6-.7-13.4 1.6-1.6.3-1.5-5.7.4-3.1 1-9 1.7-15.6 1.7l-10.5.1 5.8 5.4c7.1 6.6 11.6 15.4 13 25.5 1.5 11.1-.1 17.9-8 33.6l-6.7 13.3v9.2c0 7.5.4 9.9 2.3 13.5 2.9 5.9 1.6 7.1-4 3.8-10.7-6.3-14.8-14.1-15.8-29.8-.6-11.1-2.3-15.4-7.2-18-2-1.1-2.1-.9-1.4 2.2 2.3 11.6 1.1 22.1-3.8 31.7-1.3 2.6-6.3 9.2-11.1 14.6-10.7 12.1-13.7 18.2-14.2 28.6-.3 5.9.1 9.1 2 15.2 3.7 11.8 1.9 11.9-9.6.6z"/>
                </svg>
              </div>
              <span className="text-xs text-slate-500 font-medium">Passionate</span>
            </motion.button>

            {/* Missing you */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePulseClick('I miss my partner')}
              className="flex flex-col items-center gap-2"
              aria-label="I miss you"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-pink-50 transition-colors">
                <svg
                  className="w-7 h-7 text-pink-500"
                  viewBox="0 0 600 555"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M284 8.66c-20.6-4.1-39.5-15.7-50.4-31.1-13.1-18.5-18.3-41.5-13.9-62.7 1.5-7.5 1.5-8.5 0-13.6-.9-3-4.6-10.4-8.2-16.5-7.5-12.7-8.1-16-3.7-19.7 1.6-1.3 5-3.2 7.7-4.2l4.7-1.9-.6-6.1c-.5-4.7-.3-6.7.9-8.1.9-1.3 1.2-3.1.9-5.3-.5-2.5 0-4.2 2-7.2 2.1-3.3 2.6-5.1 2.6-10.5 0-7.9 2.3-13.1 7.2-16 4.6-2.8 15.6-2.6 26.5.4 9.4 2.6 11.1 2.2 13.9-3.6 2.7-5.7 2.4-20.8-.6-28.8-2-5.3-4-7.7-17-20.5-23.1-22.6-32.4-39.6-40-73 3.9-17.5-4.5-22.9-2.5-23.6.9-.4 1.7-.5 1.9-.3.2.2 1.3 5.8 2.5 12.4 3.7 21.3 10.3 40.3 19.2 55.5 5.4 9.1 8.2 12.5 21.8 26 14.4 14.2 15.9 16 18 21.9 4.5 12.5 3.8 28.8-1.6 35.2-2.3 2.7-2.3 2.9-.6 3.5 6.5 2.2 21.1 10.3 25.3 14.1 5.8 5.2 11.4 12.8 10.5 14.3-1.2 1.9-3.4 1-5.5-2.5-4.7-7.6-17.7-16.8-30.1-21.4-11.1-4.1-24.6-7.4-30.5-7.5-10.7-.2-14.4 3.6-14.4 14.6 0 4.8-.6 7.4-2.5 11.1-2.9 5.4-2.2 8.7 1.9 8.7 3.8 0 11.5-2.7 15.7-5.4 4.6-3.1 5.9-3.2 5.9-.7 0 4.2-13.8 10.3-22.3 9.9-4.9-.3-5.7.8-4.8 6.5 1 6.3-.3 8.7-6.5 11.7-6.1 2.9-8.4 4.8-8.4 6.5 0 .8 2.7 6 6 11.7 10.1 17.3 11.4 22.5 8.5 34.3-1.8 7.7-1.9 16.4-.1 25.7 5.7 29.6 23 49.8 50.8 59.1 8.9 3 9.9 3.1 26.3 3.2 14.8 0 18-.3 25-2.3 21.5-6.2 38.2-20.1 47.5-39.7 5.3-11.2 7-18.2 7.7-31.6 1-20.6-2.8-33.2-17-57.1-4.9-8.1-10-18-11.5-22-2.5-6.8-2.7-8.3-2.7-23.3.1-15.2.2-16.5 3.2-25.3 5.3-15.7 9.4-21.5 30.3-42.2 19.5-19.3 23.9-24.9 31-39 8.3-16.4 12.7-31.7 15.6-53.2 1.5-11.2 1.9-12.8 3.6-12.8 2.2 0 2.3 1.9.3 15.5-3.2 22.3-7.7 37.4-16.2 53.5-7.8 15-11.3 19.3-32.3 40-18 17.8-18.9 18.9-23.3 28-6.8 13.9-8.2 19.9-8.2 36.5.1 17.3 1.2 20.9 12.4 39.8 10.2 17.1 12.3 21.5 15.4 31.4 4.7 14.7 5.1 33 1.2 48.6-.9 3.4-3.9 10.9-6.7 16.7-4.4 9.1-6.2 11.5-14.2 19.6-7.6 7.5-10.8 10-18.3 13.8-14.7 7.3-21.1 8.8-40.3 9.1-9.1.2-17.6.1-19-.1z"/>
                </svg>
              </div>
              <span className="text-xs text-slate-500 font-medium">Missing</span>
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
                "Write something for you partner."
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
