import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, Tag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

// Soft pastel background colors for tags
const PASTEL_COLORS = [
  'bg-rose-100 text-rose-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
];

export default function TagCloudSection({ type, items, onUpdate, label, emptyMessage, isSearching }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    setLoading(true);
    await base44.entities.VaultItem.create({
      type,
      content: newItem.trim()
    });
    setNewItem('');
    setLoading(false);
    setIsAdding(false);
    onUpdate();
  };

  const handleDelete = async (id) => {
    await base44.entities.VaultItem.delete(id);
    onUpdate();
  };

  const filteredItems = items.filter(item => item.type === type);

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{label}</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`
                relative group rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 cursor-default hover:scale-105
                ${PASTEL_COLORS[index % PASTEL_COLORS.length]}
              `}
            >
              {item.content}
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute -top-1 -right-1 bg-white text-slate-400 rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Inline Add Button */}
        {isAdding ? (
          <motion.div
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            className="flex items-center"
          >
            <input
              autoFocus
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onBlur={() => !newItem && setIsAdding(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') setIsAdding(false);
              }}
              placeholder="Add..."
              className="bg-slate-100 rounded-full px-4 py-2 text-sm text-slate-700 outline-none border-2 border-primary/20 min-w-[100px]"
            />
          </motion.div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-primary/20 text-slate-400 hover:text-primary transition-colors border border-dashed border-slate-300 hover:border-primary"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {filteredItems.length === 0 && !isAdding && (
        <button
            onClick={() => setIsAdding(true)}
            className="w-full py-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:border-primary/50 hover:bg-primary/5 transition-colors group cursor-pointer"
        >
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-white group-hover:text-primary transition-colors">
                <Tag className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">{emptyMessage}</p>
            <p className="text-xs mt-1 opacity-70">Tap to add</p>
        </button>
      )}
    </div>
  );
}
