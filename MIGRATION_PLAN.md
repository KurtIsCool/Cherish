# IndexedDB Migration Plan

## 1. Library Recommendation: `idb-keyval`

For a React/TanStack Query environment where the primary goal is a fast drop-in replacement for `localStorage` (which is a key-value store), **`idb-keyval`** is the best choice.

**Why:**
- **Lightweight:** It is extremely small (< 600 bytes gzipped) and leverages modern Promises natively.
- **API Parity:** Its API (`get`, `set`, `update`, `del`) closely mirrors the synchronous `localStorage` API, making the mental model and refactoring effort minimal.
- **Blob Support:** Unlike `localStorage`, IndexedDB (and `idb-keyval` by extension) natively supports storing binary data like raw `Blob` and `File` objects, completely eliminating the 33% size overhead and rendering lag caused by Base64 encoding.

*(Alternative: `localforage` is also good but much heavier and older, designed with fallbacks to WebSQL/localStorage which are unnecessary in modern PWAs. `idb` is powerful but requires writing raw database transactions, which is overkill for a simple `base44Client` replacement).*

## 2. Code Refactor: `dbClient.js`

Here is the refactored database client using `idb-keyval`. This ensures that existing `.create()`, `.get()`, `.list()`, `.update()`, and `.delete()` methods return Promises with the same data structures TanStack Query expects.

```javascript
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
      // Direct file storage: Store the raw Blob/File instead of Base64
      UploadFile: async ({ file }) => {
        // We can just return the raw file. It will be stored in IndexedDB natively.
        // We attach a local object URL so the UI can render it immediately.
        return {
          file_data: file, // Store the raw Blob
          file_url: URL.createObjectURL(file) // Ephemeral URL for immediate UI rendering
        };
      }
    }
  }
};
```

## 3. The Image Handling Paradigm

Previously, the app converted Files to Base64 strings. Now, we store the raw `Blob`/`File` object directly in IndexedDB. When reading from the database to render the UI, we must convert that stored Blob back into an ephemeral `Blob URL`.

```javascript
// Example: How to process data returning from the DB before rendering
const processMemoryImages = (memories) => {
  return memories.map(memory => {
    // If the memory has a raw Blob (file_data), generate a URL for the `<img>` tag
    if (memory.image?.file_data && memory.image.file_data instanceof Blob) {
      // Note: In a real app, you should track these URLs and revoke them
      // with URL.revokeObjectURL() when components unmount to prevent memory leaks.
      const ephemeralUrl = URL.createObjectURL(memory.image.file_data);

      return {
        ...memory,
        image: {
          ...memory.image,
          file_url: ephemeralUrl
        }
      };
    }
    return memory;
  });
};
```

## 4. Implementation Steps

To hook this new database client up smoothly, follow these steps in your React components:

*   **Step 1: Install Dependencies**
    *   Run `npm install idb-keyval` to add the new library.
*   **Step 2: Replace the Client Import**
    *   Find all instances where `src/api/base44Client.js` is imported.
    *   Change the imports to point to the new `src/api/dbClient.js`.
*   **Step 3: Update `useQuery` Selectors / Data Fetching**
    *   Update your TanStack Query `useQuery` hooks that fetch items with images.
    *   Intercept the returned data and map over it using `URL.createObjectURL(item.file_data)` so the UI components receive a valid `src` string for `<img>` tags.
*   **Step 4: Cleanup Object URLs (Crucial)**
    *   Because `URL.createObjectURL` uses browser memory, you must implement a cleanup mechanism. Use `useEffect` return functions in components that render images to call `URL.revokeObjectURL(url)` when the component unmounts.
*   **Step 5: Test the Integration**
    *   Open DevTools -> Application -> IndexedDB.
    *   Upload an image and verify that the `cherish_memories` store contains an object where the image property holds a raw `File` or `Blob` object, not a massive Base64 string.
