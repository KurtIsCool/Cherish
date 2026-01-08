import React from 'react';
import { Sparkles, Calendar, Gift, Heart } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function InsightCard({ type, data, partnerName }) {
  const cards = {
    date_suggestion: {
      icon: Calendar,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      title: 'Time for an adventure?',
      message: `It's been a little while since a night out with ${partnerName}. Maybe this weekend?`
    },
    gift_suggestion: {
      icon: Gift,
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-400',
      title: 'A small surprise?',
      message: `Thinking of something nice for ${partnerName}? It's been a bit since your last gift.`
    },
    milestone: {
      icon: Sparkles,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
      title: 'Special day approaching',
      message: data?.message || `${partnerName}'s special day is almost here.`
    },
    emotional_check: {
      icon: Heart,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-400',
      title: 'Quality time',
      message: `When did you last share a meaningful moment with ${partnerName}?`
    }
  };

  const card = cards[type];
  if (!card) return null;

  const Icon = card.icon;

  return (
    <div className={`${card.bgColor} rounded-3xl p-6 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${card.iconColor}`} strokeWidth={1.5} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-slate-700 mb-1">{card.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{card.message}</p>
        </div>
      </div>
    </div>
  );
}