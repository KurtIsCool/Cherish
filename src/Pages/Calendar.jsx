import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import MemoryCard from '@/components/cherish/MemoryCard';
import CategoryIcon, { categoryConfig } from '@/components/cherish/CategoryIcon'; // Using the source of truth
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import QuickLogModal from '@/components/cherish/QuickLogModal';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const queryClient = useQueryClient();

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

  const handleCategorySave = () => {
    queryClient.invalidateQueries(['memories']);
  };

  const categories = ['dining', 'gift', 'date', 'media', 'emotion', 'conflict'];

  return (
    <div className="min-h-dvh bg-gradient-to-b from-rose-50/30 to-slate-50">
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

        <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 shadow-xl shadow-rose-100/50 mb-8 border border-white">
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
              caption: "relative flex items-center justify-center pt-1 pb-6 mb-2",
              caption_label: "text-lg font-bold text-slate-700",
              nav: "absolute inset-0 flex items-center justify-between",
              nav_button: "h-8 w-8 bg-transparent hover:bg-slate-50 p-0 opacity-50 hover:opacity-100 transition-opacity rounded-full flex items-center justify-center",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex w-full mb-4",
              head_cell: "text-slate-400 w-full font-bold text-[10px] uppercase tracking-wider",
              row: "flex w-full mt-2",
              cell: "w-full text-center text-sm relative p-0",
              day: "h-10 w-10 mx-auto rounded-full font-medium hover:bg-rose-50 transition-all text-slate-600 data-[selected=true]:bg-primary data-[selected=true]:text-white data-[selected=true]:shadow-lg data-[selected=true]:shadow-primary/30 data-[selected=true]:scale-110 active:scale-95",
              day_today: "bg-slate-100 text-slate-900 font-bold",
              day_outside: "text-slate-300 opacity-50",
            }}
            components={{
              DayButton: ({ day, ...props }) => {
                const date = day.date;
                const dateKey = format(date, 'yyyy-MM-dd');
                const dayMemories = memoriesByDate[dateKey] || [];
                const categories = [...new Set(dayMemories.map(m => m.category))];
                const isSelected = isSameDay(date, selectedDate);
                
                return (
                  <CalendarDayButton day={day} {...props} className={cn(props.className, "relative overflow-visible")}>
                    <span className="z-10 relative">{date.getDate()}</span>
                    {categories.length > 0 && !isSelected && (
                      <div className="absolute -bottom-1 flex gap-0.5">
                        {categories.slice(0, 3).map((cat, i) => (
                          <div 
                            key={i} 
                            className={`w-1 h-1 rounded-full ${categoryConfig[cat]?.dotColor || 'bg-slate-300'}`}
                          />
                        ))}
                      </div>
                    )}
                    {isSelected && (
                        <motion.div
                            layoutId="selectedDay"
                            className="absolute inset-0 bg-primary rounded-full -z-0"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                  </CalendarDayButton>
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
                  className="text-center py-8"
                >
                  <p className="text-slate-400 mb-6">No memories on this day</p>

                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-600 mb-4">Add a memory for this day</h3>
                    <div className="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map((cat) => (
                        <CategoryIcon
                            key={cat}
                            category={cat}
                            size="md"
                            onClick={() => setSelectedCategory(cat)}
                        />
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

       {/* Quick Log Modal */}
       <QuickLogModal
        open={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        onSave={handleCategorySave}
        defaultDate={selectedDate}
      />
    </div>
  );
}