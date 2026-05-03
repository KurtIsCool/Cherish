import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, Loader2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { useCreateMemory } from '@/hooks/useMemories';
import { categoryConfig } from './CategoryIcon';

export default function DiaryModal({ open, onClose, initialText, onSave, defaultDate }) {
  const [date, setDate] = useState(defaultDate || new Date());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const createMemory = useCreateMemory();
  const config = categoryConfig['diary'];

  useEffect(() => {
    if (open) {
      setDate(defaultDate || new Date());
      setNotes(initialText || '');
    }
  }, [open, defaultDate, initialText]);

  const handleSave = async () => {
    if (!notes.trim()) return;

    setSaving(true);
    await createMemory.mutateAsync({
      category: 'diary',
      memory_date: format(date, 'yyyy-MM-dd'),
      location: null,
      notes: notes.trim(),
      photo_url: null
    });
    setSaving(false);
    onSave();
    resetAndClose();
  };

  const resetAndClose = () => {
    setDate(new Date());
    setNotes('');
    onClose();
  };

  if (!config) return null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && resetAndClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-center font-light text-xl tracking-wide flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Dear Diary...
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-slate-500 text-sm font-normal">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-12 rounded-xl border-slate-200"
                >
                  <CalendarDays className="mr-3 h-4 w-4 text-slate-400" />
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Diary Entry Notes */}
          <div className="space-y-2">
            <Label className="text-slate-500 text-sm font-normal">Entry</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your thoughts..."
              className="min-h-[200px] rounded-2xl p-4 border-slate-200 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-primary/50 text-base leading-relaxed bg-white"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving || !notes.trim()}
            className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-base shadow-sm transition-all active:scale-[0.98]"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Entry'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}