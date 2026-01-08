import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Heart, ThumbsDown, Shield, Sparkles } from 'lucide-react';
import TagCloudSection from '@/components/cherish/TagCloudSection';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Vault() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('love');

  const { data: vaultItems, isLoading } = useQuery({
    queryKey: ['vaultItems'],
    queryFn: () => base44.entities.VaultItem.list()
  });

  const { data: partners } = useQuery({
    queryKey: ['partner'],
    queryFn: () => base44.entities.Partner.list()
  });

  const partner = partners?.[0];

  const handleUpdate = () => {
    queryClient.invalidateQueries(['vaultItems']);
  };

  const filteredItems = vaultItems?.filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const tabs = [
    { id: 'love', label: 'Loves', icon: Heart, color: 'text-rose-500' },
    { id: 'dislike', label: 'Dislikes', icon: ThumbsDown, color: 'text-slate-500' },
    { id: 'comfort', label: 'Comfort', icon: Shield, color: 'text-emerald-500' },
    { id: 'promise', label: 'Promises', icon: Sparkles, color: 'text-amber-500' }
  ];

  const sectionConfig = {
    love: {
      label: `Things ${partner?.partner_name || 'they'} love`,
      emptyMessage: 'Tap to add something they love!'
    },
    dislike: {
      label: `Things to avoid`,
      emptyMessage: 'Tap to add a dislike to remember.'
    },
    comfort: {
      label: `When they need comfort`,
      emptyMessage: 'Tap to add a comfort strategy.'
    },
    promise: {
      label: `Promises made`,
      emptyMessage: 'Tap to add a promise.'
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-md mx-auto px-5 py-8 pb-32">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">The Vault</h1>
          <p className="text-sm text-slate-400 font-medium">
            Everything unique about {partner?.partner_name || 'them'}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search the vault..."
            className="pl-11 h-12 rounded-2xl border-none bg-white shadow-sm ring-1 ring-slate-100 focus-visible:ring-primary focus-visible:ring-2 transition-all"
          />
        </div>

        {/* Tabs (Segmented Control) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-1.5 bg-slate-100/80 rounded-full mb-8 flex justify-between">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex-1 rounded-full py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-800 text-slate-500 transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                     <Icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-current'}`} strokeWidth={2.5} />
                     <span className={`text-xs font-bold ${activeTab === tab.id ? '' : 'hidden sm:inline'}`}>{tab.label}</span>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-3xl w-full" />
            </div>
          ) : (
            tabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0 focus-visible:outline-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 min-h-[300px]"
                >
                  <TagCloudSection
                    type={tab.id}
                    items={searchQuery ? filteredItems : vaultItems || []}
                    onUpdate={handleUpdate}
                    label={sectionConfig[tab.id].label}
                    emptyMessage={sectionConfig[tab.id].emptyMessage}
                    isSearching={!!searchQuery}
                  />
                </motion.div>
              </TabsContent>
            ))
          )}
        </Tabs>
      </div>
    </div>
  );
}