import React, { useState, useMemo } from 'react';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { useMemories } from '@/hooks/useMemories';
import { format, isSameDay, parseISO } from 'date-fns';
import MemoryCard from '@/components/cherish/MemoryCard';
import CategoryIcon, { categoryConfig } from '@/components/cherish/CategoryIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import QuickLogModal from '@/components/cherish/QuickLogModal';
import MemoryViewModal from '@/components/cherish/MemoryViewModal';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewingMemory, setViewingMemory] = useState(null);

  const { data: allMemories, isPending: isLoading } = useMemories();

  const memories = useMemo(() => {
    if (!allMemories) return null;
    return [...allMemories].sort((a, b) => {
        const valA = a['memory_date'] ?? '';
        const valB = b['memory_date'] ?? '';
        return valA < valB ? 1 : (valA > valB ? -1 : 0);
    });
  }, [allMemories]);

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
    // Left empty as mutations now handle invalidation
  };

  const categories = ['dining', 'gift', 'date', 'media', 'emotion', 'conflict'];

  return (
    <div className="min-h-dvh bg-taupe-50 flex flex-col items-center pt-8 pb-24">
      <div className="w-full max-w-lg mx-auto px-5">
        <div className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-text-main mb-4">Memory Calendar</h1>
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

        <div className="w-full max-w-sm mx-auto bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center mb-8">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full flex flex-col items-center justify-center"
              classNames={{
                months: "w-full flex flex-col items-center justify-center",
                month: "w-full flex flex-col items-center justify-center",
                caption: "relative flex items-center justify-center pt-1 pb-6 mb-2 w-full",
                caption_label: "text-lg font-serif font-bold text-text-main",
                nav: "absolute inset-0 flex items-center justify-between pointer-events-none",
                nav_button: "h-11 w-11 bg-transparent p-0 opacity-50 transition-opacity rounded-full flex items-center justify-center pointer-events-auto",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full max-w-[320px] mx-auto border-collapse",
                head_row: "flex w-full mb-4 justify-between",
                head_cell: "text-slate-400 w-full font-bold text-[10px] uppercase tracking-wider text-center flex-1",
                row: "flex w-full mt-2 justify-between",
                cell: "text-center text-sm relative p-0 bg-transparent flex-1",
                day: "w-10 h-10 flex items-center justify-center rounded-full m-auto font-medium transition-all text-slate-600 bg-transparent",
                day_selected: "bg-rose-100 text-rose-900 ring-2 ring-rose-400 ring-offset-2 ring-offset-white rounded-full font-bold",
                day_today: "text-rose-500 font-bold bg-transparent",
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
                  </CalendarDayButton>
                );
              }
            }}
            />
        </div>

        <div className="w-full">
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
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {selectedMemories.length > 0 ? (
                  <div className="space-y-3">
                    {selectedMemories.map((memory) => (
                      <MemoryCard
                        key={memory.id}
                        memory={{...memory, onClick: setViewingMemory}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No memories on this day</p>
                  </div>
                )}

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-4">
                  <h3 className="text-sm font-medium text-slate-600 mb-4 text-center">Add a memory for this day</h3>
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

      <MemoryViewModal
        open={!!viewingMemory}
        onClose={() => setViewingMemory(null)}
        memory={viewingMemory}
      />
    </div>
  );
}