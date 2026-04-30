import { getMany, keys, setMany } from 'idb-keyval';

// Helper to convert Blob to Base64 for JSON serialization
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

export async function exportZeroCloudBackup() {
  try {
    // 1. Retrieve all keys and data from IndexedDB
    const allKeys = await keys();
    const allData = await getMany(allKeys);

    // 2. Process data: convert any stored Blobs to Base64 strings
    const processedData = await Promise.all(allData.map(async (item) => {
      // Basic check: if the item is a blob, or contains a blob.
      if (item instanceof Blob) {
        return { _isBlob: true, data: await blobToBase64(item), type: item.type };
      }

      // If items are arrays of objects (like how our base44Client stores LocalEntity data)
      if (Array.isArray(item)) {
         return await Promise.all(item.map(async (subItem) => {
            if (subItem && typeof subItem === 'object') {
              const processedItem = { ...subItem };
              for (const [key, value] of Object.entries(processedItem)) {
                if (value instanceof Blob) {
                  processedItem[key] = { _isBlob: true, data: await blobToBase64(value), type: value.type };
                }
              }
              return processedItem;
            }
            return subItem;
         }));
      }

      // If items are objects containing blobs
      if (item && typeof item === 'object') {
        const processedItem = { ...item };
        for (const [key, value] of Object.entries(processedItem)) {
          if (value instanceof Blob) {
            processedItem[key] = { _isBlob: true, data: await blobToBase64(value), type: value.type };
          }
        }
        return processedItem;
      }

      return item;
    }));

    const backupObject = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: allKeys.reduce((acc, key, index) => {
        acc[key] = processedData[index];
        return acc;
      }, {})
    };

    // 3. Convert to JSON Blob
    const jsonString = JSON.stringify(backupObject);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const filename = `Cherish_Backup_${new Date().toISOString().split('T')[0]}.json`;

    // 4. Attempt Native Share API
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'application/json' });
      const shareData = {
        title: 'Cherish Backup',
        text: 'Your offline memories backup from Cherish.',
        files: [file]
      };

      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return { success: true, method: 'share' };
      }
    }

    // 5. Fallback to anchor download for desktop/unsupported browsers
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    return { success: true, method: 'download' };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error };
  }
}


// Helper to convert Base64 back to Blob
const base64ToBlob = async (base64String) => {
  const response = await fetch(base64String);
  return await response.blob();
};

export async function restoreZeroCloudBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const jsonString = event.target.result;
        const backupObject = JSON.parse(jsonString);

        // Validate basic backup structure
        if (!backupObject || !backupObject.version || !backupObject.data) {
          throw new Error('Invalid backup file format.');
        }

        // Process data: restore Base64 markers back to native Blobs
        const entriesToSet = await Promise.all(
          Object.entries(backupObject.data).map(async ([key, item]) => {

            if (item && item._isBlob && item.data) {
              const restoredBlob = await base64ToBlob(item.data);
              return [key, restoredBlob];
            }

            if (Array.isArray(item)) {
               const restoredArray = await Promise.all(item.map(async (subItem) => {
                  if (subItem && typeof subItem === 'object') {
                    const restoredItem = { ...subItem };
                    for (const [propKey, propValue] of Object.entries(restoredItem)) {
                      if (propValue && propValue._isBlob && propValue.data) {
                        restoredItem[propKey] = await base64ToBlob(propValue.data);
                      }
                    }
                    return restoredItem;
                  }
                  return subItem;
               }));
               return [key, restoredArray];
            }

            if (item && typeof item === 'object') {
              const restoredItem = { ...item };
              for (const [propKey, propValue] of Object.entries(restoredItem)) {
                if (propValue && propValue._isBlob && propValue.data) {
                  restoredItem[propKey] = await base64ToBlob(propValue.data);
                }
              }
              return [key, restoredItem];
            }

            return [key, item];
          })
        );

        // Write all entries back to IndexedDB
        await setMany(entriesToSet);

        resolve({ success: true, count: entriesToSet.length });
      } catch (error) {
        console.error('Failed to parse and restore backup:', error);
        reject({ success: false, error });
      }
    };

    reader.onerror = () => {
      reject({ success: false, error: new Error('Failed to read backup file.') });
    };

    reader.readAsText(file);
  });
}
