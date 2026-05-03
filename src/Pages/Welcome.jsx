import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, CalendarDays, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { usePartner, useCreatePartner } from '@/hooks/usePartner';
import { restoreBackup } from '@/api/backupUtils';
import { toast } from 'sonner';

export default function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [partnerName, setPartnerName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: partners, isPending: isLoading } = usePartner();
  const createPartner = useCreatePartner();
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (!isLoading && partners && partners.length > 0) {
      navigate(createPageUrl('Home'));
    }
  }, [partners, isLoading, navigate]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const success = await restoreBackup(file);
      if (success) {
        toast.success('Backup restored successfully!');
        // Small delay to ensure DB writes are fully complete before redirecting
        setTimeout(() => {
          navigate(createPageUrl('Home'));
        }, 500);
      } else {
        toast.error('Failed to restore backup.');
        setSaving(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during restore.');
      setSaving(false);
    }
    // Clear input so same file can be selected again if needed
    event.target.value = '';
  };

  const handleContinue = async () => {
    if (step === 1 && partnerName.trim()) {
      setStep(2);
      return;
    }
    
    if (step === 2 && startDate) {
      setSaving(true);
      await createPartner.mutateAsync({
        partner_name: partnerName.trim(),
        start_date: format(startDate, 'yyyy-MM-dd'),
        theme_color: 'warm'
      });
      navigate(createPageUrl('Home'));
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-taupe-50 px-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-primary/10 mb-6">
            <Heart className="w-7 h-7 text-rose-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-serif text-text-main mb-2">
            Cherish
          </h1>
          <p className="text-slate-500 text-sm font-light">Your private vault</p>
        </div>

        {/* Step 1: Partner Name */}
        <motion.div
          initial={false}
          animate={{ 
            opacity: step === 1 ? 1 : 0,
            height: step === 1 ? 'auto' : 0,
            overflow: 'hidden'
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <Label className="text-text-main text-2xl font-serif font-normal block">Who holds your heart?</Label>
              <Input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Their name..."
                className="h-14 p-4 bg-theme-bg rounded-2xl border-none shadow-sm text-center text-lg font-sans focus:outline-none focus:ring-2 focus:ring-rose-primary/50 focus-visible:ring-2 focus-visible:ring-rose-primary/50"
              />
            </div>
          </div>
        </motion.div>

        {/* Step 2: Anniversary Date */}
        <motion.div
          initial={false}
          animate={{ 
            opacity: step === 2 ? 1 : 0,
            height: step === 2 ? 'auto' : 0,
            overflow: 'hidden'
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <Label className="text-text-main text-2xl font-serif font-normal block">When did your journey begin?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-14 p-4 bg-theme-bg rounded-2xl border-none shadow-sm text-lg font-sans font-normal hover:bg-theme-bg focus:ring-2 focus:ring-rose-primary/50"
                  >
                    <CalendarDays className="mr-3 h-5 w-5 text-slate-400" />
                    {startDate ? format(startDate, 'MMMM d, yyyy') : 'Select a date...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full min-h-[44px]"
            onClick={handleContinue}
            disabled={(step === 1 && !partnerName.trim()) || (step === 2 && !startDate) || saving}
          >
            <div
              className={`w-full h-14 min-h-[44px] rounded-full bg-slate-800 text-white font-sans font-medium text-base shadow-sm flex items-center justify-center transition-colors ${((step === 1 && !partnerName.trim()) || (step === 2 && !startDate) || saving) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'}`}
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {step === 2 ? 'Begin' : 'Continue'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </div>
          </motion.button>

          <button
            onClick={handleImportClick}
            disabled={saving}
            className="text-slate-500 hover:text-slate-700 text-sm font-medium min-h-[44px] flex items-center justify-center transition-colors disabled:opacity-50"
          >
            Already have a vault? Import data
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>

        <div className="flex items-center justify-center gap-2 mt-8">
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? 'bg-slate-400' : 'bg-slate-200'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? 'bg-slate-400' : 'bg-slate-200'}`} />
        </div>
      </motion.div>
    </div>
  );
}