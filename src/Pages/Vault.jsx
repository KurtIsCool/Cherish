import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Heart, ThumbsDown, Shield, Sparkles } from 'lucide-react';
import VaultSection from '@/components/cherish/VaultSection';
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
    { id: 'love', label: 'Loves', icon: Heart, color: 'text-rose-400' },
    { id: 'dislike', label: 'Dislikes', icon: ThumbsDown, color: 'text-slate-400' },
    { id: 'comfort', label: 'Comfort', icon: Shield, color: 'text-emerald-500' },
    { id: 'promise', label: 'Promises', icon: Sparkles, color: 'text-amber-500' }
  ];

  const sectionConfig = {
    love: {
      label: `Things ${partner?.partner_name || 'they'} love`,
      emptyMessage: 'What makes them light up?'
    },
    dislike: {
      label: `Things to avoid`,
      emptyMessage: 'What should you steer clear of?'
    },
    comfort: {
      label: `When they need comfort`,
      emptyMessage: 'What helps them feel better?'
    },
    promise: {
      label: `Promises made`,
      emptyMessage: 'What have you promised each other?'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 to-slate-50">
      <div className="max-w-lg mx-auto px-5 py-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-light text-slate-700 mb-2">The Vault</h1>
          <p className="text-sm text-slate-400">
            Everything you know about {partner?.partner_name || 'them'}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search the vault..."
            className="pl-11 h-12 rounded-2xl border-slate-200 bg-white"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-1 bg-white rounded-2xl shadow-sm mb-6 grid grid-cols-4">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col gap-1 py-3 rounded-xl data-[state=active]:bg-slate-50 data-[state=active]:shadow-none"
                >
                  <Icon className={`w-4 h-4 ${tab.color}`} strokeWidth={1.5} />
                  <span className="text-xs text-slate-500">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          ) : (
            tabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl p-6 shadow-sm"
                >
                  <VaultSection
                    type={tab.id}
                    items={searchQuery ? filteredItems : vaultItems || []}
                    onUpdate={handleUpdate}
                    label={sectionConfig[tab.id].label}
                    emptyMessage={sectionConfig[tab.id].emptyMessage}
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