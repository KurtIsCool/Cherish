import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, CalendarDays, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils'; // FIXED PATH
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function Welcome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [partnerName, setPartnerName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [saving, setSaving] = useState(false);

  // Guard: If partner exists, go to home
  const { data: partners, isLoading } = useQuery({
    queryKey: ['partner'],
    queryFn: () => base44.entities.Partner.list()
  });

  useEffect(() => {
    if (!isLoading && partners && partners.length > 0) {
      navigate(createPageUrl('Home'));
    }
  }, [partners, isLoading, navigate]);

  const handleContinue = async () => {
    if (step === 1 && partnerName.trim()) {
      setStep(2);
      return;
    }
    
    if (step === 2 && startDate) {
      setSaving(true);
      await base44.entities.Partner.create({
        partner_name: partnerName.trim(),
        start_date: format(startDate, 'yyyy-MM-dd'),
        theme_color: 'warm'
      });
      await queryClient.invalidateQueries(['partner']);
      navigate(createPageUrl('Home'));
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-6">
            <Heart className="w-7 h-7 text-rose-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-light text-slate-700 tracking-tight mb-2">
            Cherish
          </h1>
          <p className="text-slate-400 text-sm">Your private vault</p>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-500 text-sm font-normal">Who holds your heart?</Label>
              <Input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Their name..."
                className="h-14 rounded-2xl border-slate-200 text-center text-lg font-light"
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-500 text-sm font-normal">When did your journey begin?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-2xl border-slate-200 text-lg font-light"
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
          className="mt-8"
        >
          <Button
            onClick={handleContinue}
            disabled={(step === 1 && !partnerName.trim()) || (step === 2 && !startDate) || saving}
            className="w-full h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-base"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {step === 2 ? 'Begin' : 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>

        <div className="flex items-center justify-center gap-2 mt-8">
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? 'bg-slate-400' : 'bg-slate-200'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? 'bg-slate-400' : 'bg-slate-200'}`} />
        </div>
      </motion.div>
    </div>
  );
}