import { useState, useEffect, useCallback } from 'react';
import { transactionsAPI } from '../api';

const STORAGE_KEY = 'dukaanai_offline_queue';

export function useOfflineQueue(onSynced) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync queued transactions when coming online
  const syncQueue = useCallback(async () => {
    if (queue.length === 0 || !navigator.onLine || isSyncing) return;
    setIsSyncing(true);

    const remaining = [...queue];
    const syncedItems = [];

    while (remaining.length > 0) {
      const item = remaining[0];
      try {
        await transactionsAPI.create(item);
        syncedItems.push(item);
        remaining.shift();
      } catch (err) {
        console.error('Failed syncing offline item:', err);
        break; // Stop and retry later if network still fails
      }
    }

    setQueue(remaining);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    setIsSyncing(false);

    if (syncedItems.length > 0 && onSynced) {
      onSynced(syncedItems);
    }
  }, [queue, isSyncing, onSynced]);

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      syncQueue();
    }
  }, [isOnline, queue.length, syncQueue]);

  const enqueue = (transactionData) => {
    const updated = [...queue, transactionData];
    setQueue(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    isOnline,
    queueCount: queue.length,
    isSyncing,
    enqueue,
    syncQueue,
  };
}
