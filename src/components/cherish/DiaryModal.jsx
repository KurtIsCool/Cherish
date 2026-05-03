import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useCreateMemory } from '@/hooks/useMemories';
import { categoryConfig } from './CategoryIcon';

export default function DiaryModal({ open, onClose, onSave, initialText = '', defaultDate }) {
  const [date, setDate] = useState(defaultDate || new Date());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const createMemory = useCreateMemory();
  const config = categoryConfig['diary'];

  useEffect(() => {
    if (open) {
      setDate(defaultDate || new Date());
      setNotes(initialText);
    }
  }, [open, defaultDate, initialText]);

  const handleSave = async () => {
    if (!notes.trim()) return;

    setSaving(true);
    await createMemory.mutateAsync({
      category: 'diary',
      memory_date: format(date, 'yyyy-MM-dd'),
      location: null,
      notes: notes,
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
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetAndClose(); }}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-center font-serif text-2xl tracking-wide text-indigo-900">
            Diary Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-slate-500 text-sm font-normal">When</Label>
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

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-slate-500 text-sm font-normal">Your thoughts</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your entry here..."
              className="min-h-[200px] rounded-2xl border-slate-200 resize-none p-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving || !notes.trim()}
            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base transition-colors"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Entry'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
