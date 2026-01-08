import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Check, X, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function VaultSection({ type, items, onUpdate, label, emptyMessage, isSearching }) {
  const [editing, setEditing] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    setAdding(true);
    await base44.entities.VaultItem.create({
      type,
      content: newItem.trim()
    });
    setNewItem('');
    setAdding(false);
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
        <h3 className="font-medium text-slate-700">{label}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(!editing)}
          className="text-slate-400 hover:text-slate-600"
        >
          {editing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
        </Button>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 group"
            >
              <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600">
                {item.content}
              </div>
              {editing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  className="h-8 w-8 text-slate-300 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredItems.length === 0 && !editing && (
          <p className="text-sm text-slate-400 italic py-4 text-center">
            {isSearching ? 'No results found' : emptyMessage}
          </p>
        )}

        {editing && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 pt-2"
          >
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add something new..."
              className="h-11 rounded-xl border-slate-200"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button
              onClick={handleAdd}
              disabled={adding || !newItem.trim()}
              size="icon"
              className="h-11 w-11 rounded-xl bg-slate-800 hover:bg-slate-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}