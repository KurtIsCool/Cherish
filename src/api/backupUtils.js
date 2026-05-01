import { base44 } from './dbClient';

// Helper to convert blob to base64 for JSON serialization
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper to convert base64 back to blob
const base64ToBlob = async (base64) => {
  const res = await fetch(base64);
  return await res.blob();
};

export async function exportBackup() {
  try {
    const partners = await base44.entities.Partner.list() || [];
    const memories = await base44.entities.Memory.list() || [];
    const vaultItems = await base44.entities.VaultItem.list() || [];

    const serializeData = async (items) => {
        return Promise.all(items.map(async item => {
            const serialized = { ...item };
            for (const key of Object.keys(serialized)) {
                if (serialized[key] instanceof Blob) {
                    serialized[key] = {
                        _type: 'blob',
                        _data: await blobToBase64(serialized[key]),
                        _mime: serialized[key].type,
                        _name: serialized[key].name // For File instances
                    };
                }
            }
            return serialized;
        }));
    };

    const serializedPartners = await serializeData(partners);
    const serializedMemories = await serializeData(memories);
    const serializedVaultItems = await serializeData(vaultItems);

    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        partners: serializedPartners,
        memories: serializedMemories,
        vaultItems: serializedVaultItems
      }
    };

    const jsonString = JSON.stringify(backupData);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Try Web Share API first
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], `cherish_backup_${Date.now()}.json`, { type: 'application/json' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Cherish Backup',
          text: 'Here is your Cherish offline data backup.',
          files: [file]
        });
        return true;
      }
    }

    // Fallback: Download via Object URL
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cherish_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;

  } catch (error) {
    console.error('Failed to export backup:', error);
    return false;
  }
}

export async function restoreBackup(file) {
  try {
    const text = await file.text();
    const backupData = JSON.parse(text);

    if (!backupData || !backupData.data) {
      throw new Error("Invalid backup file format");
    }

    const deserializeData = async (items) => {
        return Promise.all(items.map(async item => {
            const deserialized = { ...item };
            for (const key of Object.keys(deserialized)) {
                const val = deserialized[key];
                if (val && typeof val === 'object' && val._type === 'blob') {
                    const blob = await base64ToBlob(val._data);
                    if (val._name) {
                        deserialized[key] = new File([blob], val._name, { type: val._mime });
                    } else {
                        deserialized[key] = blob;
                    }
                }
            }
            return deserialized;
        }));
    };

    const { partners, memories, vaultItems } = backupData.data;

    if (partners) {
        const deserializedPartners = await deserializeData(partners);
        await base44.entities.Partner._saveData(deserializedPartners);
    }
    if (memories) {
        const deserializedMemories = await deserializeData(memories);
        await base44.entities.Memory._saveData(deserializedMemories);
    }
    if (vaultItems) {
        const deserializedVaultItems = await deserializeData(vaultItems);
        await base44.entities.VaultItem._saveData(deserializedVaultItems);
    }

    return true;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return false;
  }
}
