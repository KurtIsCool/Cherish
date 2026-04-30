import { get, set } from 'idb-keyval';

// A simple wrapper to make idb-keyval look like a database
class LocalEntity {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  // Helper to get data
  async _getData() {
    try {
      const data = await get(this.storageKey);
      return data || [];
    } catch (error) {
      console.error(`Failed to get data for ${this.storageKey}:`, error);
      return [];
    }
  }

  // Helper to save data
  async _saveData(data) {
    try {
      await set(this.storageKey, data);
    } catch (error) {
      console.error(`Failed to save data for ${this.storageKey}:`, error);
    }
  }

  async list(sortParam = null) {
    let items = await this._getData();
    
    // Simple sorting support
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

  async create(data) {
    const items = await this._getData();
    // Add a fake ID and timestamp
    const newItem = { 
      ...data, 
      id: Date.now().toString(), 
      created_at: new Date().toISOString() 
    };
    items.unshift(newItem); // Add to top
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

// Export the object structure your app expects
export const base44 = {
  entities: {
    Partner: new LocalEntity('cherish_partner'),
    Memory: new LocalEntity('cherish_memories'),
    VaultItem: new LocalEntity('cherish_vault_items'),
  },
  integrations: {
    Core: {
      // Mock file upload: Converts image to Base64 string to store locally
      UploadFile: async ({ file }) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ file_url: reader.result });
          };
          reader.readAsDataURL(file);
        });
      }
    }
  }
};
