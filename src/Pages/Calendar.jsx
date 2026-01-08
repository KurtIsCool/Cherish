import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import MemoryCard from '@/components/cherish/MemoryCard';
import { categoryConfig } from '@/components/cherish/CategoryIcon'; // Using the source of truth
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: memories, isLoading } = useQuery({
    queryKey: ['memories'],
    queryFn: () => base44.entities.Memory.list('-memory_date')
  });

  const lastEntries = useMemo(() => {
    if (!memories) return {};
    const entries = {};
    Object.keys(categoryConfig).forEach(cat => {
      const last = memories.find(m => m.category === cat);
      if (last) entries[cat] = last.memory_date;
    });
    return entries;
  }, [memories]);

  const memoriesByDate = useMemo(() => {
    if (!memories) return {};
    const grouped = {};
    memories.forEach(m => {
      const dateKey = m.memory_date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(m);
    });
    return grouped;
  }, [memories]);

  const selectedMemories = useMemo(() => {
    if (!memories) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return memories.filter(m => m.memory_date === dateKey);
  }, [memories, selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 to-slate-50">
      <div className="max-w-lg mx-auto px-5 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-light text-slate-700 mb-4">Memory Calendar</h1>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(lastEntries).map(([cat, date]) => {
              const config = categoryConfig[cat];
              return (
                <div key={cat} className="bg-white rounded-full px-3 py-1.5 text-slate-500 shadow-sm border border-slate-100">
                  <span className="capitalize font-medium">{config?.label}</span>
                  <span className="text-slate-400 ml-1">{format(parseISO(date), 'MMM d')}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm mb-6 border border-slate-100">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full"
            classNames={{
              months: "w-full",
              month: "w-full",
              table: "w-full border-collapse",
              head_row: "flex w-full",
              head_cell: "text-slate-400 w-full font-normal text-xs",
              row: "flex w-full mt-1",
              cell: "w-full text-center text-sm relative p-0",
              day: "h-10 w-full rounded-xl font-normal hover:bg-slate-100 transition-colors",
              day_selected: "bg-slate-800 text-white hover:bg-slate-700",
              day_today: "bg-rose-50 text-rose-600",
              day_outside: "text-slate-300",
            }}
            components={{
              DayContent: ({ date }) => {
                const dateKey = format(date, 'yyyy-MM-dd');
                const dayMemories = memoriesByDate[dateKey] || [];
                const categories = [...new Set(dayMemories.map(m => m.category))];
                
                return (
                  <div className="relative flex flex-col items-center">
                    <span>{date.getDate()}</span>
                    {categories.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {categories.slice(0, 3).map((cat, i) => (
                          <div 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full ${categoryConfig[cat]?.dotColor || 'bg-slate-300'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
            }}
          />
        </div>

        <div>
          <h2 className="text-sm font-medium text-slate-500 mb-4">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {selectedMemories.length > 0 ? (
                <motion.div
                  key={selectedDate.toISOString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {selectedMemories.map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-slate-400"
                >
                  <p>No memories on this day</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}