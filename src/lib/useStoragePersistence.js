import { useState, useEffect } from 'react';

export function useStoragePersistence() {
  const [isPersistent, setIsPersistent] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    async function checkAndRequestPersistence() {
      if (navigator.storage && navigator.storage.persist) {
        setIsSupported(true);

        try {
          // Check if already persistent
          let persistent = await navigator.storage.persisted();

          // Request persistence if not already granted
          if (!persistent) {
            persistent = await navigator.storage.persist();
          }

          setIsPersistent(persistent);
        } catch (error) {
          console.error('Failed to request storage persistence:', error);
          setIsPersistent(false);
        }
      }
    }

    checkAndRequestPersistence();
  }, []);

  return { isPersistent, isSupported };
}
