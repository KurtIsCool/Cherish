import React, { useState } from 'react';
import { Sparkles, Shuffle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROMPTS = [
  "What made you smile today?",
  "Log a meal you shared recently.",
  "Write a haiku about your partner.",
  "Upload a photo from your last date.",
  "What is one thing you appreciate about them?",
  "Record a small act of kindness they did.",
  "What song reminds you of them right now?",
  "Plan your next weekend getaway."
];

export default function SparkWidget() {
  const [isVisible, setIsVisible] = useState(true);
  const [promptIndex, setPromptIndex] = useState(0);

  const handleShuffle = () => {
    setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-gradient-to-r from-primary/10 to-orange-100 rounded-2xl p-4 mb-8 border border-primary/10 shadow-sm"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Sparkles className="w-4 h-4 fill-primary" />
            <span>Daily Spark</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShuffle}
              className="p-1 hover:bg-white/50 rounded-full transition-colors"
            >
              <Shuffle className="w-4 h-4 text-primary/70" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-primary/70" />
            </button>
          </div>
        </div>

        <p className="text-slate-700 font-medium pr-8">
          {PROMPTS[promptIndex]}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
