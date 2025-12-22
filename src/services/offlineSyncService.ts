import type { Event } from '../types/calendar';

export interface SyncQueueItem {
    id: string;
    type: 'create' | 'update' | 'delete';
    entityType: 'event' | 'task' | 'note';
    data: any;
    timestamp: Date;
    retryCount?: number;
}

export interface SyncStatus {
    isOnline: boolean;
    lastSyncTime: Date | null;
    pendingSyncItems: number;
    syncInProgress: boolean;
    lastSyncError?: string;
}

class OfflineSyncService {
    private syncQueue: SyncQueueItem[] = [];
    private isOnline = navigator.onLine;
    private syncInProgress = false;
    private lastSyncTime: Date | null = null;
    private lastSyncError: string | undefined;
    private listeners: Array<(status: SyncStatus) => void> = [];

    constructor() {
        this.loadSyncQueue();
        this.setupEventListeners();
        this.checkPendingSync();
    }

    // Event listeners
    private setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyListeners();
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyListeners();
        });
    }

    // Observer pattern for status updates
    public subscribe(listener: (status: SyncStatus) => void) {
        this.listeners.push(listener);
        listener(this.getSyncStatus());

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        const status = this.getSyncStatus();
        this.listeners.forEach(listener => listener(status));
    }

    // Sync queue management
    private loadSyncQueue() {
        try {
            const stored = localStorage.getItem('maxnote_sync_queue');
            if (stored) {
                this.syncQueue = JSON.parse(stored).map((item: any) => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
            }
        } catch (error) {
            console.error('Error loading sync queue:', error);
            this.syncQueue = [];
        }
    }

    private saveSyncQueue() {
        try {
            localStorage.setItem('maxnote_sync_queue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('Error saving sync queue:', error);
        }
    }

    // Queue operations
    public queueCreate(entityType: 'event' | 'task' | 'note', data: any) {
        const item: SyncQueueItem = {
            id: `create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'create',
            entityType,
            data,
            timestamp: new Date()
        };

        this.syncQueue.push(item);
        this.saveSyncQueue();
        this.notifyListeners();

        if (this.isOnline && !this.syncInProgress) {
            this.processSyncQueue();
        }
    }

    public queueUpdate(entityType: 'event' | 'task' | 'note', id: string, data: any) {
        const item: SyncQueueItem = {
            id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'update',
            entityType,
            data: { id, ...data },
            timestamp: new Date()
        };

        this.syncQueue.push(item);
        this.saveSyncQueue();
        this.notifyListeners();

        if (this.isOnline && !this.syncInProgress) {
            this.processSyncQueue();
        }
    }

    public queueDelete(entityType: 'event' | 'task' | 'note', id: string) {
        const item: SyncQueueItem = {
            id: `delete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'delete',
            entityType,
            data: { id },
            timestamp: new Date()
        };

        this.syncQueue.push(item);
        this.saveSyncQueue();
        this.notifyListeners();

        if (this.isOnline && !this.syncInProgress) {
            this.processSyncQueue();
        }
    }

    // Sync processing
    private async processSyncQueue() {
        if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
            return;
        }

        this.syncInProgress = true;
        this.notifyListeners();

        try {
            // Process items in order
            for (let i = 0; i < this.syncQueue.length; i++) {
                const item = this.syncQueue[i];

                try {
                    await this.processSyncItem(item);
                    // Remove successfully processed item
                    this.syncQueue.splice(i, 1);
                    i--; // Adjust index after removal
                } catch (error) {
                    console.error('Error processing sync item:', error);
                    item.retryCount = (item.retryCount || 0) + 1;

                    // Remove item if it has failed too many times
                    if (item.retryCount >= 3) {
                        this.syncQueue.splice(i, 1);
                        i--;
                        console.error('Sync item failed after 3 retries:', item);
                    }
                }
            }

            this.lastSyncTime = new Date();
            this.lastSyncError = undefined;
        } catch (error) {
            this.lastSyncError = error instanceof Error ? error.message : 'Unknown error';
            console.error('Sync process failed:', error);
        } finally {
            this.syncInProgress = false;
            this.saveSyncQueue();
            this.notifyListeners();
        }
    }

    private async processSyncItem(item: SyncQueueItem): Promise<void> {
        // Simulate API call - in a real app, this would make actual HTTP requests
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random failure (10% chance)
                if (Math.random() < 0.1) {
                    reject(new Error('Simulated network error'));
                    return;
                }
                resolve();
            }, 500);
        });
    }

    // Check for pending sync on app start
    private checkPendingSync() {
        if (this.isOnline && this.syncQueue.length > 0 && !this.syncInProgress) {
            setTimeout(() => this.processSyncQueue(), 1000); // Delay to allow app to fully load
        }
    }

    // Manual sync trigger
    public forceSync() {
        if (this.isOnline && !this.syncInProgress) {
            this.processSyncQueue();
        }
    }

    // Status getters
    public getSyncStatus(): SyncStatus {
        return {
            isOnline: this.isOnline,
            lastSyncTime: this.lastSyncTime,
            pendingSyncItems: this.syncQueue.length,
            syncInProgress: this.syncInProgress,
            lastSyncError: this.lastSyncError
        };
    }

    // Cache management for offline access
    public cacheEvents(events: Event[]) {
        try {
            const cacheData = {
                events: events.map(event => ({
                    ...event,
                    startDate: event.startDate.toISOString(),
                    endDate: event.endDate.toISOString(),
                    createdAt: event.createdAt.toISOString(),
                    updatedAt: event.updatedAt.toISOString(),
                    recurrence: event.recurrence ? {
                        ...event.recurrence,
                        endDate: event.recurrence.endDate?.toISOString()
                    } : undefined
                })),
                timestamp: Date.now(),
                version: '1.0'
            };

            localStorage.setItem('maxnote_offline_cache', JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error caching events:', error);
        }
    }

    public getCachedEvents(): Event[] | null {
        try {
            const cached = localStorage.getItem('maxnote_offline_cache');
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            const cacheAge = Date.now() - cacheData.timestamp;

            // Cache is valid for 24 hours
            if (cacheAge > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('maxnote_offline_cache');
                return null;
            }

            return cacheData.events.map((event: any) => ({
                ...event,
                startDate: new Date(event.startDate),
                endDate: new Date(event.endDate),
                createdAt: new Date(event.createdAt),
                updatedAt: new Date(event.updatedAt),
                recurrence: event.recurrence ? {
                    ...event.recurrence,
                    endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined
                } : undefined
            }));
        } catch (error) {
            console.error('Error getting cached events:', error);
            return null;
        }
    }

    public clearCache() {
        try {
            localStorage.removeItem('maxnote_offline_cache');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    // Conflict resolution
    public async resolveConflict(entityType: 'event' | 'task' | 'note', localData: any, remoteData: any): Promise<any> {
        // Simple conflict resolution strategy: prefer the most recently updated item
        const localUpdated = new Date(localData.updatedAt);
        const remoteUpdated = new Date(remoteData.updatedAt);

        if (remoteUpdated > localUpdated) {
            return remoteData;
        } else {
            return localData;
        }
    }

    // Cleanup
    public cleanup() {
        // Remove old sync items (older than 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        this.syncQueue = this.syncQueue.filter(item => item.timestamp > thirtyDaysAgo);
        this.saveSyncQueue();
    }
}

// Singleton instance
export const offlineSyncService = new OfflineSyncService();

// Utility functions
export const queueEventCreate = (event: Event) => {
    offlineSyncService.queueCreate('event', event);
};

export const queueEventUpdate = (id: string, updates: Partial<Event>) => {
    offlineSyncService.queueUpdate('event', id, updates);
};

export const queueEventDelete = (id: string) => {
    offlineSyncService.queueDelete('event', id);
};

export const getSyncStatus = () => {
    return offlineSyncService.getSyncStatus();
};

export const subscribeToSyncStatus = (listener: (status: SyncStatus) => void) => {
    return offlineSyncService.subscribe(listener);
};

export const forceSync = () => {
    offlineSyncService.forceSync();
};