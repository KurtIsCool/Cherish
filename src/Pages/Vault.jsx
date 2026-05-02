import React, { useState } from 'react';
import { usePartner } from '@/hooks/usePartner';
import { useVaultItems } from '@/hooks/useVaultItems';
import { Search, Heart, ThumbsDown, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'love', label: 'Loves', icon: Heart, color: 'text-rose-primary', border: 'border-rose-primary/20', bg: 'bg-rose-primary/10' },
  { id: 'dislike', label: 'Dislikes', icon: ThumbsDown, color: 'text-slate-500', border: 'border-slate-500/20', bg: 'bg-slate-500/10' },
  { id: 'comfort', label: 'Comfort', icon: Shield, color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
  { id: 'promise', label: 'Promises', icon: Sparkles, color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10' }
];

const VaultCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const categoryConfig = CATEGORIES.find(c => c.id === item.type) || CATEGORIES[1];
  const Icon = categoryConfig.icon || Heart;

  return (
    <motion.div
      layout
      onClick={() => setExpanded(!expanded)}
      className={`bg-white rounded-3xl p-5 shadow-sm border border-transparent hover:border-slate-100 transition-colors cursor-pointer relative overflow-hidden`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${categoryConfig.bg} ${categoryConfig.color}`}>
           <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <motion.div layout="position" className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
             {categoryConfig.label}
          </motion.div>
          <AnimatePresence initial={false}>
            <motion.p
              layout="position"
              className={`text-slate-700 text-sm leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}
            >
              {item.content}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default function Vault() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: vaultItems, isPending: isLoading } = useVaultItems();
  const { data: partners } = usePartner();

  const partner = partners?.[0];

  const filteredItems = vaultItems?.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="min-h-dvh bg-taupe-50 px-4 pt-8 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-800 mb-2">The Vault</h1>
          <p className="text-sm text-slate-500 font-medium">
            Everything unique about {partner?.partner_name || 'them'}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories, dislikes..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-sm border-none text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-primary/50 transition-all text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6 -mx-4 px-4 snap-x">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`
                snap-start shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                ${activeFilter === category.id
                  ? 'bg-rose-primary text-white shadow-md'
                  : 'bg-white text-slate-500 hover:bg-slate-50'}
              `}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Vault Items Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-white/50 animate-pulse h-24 rounded-3xl" />
               ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <VaultCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
             <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                   <Search className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No items found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
