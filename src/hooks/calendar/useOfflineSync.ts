import { useState, useEffect, useCallback } from 'react';
import type { Event } from '../../types/calendar';
import {
    offlineSyncService,
    queueEventCreate,
    queueEventUpdate,
    queueEventDelete,
    getSyncStatus,
    subscribeToSyncStatus,
    forceSync,
    type SyncStatus,
    type SyncQueueItem
} from '../../services/offlineSyncService';

interface UseOfflineSyncProps {
    events: Event[];
    onEventAdd?: (event: Event) => void;
    onEventUpdate?: (id: string, updates: Partial<Event>) => void;
    onEventDelete?: (id: string) => void;
}

export const useOfflineSync = ({
    events,
    onEventAdd,
    onEventUpdate,
    onEventDelete
}: UseOfflineSyncProps) => {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());
    const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    // Subscribe to sync status updates
    useEffect(() => {
        const unsubscribe = subscribeToSyncStatus((status) => {
            setSyncStatus(status);
            setIsOfflineMode(!status.isOnline);
        });

        return unsubscribe;
    }, []);

    // Load sync queue
    useEffect(() => {
        const loadSyncQueue = () => {
            try {
                const stored = localStorage.getItem('maxnote_sync_queue');
                if (stored) {
                    const queue = JSON.parse(stored).map((item: any) => ({
                        ...item,
                        timestamp: new Date(item.timestamp)
                    }));
                    setSyncQueue(queue);
                }
            } catch (error) {
                console.error('Error loading sync queue:', error);
            }
        };

        loadSyncQueue();
    }, []);

    // Cache events for offline access
    useEffect(() => {
        if (events.length > 0) {
            offlineSyncService.cacheEvents(events);
        }
    }, [events]);

    // Event operations with offline support
    const addEvent = useCallback((event: Event) => {
        if (onEventAdd) {
            onEventAdd(event);
        }

        if (syncStatus.isOnline) {
            // If online, queue for sync
            queueEventCreate(event);
        } else {
            // If offline, just queue and show offline indicator
            queueEventCreate(event);
        }
    }, [onEventAdd, syncStatus.isOnline]);

    const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
        if (onEventUpdate) {
            onEventUpdate(id, updates);
        }

        if (syncStatus.isOnline) {
            queueEventUpdate(id, updates);
        } else {
            queueEventUpdate(id, updates);
        }
    }, [onEventUpdate, syncStatus.isOnline]);

    const deleteEvent = useCallback((id: string) => {
        if (onEventDelete) {
            onEventDelete(id);
        }

        if (syncStatus.isOnline) {
            queueEventDelete(id);
        } else {
            queueEventDelete(id);
        }
    }, [onEventDelete, syncStatus.isOnline]);

    // Manual sync operations
    const triggerSync = useCallback(() => {
        forceSync();
    }, []);

    const clearSyncQueue = useCallback(() => {
        try {
            localStorage.removeItem('maxnote_sync_queue');
            setSyncQueue([]);
        } catch (error) {
            console.error('Error clearing sync queue:', error);
        }
    }, []);

    // Retry failed items
    const retryFailedItems = useCallback(() => {
        const failedItems = syncQueue.filter(item => (item.retryCount || 0) >= 3);
        failedItems.forEach(item => {
            item.retryCount = 0; // Reset retry count
        });

        try {
            localStorage.setItem('maxnote_sync_queue', JSON.stringify(syncQueue));
            forceSync();
        } catch (error) {
            console.error('Error retrying failed items:', error);
        }
    }, [syncQueue]);

    // Get offline cached events
    const getCachedEvents = useCallback((): Event[] | null => {
        return offlineSyncService.getCachedEvents();
    }, []);

    // Clear offline cache
    const clearCache = useCallback(() => {
        offlineSyncService.clearCache();
    }, []);

    // Conflict resolution
    const resolveConflict = useCallback(async (entityType: 'event' | 'task' | 'note', localData: any, remoteData: any) => {
        return await offlineSyncService.resolveConflict(entityType, localData, remoteData);
    }, []);

    // Format sync status for display
    const getSyncStatusText = useCallback((): string => {
        if (!syncStatus.isOnline) {
            return 'Offline';
        }

        if (syncStatus.syncInProgress) {
            return 'Sincronizando...';
        }

        if (syncStatus.lastSyncError) {
            return 'Erro na sincronização';
        }

        if (syncStatus.pendingSyncItems > 0) {
            return `${syncStatus.pendingSyncItems} itens pendentes`;
        }

        return 'Sincronizado';
    }, [syncStatus]);

    // Format last sync time
    const getLastSyncTimeText = useCallback((): string => {
        if (!syncStatus.lastSyncTime) {
            return 'Nunca';
        }

        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - syncStatus.lastSyncTime.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;

        return syncStatus.lastSyncTime.toLocaleDateString('pt-BR');
    }, [syncStatus.lastSyncTime]);

    // Get sync queue by type
    const getQueueByType = useCallback((type: 'create' | 'update' | 'delete') => {
        return syncQueue.filter(item => item.type === type);
    }, [syncQueue]);

    // Get sync queue by entity type
    const getQueueByEntityType = useCallback((entityType: 'event' | 'task' | 'note') => {
        return syncQueue.filter(item => item.entityType === entityType);
    }, [syncQueue]);

    return {
        // Status
        syncStatus,
        isOfflineMode,
        syncQueue,

        // Event operations
        addEvent,
        updateEvent,
        deleteEvent,

        // Sync operations
        triggerSync,
        clearSyncQueue,
        retryFailedItems,

        // Cache operations
        getCachedEvents,
        clearCache,

        // Conflict resolution
        resolveConflict,

        // Utility functions
        getSyncStatusText,
        getLastSyncTimeText,
        getQueueByType,
        getQueueByEntityType,
    };
};