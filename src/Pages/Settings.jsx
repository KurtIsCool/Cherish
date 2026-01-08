import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarDays, 
  Loader2, 
  Download, 
  Trash2,
  Heart,
  ImagePlus
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils'; // FIXED PATH
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: partners, isLoading } = useQuery({
    queryKey: ['partner'],
    queryFn: () => base44.entities.Partner.list()
  });

  const { data: memories } = useQuery({
    queryKey: ['memories'],
    queryFn: () => base44.entities.Memory.list()
  });

  const { data: vaultItems } = useQuery({
    queryKey: ['vaultItems'],
    queryFn: () => base44.entities.VaultItem.list()
  });

  const partner = partners?.[0];

  const [partnerName, setPartnerName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (partner) {
      setPartnerName(partner.partner_name);
      setStartDate(new Date(partner.start_date));
      setPhoto(partner.photo_url || null);
    }
  }, [partner]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhoto(file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!partner) return;
    setSaving(true);
    await base44.entities.Partner.update(partner.id, {
      partner_name: partnerName,
      start_date: format(startDate, 'yyyy-MM-dd'),
      photo_url: photo
    });
    queryClient.invalidateQueries(['partner']);
    setSaving(false);
    toast.success('Settings saved');
  };

  const handleExportData = () => {
    const exportData = {
      partner,
      memories,
      vaultItems,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cherish-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleDeleteAll = async () => {
    setSaving(true);
    try {
      const memoryPromises = (memories || []).map(m => base44.entities.Memory.delete(m.id));
      await Promise.all(memoryPromises);

      const vaultPromises = (vaultItems || []).map(v => base44.entities.VaultItem.delete(v.id));
      await Promise.all(vaultPromises);

      if (partner) {
        await base44.entities.Partner.delete(partner.id);
      }
      
      queryClient.clear();
      navigate(createPageUrl('Welcome'));
      toast.success("All data deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete some data");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  if (!partner) {
    navigate(createPageUrl('Welcome'));
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 to-slate-50">
      <div className="max-w-lg mx-auto px-5 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-light text-slate-700">Settings</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm mb-6"
        >
          <h2 className="text-sm font-medium text-slate-500 mb-6">Profile</h2>

          <div className="flex justify-center mb-6">
            <label className="relative cursor-pointer">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              {photo ? (
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-rose-100">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center ring-4 ring-rose-100">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
                  ) : (
                    <Heart className="w-8 h-8 text-rose-300" />
                  )}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                <ImagePlus className="w-4 h-4 text-white" />
              </div>
            </label>
          </div>

          <div className="space-y-2 mb-4">
            <Label className="text-slate-500 text-sm font-normal">Partner's name</Label>
            <Input
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="h-12 rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2 mb-6">
            <Label className="text-slate-500 text-sm font-normal">Anniversary</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl border-slate-200 justify-start"
                >
                  <CalendarDays className="mr-3 h-4 w-4 text-slate-400" />
                  {startDate ? format(startDate, 'MMMM d, yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <h2 className="text-sm font-medium text-slate-500 mb-6">Your Data</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Memories logged</span>
              <span className="text-slate-400">{memories?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Vault items</span>
              <span className="text-slate-400">{vaultItems?.length || 0}</span>
            </div>

            <Button
              variant="outline"
              onClick={handleExportData}
              className="w-full h-12 rounded-xl mt-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Backup
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your memories, vault items, and settings. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAll}
                    className="bg-red-500 hover:bg-red-600 rounded-xl"
                  >
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>
      </div>
    </div>
  );
}