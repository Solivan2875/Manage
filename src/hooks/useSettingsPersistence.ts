import { useCallback, useEffect, useRef } from 'react';
import type { UserSettings } from '../types/settings';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    version: string;
}

interface SyncResult {
    success: boolean;
    conflicts?: string[];
    error?: string;
}

interface UseSettingsPersistenceReturn {
    saveToCache: (key: string, data: any, ttl?: number) => void;
    loadFromCache: <T>(key: string) => T | null;
    clearCache: (key?: string) => void;
    syncWithServer: (settings: UserSettings) => Promise<SyncResult>;
    detectConflicts: (local: UserSettings, remote: UserSettings) => string[];
    resolveConflict: (field: keyof UserSettings, resolution: 'local' | 'remote' | 'merge') => UserSettings;
    exportSettings: (format: 'json' | 'csv') => void;
    importSettings: (file: File) => Promise<UserSettings>;
}

const CACHE_PREFIX = 'maxnote-settings-';
const CACHE_VERSION = '1.0.0';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useSettingsPersistence = (): UseSettingsPersistenceReturn => {
    const syncInProgress = useRef(false);
    const lastSyncTime = useRef<number>(0);

    // Save data to localStorage with TTL and versioning
    const saveToCache = useCallback(<T>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                version: CACHE_VERSION
            };

            const cacheKey = `${CACHE_PREFIX}${key}`;
            localStorage.setItem(cacheKey, JSON.stringify(entry));

            // Set expiration in a separate key for easier cleanup
            const expirationKey = `${cacheKey}-expires`;
            localStorage.setItem(expirationKey, (Date.now() + ttl).toString());

        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    }, []);

    // Load data from localStorage with TTL and version checking
    const loadFromCache = useCallback(<T>(key: string): T | null => {
        try {
            const cacheKey = `${CACHE_PREFIX}${key}`;
            const expirationKey = `${cacheKey}-expires`;

            // Check expiration
            const expiration = localStorage.getItem(expirationKey);
            if (expiration && Date.now() > parseInt(expiration)) {
                localStorage.removeItem(cacheKey);
                localStorage.removeItem(expirationKey);
                return null;
            }

            // Get and parse cached data
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const entry: CacheEntry<T> = JSON.parse(cached);

            // Check version compatibility
            if (entry.version !== CACHE_VERSION) {
                console.warn(`Cache version mismatch for ${key}. Expected ${CACHE_VERSION}, got ${entry.version}`);
                return null;
            }

            return entry.data;
        } catch (error) {
            console.error('Error loading from cache:', error);
            return null;
        }
    }, []);

    // Clear cache entries
    const clearCache = useCallback((key?: string) => {
        try {
            if (key) {
                const cacheKey = `${CACHE_PREFIX}${key}`;
                const expirationKey = `${cacheKey}-expires`;
                localStorage.removeItem(cacheKey);
                localStorage.removeItem(expirationKey);
            } else {
                // Clear all MaxNote settings cache
                const keys = Object.keys(localStorage);
                keys.forEach(k => {
                    if (k.startsWith(CACHE_PREFIX)) {
                        localStorage.removeItem(k);
                    }
                });
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }, []);

    // Detect conflicts between local and remote settings
    const detectConflicts = useCallback((local: UserSettings, remote: UserSettings): string[] => {
        const conflicts: string[] = [];

        // Compare timestamps for each field
        const fields: (keyof UserSettings)[] = [
            'displayName', 'bio', 'phone', 'avatarUrl',
            'theme', 'language', 'timezone',
            'fontSize', 'highContrast', 'reduceMotion', 'screenReader',
            'autoSync', 'autoBackup', 'exportFormat', 'retentionDays'
        ];

        for (const field of fields) {
            const localValue = local[field];
            const remoteValue = remote[field];

            // Skip if both are undefined/null
            if (localValue === undefined && remoteValue === undefined) continue;
            if (localValue === null && remoteValue === null) continue;

            // Check for actual conflicts
            if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
                conflicts.push(field);
            }
        }

        return conflicts;
    }, []);

    // Resolve conflicts by choosing local, remote, or merged version
    const resolveConflict = useCallback((
        field: keyof UserSettings,
        resolution: 'local' | 'remote' | 'merge'
    ): UserSettings => {
        // This would integrate with the actual settings state
        // For now, return a partial settings object
        const resolutionMap: Record<string, Partial<UserSettings>> = {
            local: { [field]: loadFromCache('local') },
            remote: { [field]: loadFromCache('remote') },
            merge: { [field]: loadFromCache('merged') }
        };

        return resolutionMap[resolution];
    }, [loadFromCache]);

    // Sync settings with server (simulated)
    const syncWithServer = useCallback(async (settings: UserSettings): Promise<SyncResult> => {
        if (syncInProgress.current) {
            return { success: false, error: 'Sync already in progress' };
        }

        syncInProgress.current = true;

        try {
            // Simulate server sync delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Save current settings as backup before sync
            saveToCache('pre-sync-backup', settings);

            // Simulate successful sync
            lastSyncTime.current = Date.now();
            saveToCache('last-sync', { timestamp: lastSyncTime.current });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown sync error'
            };
        } finally {
            syncInProgress.current = false;
        }
    }, [saveToCache]);

    // Export settings to file
    const exportSettings = useCallback((format: 'json' | 'csv') => {
        try {
            const settings = loadFromCache<UserSettings>('current') || {};
            const timestamp = new Date().toISOString();

            if (format === 'json') {
                const dataStr = JSON.stringify(settings, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });

                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `maxnote-settings-${timestamp.split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else if (format === 'csv') {
                // Convert settings to CSV format
                const csvHeaders = ['Campo', 'Valor', 'Tipo', 'Descrição'];
                const csvRows = Object.entries(settings).map(([key, value]) => {
                    return [
                        key,
                        JSON.stringify(value),
                        typeof value,
                        `Configuração de ${key}`
                    ].join(',');
                });

                const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
                const dataBlob = new Blob([csvContent], { type: 'text/csv' });

                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `maxnote-settings-${timestamp.split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting settings:', error);
        }
    }, [loadFromCache]);

    // Import settings from file
    const importSettings = useCallback(async (file: File): Promise<UserSettings> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    let imported: UserSettings;

                    if (file.name.endsWith('.json')) {
                        imported = JSON.parse(content);
                    } else if (file.name.endsWith('.csv')) {
                        // Parse CSV and convert to settings object
                        const lines = content.split('\n');
                        const headers = lines[0].split(',');

                        imported = {} as UserSettings;
                        for (let i = 1; i < lines.length; i++) {
                            const values = lines[i].split(',');
                            if (values.length >= 2) {
                                const field = values[0].replace(/"/g, '');
                                const value = values[1].replace(/"/g, '');

                                // Try to parse the value
                                try {
                                    (imported as any)[field] = JSON.parse(value);
                                } catch {
                                    (imported as any)[field] = value;
                                }
                            }
                        }
                    } else {
                        throw new Error('Unsupported file format');
                    }

                    resolve(imported);
                } catch (error) {
                    reject(error instanceof Error ? error : new Error('Import failed'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }, []);

    // Clean up expired cache entries on mount
    useEffect(() => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX) && key.endsWith('-expires')) {
                const expiration = parseInt(localStorage.getItem(key) || '0');
                if (Date.now() > expiration) {
                    const cacheKey = key.replace('-expires', '');
                    localStorage.removeItem(cacheKey);
                    localStorage.removeItem(key);
                }
            }
        });
    }, []);

    return {
        saveToCache,
        loadFromCache,
        clearCache,
        syncWithServer,
        detectConflicts,
        resolveConflict,
        exportSettings,
        importSettings
    };
};