import { useState, useEffect } from 'react';

export function useStoragePersistence() {
  const [isPersistent, setIsPersistent] = useState(false);

  useEffect(() => {
    async function checkAndRequestPersistence() {
      if (navigator.storage && navigator.storage.persist) {
        let persistent = await navigator.storage.persisted();
        if (!persistent) {
          persistent = await navigator.storage.persist();
        }
        setIsPersistent(persistent);
      }
    }

    checkAndRequestPersistence();
  }, []);

  return isPersistent;
}
