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
  ImagePlus,
  Upload
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
import { useStoragePersistence } from '@/lib/useStoragePersistence';
import { exportZeroCloudBackup, restoreZeroCloudBackup } from '@/lib/backupUtils';

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isPersistent, isSupported } = useStoragePersistence();

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

  const handleExportData = async () => {
    setSaving(true);
    const result = await exportZeroCloudBackup();
    setSaving(false);
    
    if (result.success) {
      toast.success('Backup exported successfully');
      localStorage.setItem('last_backup_date', new Date().toISOString());
    } else {
      toast.error('Failed to export backup');
    }
  };

  const handleImportData = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const result = await restoreZeroCloudBackup(file);
      if (result.success) {
        queryClient.invalidateQueries();
        toast.success(`Successfully restored ${result.count} items.`);
      }
    } catch (error) {
      toast.error('Failed to restore backup.');
    } finally {
      setSaving(false);
      // reset file input
      e.target.value = null;
    }
  };

  const handleDeleteAll = async () => {
    // Optionally prompt export before deleting (if not backed up recently)
    const lastBackupStr = localStorage.getItem('last_backup_date');
    if (!lastBackupStr || (new Date() - new Date(lastBackupStr)) > 7 * 24 * 60 * 60 * 1000) {
       const userWantsToExport = window.confirm("You haven't backed up your data recently. Would you like to download a backup before deleting everything?");
       if (userWantsToExport) {
         await handleExportData();
       }
    }

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
    <div className="min-h-screen bg-transparent">
      <div className="max-w-md mx-auto px-5 py-8 pb-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 shadow-sm border border-white/40 mb-8"
        >
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-8">Profile & Preferences</h2>

          <div className="flex justify-center mb-8">
            <label className="relative cursor-pointer group">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              {photo ? (
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                  <img src={photo} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center ring-4 ring-white shadow-xl transition-transform duration-300 group-hover:scale-105">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                  ) : (
                    <Heart className="w-12 h-12 text-rose-300 fill-rose-300/50" />
                  )}
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                <ImagePlus className="w-5 h-5 text-slate-600" />
              </div>
            </label>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-500 text-xs font-bold uppercase tracking-wide ml-1">Partner's name</Label>
              <Input
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="h-14 rounded-2xl border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-lg font-medium text-slate-700 px-4"
                placeholder="Name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 text-xs font-bold uppercase tracking-wide ml-1">Anniversary</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-none bg-slate-50 hover:bg-white hover:ring-2 hover:ring-primary/20 justify-start text-lg font-medium text-slate-700 px-4 transition-all"
                  >
                    <CalendarDays className="mr-3 h-5 w-5 text-primary" />
                    {startDate ? format(startDate, 'MMMM d, yyyy') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-3xl shadow-xl border-none">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date > new Date()}
                    className="rounded-3xl border-none"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-lg mt-8 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium text-slate-500">Your Data</h2>
            {isSupported && (
               <span className={`text-xs px-2 py-1 rounded-full font-medium ${isPersistent ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                 Storage: {isPersistent ? '🟢 Safely Anchored' : '🟡 Volatile'}
               </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Memories logged</span>
              <span className="text-slate-400">{memories?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Vault items</span>
              <span className="text-slate-400">{vaultItems?.length || 0}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={saving}
                className="w-full h-12 rounded-xl"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export
              </Button>
              <label className="w-full h-12 rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                <Upload className="w-4 h-4 mr-2" />
                Import
              </label>
            </div>

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