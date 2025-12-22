import type { Event, CalendarSettings, DateRange, StorageService } from '../../../types/calendar';

const STORAGE_KEYS = {
    EVENTS: 'maxnote_calendar_events',
    SETTINGS: 'maxnote_calendar_settings',
    CACHE_PREFIX: 'maxnote_calendar_cache_'
} as const;

export class LocalStorageService implements StorageService {
    saveEvents(events: Event[]): void {
        try {
            const serializedEvents = JSON.stringify(events.map(event => ({
                ...event,
                startDate: event.startDate.toISOString(),
                endDate: event.endDate.toISOString(),
                createdAt: event.createdAt.toISOString(),
                updatedAt: event.updatedAt.toISOString(),
                recurrence: event.recurrence ? {
                    ...event.recurrence,
                    endDate: event.recurrence.endDate?.toISOString()
                } : undefined
            })));
            localStorage.setItem(STORAGE_KEYS.EVENTS, serializedEvents);
        } catch (error) {
            console.error('Error saving events to localStorage:', error);
        }
    }

    loadEvents(): Event[] {
        try {
            const serializedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
            if (!serializedEvents) return [];

            const parsedEvents = JSON.parse(serializedEvents);
            return parsedEvents.map((event: any) => ({
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
            console.error('Error loading events from localStorage:', error);
            return [];
        }
    }

    saveSettings(settings: CalendarSettings): void {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings to localStorage:', error);
        }
    }

    loadSettings(): CalendarSettings {
        try {
            const serializedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (!serializedSettings) {
                return this.getDefaultSettings();
            }

            return { ...this.getDefaultSettings(), ...JSON.parse(serializedSettings) };
        } catch (error) {
            console.error('Error loading settings from localStorage:', error);
            return this.getDefaultSettings();
        }
    }

    cacheEvents(dateRange: DateRange, events: Event[]): void {
        try {
            const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${dateRange.start.getTime()}_${dateRange.end.getTime()}`;
            const cacheData = {
                events: events.map(event => ({
                    ...event,
                    startDate: event.startDate.toISOString(),
                    endDate: event.endDate.toISOString(),
                    createdAt: event.createdAt.toISOString(),
                    updatedAt: event.updatedAt.toISOString()
                })),
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error caching events:', error);
        }
    }

    getCachedEvents(dateRange: DateRange): Event[] | null {
        try {
            const cacheKey = `${STORAGE_KEYS.CACHE_PREFIX}${dateRange.start.getTime()}_${dateRange.end.getTime()}`;
            const cachedData = localStorage.getItem(cacheKey);

            if (!cachedData) return null;

            const cache = JSON.parse(cachedData);
            const cacheAge = Date.now() - cache.timestamp;

            // Cache is valid for 5 minutes
            if (cacheAge > 5 * 60 * 1000) {
                localStorage.removeItem(cacheKey);
                return null;
            }

            return cache.events.map((event: any) => ({
                ...event,
                startDate: new Date(event.startDate),
                endDate: new Date(event.endDate),
                createdAt: new Date(event.createdAt),
                updatedAt: new Date(event.updatedAt)
            }));
        } catch (error) {
            console.error('Error getting cached events:', error);
            return null;
        }
    }

    clearCache(): void {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(STORAGE_KEYS.CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    private getDefaultSettings(): CalendarSettings {
        return {
            defaultView: 'month',
            weekStartsOn: 0,
            timeFormat: '12h',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notifications: {
                enabled: true,
                defaultReminder: 15,
                browserNotifications: false,
                inAppNotifications: true,
                sound: false
            },
            workingHours: {
                enabled: false,
                startTime: '09:00',
                endTime: '17:00',
                daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
            }
        };
    }
}

// Singleton instance
export const storageService = new LocalStorageService();

// Utility functions for backward compatibility
export const saveEvents = (events: Event[]): void => {
    storageService.saveEvents(events);
};

export const loadEvents = (): Event[] => {
    return storageService.loadEvents();
};

export const saveSettings = (settings: CalendarSettings): void => {
    storageService.saveSettings(settings);
};

export const loadSettings = (): CalendarSettings => {
    return storageService.loadSettings();
};

// Migration utilities
export const migrateLegacyEvents = (legacyEvents: any[]): Event[] => {
    return legacyEvents.map(legacyEvent => ({
        id: legacyEvent.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: legacyEvent.title,
        description: legacyEvent.description || '',
        startDate: new Date(legacyEvent.date),
        endDate: new Date(legacyEvent.date),
        isAllDay: legacyEvent.isAllDay || false,
        category: legacyEvent.type as any || 'event',
        priority: 'medium' as const,
        location: legacyEvent.location || '',
        attendees: (legacyEvent.attendees || []).map((name: string) => ({
            id: `attendee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            confirmed: false
        })),
        reminders: [],
        attachments: [],
        tags: [],
        color: legacyEvent.color || 'bg-blue-500',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user'
    }));
};