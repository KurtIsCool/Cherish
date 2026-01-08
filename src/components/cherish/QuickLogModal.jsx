import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, MapPin, ImagePlus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { categoryConfig } from './CategoryIcon';

export default function QuickLogModal({ open, onClose, category, onSave }) {
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const config = categoryConfig[category];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhoto(file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Memory.create({
      category,
      memory_date: format(date, 'yyyy-MM-dd'),
      location: location || null,
      notes: notes || null,
      photo_url: photo || null
    });
    setSaving(false);
    onSave();
    resetAndClose();
  };

  const resetAndClose = () => {
    setDate(new Date());
    setLocation('');
    setNotes('');
    setPhoto(null);
    onClose();
  };

  if (!config) return null;

  return (
    <Sheet open={open} onOpenChange={resetAndClose}>
      <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-center font-light text-xl tracking-wide">
            Log a {config.label}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-8">
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

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-slate-500 text-sm font-normal">Where</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location..."
                className="pl-11 h-12 rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <Label className="text-slate-500 text-sm font-normal">Photo</Label>
            {photo ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={photo} alt="Memory" className="w-full h-48 object-cover" />
                <button 
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur rounded-full px-3 py-1 text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-sm">Add a photo</span>
                  </div>
                )}
              </label>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-slate-500 text-sm font-normal">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What made this special..."
              className="min-h-[100px] rounded-xl border-slate-200 resize-none"
            />
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-base"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Memory'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}