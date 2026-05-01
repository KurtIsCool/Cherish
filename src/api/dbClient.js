// src/api/dbClient.js
import { get, set } from 'idb-keyval';

class IDBEntity {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  async _getData() {
    try {
      const data = await get(this.storageKey);
      return data || [];
    } catch (error) {
      console.error(`Failed to get data for ${this.storageKey}:`, error);
      return [];
    }
  }

  async _saveData(data) {
    try {
      await set(this.storageKey, data);
    } catch (error) {
      console.error(`Failed to save data for ${this.storageKey}:`, error);
      throw error; // Re-throw to let TanStack Query handle the failure
    }
  }

  async list(sortParam = null) {
    let items = await this._getData();

    if (sortParam) {
      const field = sortParam.replace('-', '');
      const isDesc = sortParam.startsWith('-');

      items.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    return items;
  }

  async get(id) {
    const items = await this._getData();
    const item = items.find(item => item.id === id);
    return item || null;
  }

  async create(data) {
    const items = await this._getData();
    const newItem = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    items.unshift(newItem);
    await this._saveData(items);
    return newItem;
  }

  async update(id, updates) {
    const items = await this._getData();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      await this._saveData(items);
      return items[index];
    }
    return null;
  }

  async delete(id) {
    const items = await this._getData();
    const filtered = items.filter(item => item.id !== id);
    await this._saveData(filtered);
    return true;
  }
}

export const base44 = {
  entities: {
    Partner: new IDBEntity('cherish_partner'),
    Memory: new IDBEntity('cherish_memories'),
    VaultItem: new IDBEntity('cherish_vault_items'),
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        return {
          file_data: file, // Store the raw Blob
          file_url: URL.createObjectURL(file) // Ephemeral URL for immediate UI rendering
        };
      }
    }
  }
};
