// src/api/base44Client.js

// A simple wrapper to make LocalStorage look like a database
class LocalEntity {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  // Helper to get data
  _getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Helper to save data
  _saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  async list(sortParam = null) {
    let items = this._getData();
    
    // Simple sorting support
    if (sortParam) {
      const field = sortParam.replace('-', '');
      const isDesc = sortParam.startsWith('-');
      
      items.sort((a, b) => {
        if (a[field] < b[field]) return isDesc ? 1 : -1;
        if (a[field] > b[field]) return isDesc ? -1 : 1;
        return 0;
      });
    }
    
    return items;
  }

  async create(data) {
    const items = this._getData();
    // Add a fake ID and timestamp
    const newItem = { 
      ...data, 
      id: Date.now().toString(), 
      created_at: new Date().toISOString() 
    };
    items.unshift(newItem); // Add to top
    this._saveData(items);
    return newItem;
  }

  async update(id, updates) {
    const items = this._getData();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this._saveData(items);
      return items[index];
    }
    return null;
  }

  async delete(id) {
    const items = this._getData();
    const filtered = items.filter(item => item.id !== id);
    this._saveData(filtered);
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