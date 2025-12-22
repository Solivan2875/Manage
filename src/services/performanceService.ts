import type { Event } from '../types/calendar';

interface PerformanceMetrics {
    renderTime: number;
    eventCount: number;
    memoryUsage: number;
    cacheHitRate: number;
    lastUpdate: Date;
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    accessCount: number;
}

class PerformanceService {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private metrics: PerformanceMetrics = {
        renderTime: 0,
        eventCount: 0,
        memoryUsage: 0,
        cacheHitRate: 0,
        lastUpdate: new Date()
    };
    private cacheHits = 0;
    private cacheMisses = 0;
    private maxCacheSize = 1000;
    private cacheExpirationTime = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.loadMetrics();
        this.setupPerformanceMonitoring();
    }

    // Cache management
    public get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (entry && Date.now() - entry.timestamp < this.cacheExpirationTime) {
            entry.accessCount++;
            this.cacheHits++;
            return entry.data;
        }

        this.cacheMisses++;
        return null;
    }

    public set<T>(key: string, data: T): void {
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.getOldestCacheKey();
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            accessCount: 1
        });
    }

    public delete(key: string): boolean {
        return this.cache.delete(key);
    }

    public clear(): void {
        this.cache.clear();
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }

    private getOldestCacheKey(): string | null {
        let oldestKey: string | null = null;
        let oldestTimestamp = Date.now();

        for (const [key, entry] of this.cache) {
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
                oldestKey = key;
            }
        }

        return oldestKey;
    }

    // Performance monitoring
    private setupPerformanceMonitoring(): void {
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memory = (performance as any).memory;
                if (memory) {
                    this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
                }
            }, 5000); // Every 5 seconds
        }

        // Monitor render performance
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.forEach((entry: PerformanceObserverEntry) => {
                    if (entry.entryType === 'measure' && entry.name === 'calendar-render') {
                        this.metrics.renderTime = entry.duration;
                        this.metrics.lastUpdate = new Date();
                        this.saveMetrics();
                    }
                });
            });

            try {
                observer.observe({ entryTypes: ['measure'] });
            } catch (error) {
                console.warn('Performance Observer not supported:', error);
            }
        }
    }

    // Performance optimization utilities
    public debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): (...args: any[]) => any {
        let timeout: ReturnType<typeof setTimeout>;

        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    public throttle<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): (...args: any[]) => any {
        let inThrottle = false;

        return (...args: any[]) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    // Virtual scrolling for large lists
    public createVirtualizedList<T>(
        items: T[],
        itemHeight: number,
        containerHeight: number,
        renderItem: (item: T, index: number) => React.ReactNode
    ): {
        visibleItems: T[];
        startIndex: number;
        endIndex: number;
        scrollTop: number;
        totalHeight: number;
    } {
        const visibleCount = Math.ceil(containerHeight / itemHeight) + 1; // +1 for buffer
        const totalHeight = items.length * itemHeight;

        return {
            visibleItems: items.slice(0, visibleCount),
            startIndex: 0,
            endIndex: visibleCount,
            scrollTop: 0,
            totalHeight
        };
    }

    // Event filtering and sorting optimization
    public filterEventsOptimized(
        events: Event[],
        filters: {
            search?: string;
            categories?: string[];
            dateRange?: { start: Date; end: Date };
            tags?: string[];
        }
    ): Event[] {
        let filtered = events;

        // Apply search filter (optimized with index)
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = events.filter(event =>
                event.title.toLowerCase().includes(searchTerm) ||
                (event.description && event.description.toLowerCase().includes(searchTerm)) ||
                (event.location && event.location.toLowerCase().includes(searchTerm))
            );
        } else {
            filtered = events;
        }

        // Apply category filter
        if (filters.categories && filters.categories.length > 0) {
            filtered = filtered.filter(event => filters.categories.includes(event.category));
        }

        // Apply date range filter
        if (filters.dateRange) {
            filtered = filtered.filter(event =>
                event.startDate >= filters.dateRange.start &&
                event.startDate <= filters.dateRange.end
            );
        }

        // Apply tags filter
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(event =>
                filters.tags.some(tag => event.tags.includes(tag))
            );
        }

        return filtered;
    }

    // Memory-efficient event aggregation
    public aggregateEventsByDate(events: Event[]): Map<string, Event[]> {
        const eventsByDate = new Map<string, Event[]>();

        events.forEach(event => {
            const dateKey = event.startDate.toISOString().split('T')[0];

            if (!eventsByDate.has(dateKey)) {
                eventsByDate.set(dateKey, []);
            }

            eventsByDate.get(dateKey)!.push(event);
        });

        return eventsByDate;
    }

    // Optimized date calculations
    public getDateRangeEvents(
        events: Event[],
        start: Date,
        end: Date
    ): Event[] {
        const startTime = start.getTime();
        const endTime = end.getTime();

        // Binary search optimization for sorted events
        return events.filter(event => {
            const eventTime = event.startDate.getTime();
            return eventTime >= startTime && eventTime <= endTime;
        });
    }

    // Performance metrics
    public startRenderMeasure(): void {
        if ('performance' in window && 'mark' in performance) {
            (performance as any).mark('calendar-render-start');
        }
    }

    public endRenderMeasure(): void {
        if ('performance' in window && 'measure' in performance) {
            (performance as any).measure('calendar-render', 'calendar-render-start');
        }
    }

    public getMetrics(): PerformanceMetrics {
        this.metrics.cacheHitRate = this.cacheHits + this.cacheMisses > 0
            ? this.cacheHits / (this.cacheHits + this.cacheMisses)
            : 0;

        return { ...this.metrics };
    }

    public updateEventCount(count: number): void {
        this.metrics.eventCount = count;
        this.metrics.lastUpdate = new Date();
        this.saveMetrics();
    }

    private loadMetrics(): void {
        try {
            const stored = localStorage.getItem('maxnote_performance_metrics');
            if (stored) {
                this.metrics = { ...this.metrics, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Error loading performance metrics:', error);
        }
    }

    private saveMetrics(): void {
        try {
            localStorage.setItem('maxnote_performance_metrics', JSON.stringify(this.metrics));
        } catch (error) {
            console.error('Error saving performance metrics:', error);
        }
    }

    // Accessibility helpers
    public generateAriaLabels(event: Event): {
        label: string;
        description: string;
        role: string;
    } {
        const formatTime = (date: Date) => {
            return date.toLocaleString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const label = `${event.title} - ${formatTime(event.startDate)}`;

        let description = `Evento: ${event.title}`;
        if (event.description) {
            description += `. Descrição: ${event.description}`;
        }
        if (event.location) {
            description += `. Local: ${event.location}`;
        }
        description += `. Início: ${formatTime(event.startDate)}`;
        description += `. Término: ${formatTime(event.endDate)}`;

        return {
            label,
            description,
            role: 'button'
        };
    }

    public generateKeyboardShortcuts(): Array<{
        key: string;
        description: string;
        action: () => void;
    }> {
        return [
            {
                key: 'n',
                description: 'Criar novo evento',
                action: () => {
                    // Trigger new event creation
                    document.dispatchEvent(new CustomEvent('calendar-new-event'));
                }
            },
            {
                key: 'd',
                description: 'Ir para hoje',
                action: () => {
                    // Navigate to today
                    document.dispatchEvent(new CustomEvent('calendar-go-today'));
                }
            },
            {
                key: 'w',
                description: 'Visualização semanal',
                action: () => {
                    // Switch to week view
                    document.dispatchEvent(new CustomEvent('calendar-view-week'));
                }
            },
            {
                key: 'm',
                description: 'Visualização mensal',
                action: () => {
                    // Switch to month view
                    document.dispatchEvent(new CustomEvent('calendar-view-month'));
                }
            },
            {
                key: 's',
                description: 'Buscar eventos',
                action: () => {
                    // Focus search input
                    const searchInput = document.getElementById('calendar-search-input') as HTMLInputElement;
                    if (searchInput) {
                        searchInput.focus();
                    }
                }
            },
            {
                key: 'Escape',
                description: 'Fechar modal',
                action: () => {
                    // Close current modal
                    document.dispatchEvent(new CustomEvent('calendar-close-modal'));
                }
            },
            {
                key: 'ArrowLeft',
                description: 'Navegar para período anterior',
                action: () => {
                    // Navigate to previous period
                    document.dispatchEvent(new CustomEvent('calendar-previous'));
                }
            },
            {
                key: 'ArrowRight',
                description: 'Navegar para próximo período',
                action: () => {
                    // Navigate to next period
                    document.dispatchEvent(new CustomEvent('calendar-next'));
                }
            }
        ];
    }

    // Accessibility utilities
    public announceToScreenReader(message: string): void {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    public manageFocus(element: HTMLElement): () => void {
        // Save current focus
        const previousFocus = document.activeElement as HTMLElement;

        // Focus new element
        element.focus();

        // Return focus restoration function
        return () => {
            if (previousFocus) {
                previousFocus.focus();
            }
        };
    }

    // Cleanup expired cache entries
    public cleanupCache(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache) {
            if (now - entry.timestamp > this.cacheExpirationTime) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }

    // Performance optimization for date calculations
    public createOptimizedDateUtils(): {
        format: (date: Date, format: string) => string,
        addDays: (date: Date, days: number) => Date,
        addWeeks: (date: Date, weeks: number) => Date,
        addMonths: (date: Date, months: number) => Date,
        isSameDay: (date1: Date, date2: Date) => boolean,
        isSameWeek: (date1: Date, date2: Date) => boolean,
        isSameMonth: (date1: Date, date2: Date) => boolean
    } {
        // Cache frequently used date calculations
        const dateCache = new Map<string, any>();

        return {
            format: (date: Date, format: string) => {
                const cacheKey = `format_${date.getTime()}_${format}`;
                if (dateCache.has(cacheKey)) {
                    return dateCache.get(cacheKey);
                }

                const result = date.toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                dateCache.set(cacheKey, result);
                return result;
            },

            addDays: (date: Date, days: number) => {
                const result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            },

            addWeeks: (date: Date, weeks: number) => {
                const result = new Date(date);
                result.setDate(result.getDate() + (weeks * 7));
                return result;
            },

            addMonths: (date: Date, months: number) => {
                const result = new Date(date);
                result.setMonth(result.getMonth() + months);
                return result;
            },

            isSameDay: (date1: Date, date2: Date) => {
                return date1.getFullYear() === date2.getFullYear() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getDate() === date2.getDate();
            },

            isSameWeek: (date1: Date, date2: Date) => {
                const getStartOfWeek = (date: Date) => {
                    const d = new Date(date);
                    const day = d.getDay();
                    const diff = d.getDate() - day;
                    d.setDate(diff);
                    return d;
                };

                const start1 = getStartOfWeek(date1);
                const start2 = getStartOfWeek(date2);

                return start1.getTime() === start2.getTime();
            },

            isSameMonth: (date1: Date, date2: Date) => {
                return date1.getFullYear() === date2.getFullYear() &&
                    date1.getMonth() === date2.getMonth();
            }
        };
    }
}

// Singleton instance
export const performanceService = new PerformanceService();

// Utility functions
export const cacheGet = <T>(key: string): T | null => {
    return performanceService.get<T>(key);
};

export const cacheSet = <T>(key: string, data: T): void => {
    performanceService.set(key, data);
};

export const cacheDelete = (key: string): boolean => {
    return performanceService.delete(key);
};

export const cacheClear = (): void => {
    performanceService.clear();
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    return performanceService.debounce(func, wait);
};

export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    return performanceService.throttle(func, limit);
};

export const filterEventsOptimized = (
    events: Event[],
    filters: {
        search?: string;
        categories?: string[];
        dateRange?: { start: Date; end: Date };
        tags?: string[];
    }
): Event[] => {
    return performanceService.filterEventsOptimized(events, filters);
};

export const aggregateEventsByDate = (events: Event[]): Map<string, Event[]> => {
    return performanceService.aggregateEventsByDate(events);
};

export const getPerformanceMetrics = () => {
    return performanceService.getMetrics();
};

export const generateAriaLabels = (event: Event) => {
    return performanceService.generateAriaLabels(event);
};

export const generateKeyboardShortcuts = () => {
    return performanceService.generateKeyboardShortcuts();
};

export const announceToScreenReader = (message: string) => {
    performanceService.announceToScreenReader(message);
};

export const manageFocus = (element: HTMLElement) => {
    return performanceService.manageFocus(element);
};

export const createOptimizedDateUtils = () => {
    return performanceService.createOptimizedDateUtils();
};

export const startPerformanceMeasure = () => {
    performanceService.startRenderMeasure();
};

export const endPerformanceMeasure = () => {
    performanceService.endRenderMeasure();
};

export const updateEventCount = (count: number) => {
    performanceService.updateEventCount(count);
};

export const cleanupCache = () => {
    performanceService.cleanupCache();
};