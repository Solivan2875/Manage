import { useState, useEffect, useCallback, useRef } from 'react';
import type { Event } from '../../types/calendar';

// Type definitions for better TypeScript support
interface PerformanceObserverEntry {
    entryType: string;
    name: string;
    startTime: number;
    duration: number;
}

interface CustomEventInit {
    detail?: any;
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
}
import {
    performanceService,
    cacheGet,
    cacheSet,
    cacheDelete,
    debounce,
    throttle,
    filterEventsOptimized,
    aggregateEventsByDate,
    getPerformanceMetrics,
    generateAriaLabels,
    generateKeyboardShortcuts,
    announceToScreenReader,
    manageFocus,
    startPerformanceMeasure,
    endPerformanceMeasure,
    updateEventCount,
    cleanupCache
} from '../../services/performanceService';

interface UsePerformanceProps {
    events: Event[];
    onEventAdd?: (event: Event) => void;
    onEventUpdate?: (id: string, updates: Partial<Event>) => void;
    onEventDelete?: (id: string) => void;
}

export const usePerformance = ({
    events,
    onEventAdd,
    onEventUpdate,
    onEventDelete
}: UsePerformanceProps) => {
    const [isVirtualized, setIsVirtualized] = useState(false);
    const [performanceMetrics, setPerformanceMetrics] = useState(getPerformanceMetrics());
    const [isKeyboardNavigationEnabled, setIsKeyboardNavigationEnabled] = useState(true);
    const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(true);
    const [virtualListConfig, setVirtualListConfig] = useState({
        itemHeight: 60,
        containerHeight: 400,
        renderItem: null as any
    });

    const searchInputRef = useRef<HTMLInputElement>(null);
    const calendarContainerRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Initialize performance monitoring
    useEffect(() => {
        updateEventCount(events.length);

        // Setup keyboard shortcuts
        const shortcuts = generateKeyboardShortcuts();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isKeyboardNavigationEnabled) return;

            // Ignore shortcuts if user is typing in an input field
            const target = event.target as HTMLElement;
            const isTyping = target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            // Allow Escape key even in inputs to close modals
            if (isTyping && event.key !== 'Escape') {
                return;
            }

            const shortcut = shortcuts.find(s => s.key === event.key);
            if (shortcut && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                shortcut.action();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Setup custom event listeners
        const handleNewEvent = () => {
            if (onEventAdd) {
                const newEvent: Event = {
                    id: `event_${Date.now()}`,
                    title: 'Novo Evento',
                    description: '',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 60 * 60 * 1000),
                    isAllDay: false,
                    category: 'event',
                    priority: 'medium',
                    location: '',
                    attendees: [],
                    reminders: [],
                    attachments: [],
                    tags: [],
                    color: 'bg-blue-500',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: 'current-user'
                };
                onEventAdd(newEvent);
            }
        };

        const handleGoToToday = () => {
            const todayEvent = new CustomEvent('calendar-go-today');
            document.dispatchEvent(todayEvent);
        };

        const handleViewChange = (event: Event) => {
            const view = (event as CustomEvent).detail;
            announceToScreenReader(`Visualização alterada para ${view}`);
        };

        const handleCloseModal = () => {
            announceToScreenReader('Modal fechado');
        };

        document.addEventListener('calendar-new-event', handleNewEvent);
        document.addEventListener('calendar-go-today', handleGoToToday);
        document.addEventListener('calendar-view-week', handleViewChange);
        document.addEventListener('calendar-view-month', handleViewChange);
        document.addEventListener('calendar-close-modal', handleCloseModal);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('calendar-new-event', handleNewEvent);
            document.removeEventListener('calendar-go-today', handleGoToToday);
            document.removeEventListener('calendar-view-week', handleViewChange);
            document.removeEventListener('calendar-view-month', handleViewChange);
            document.removeEventListener('calendar-close-modal', handleCloseModal);
        };
    }, [events.length, onEventAdd, isKeyboardNavigationEnabled]);

    // Performance monitoring
    useEffect(() => {
        const interval = setInterval(() => {
            const metrics = getPerformanceMetrics();
            setPerformanceMetrics(metrics);
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Auto-cleanup cache
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            cleanupCache();
        }, 10 * 60 * 1000); // Every 10 minutes

        return () => clearInterval(cleanupInterval);
    }, []);

    // Virtual scrolling optimization
    const shouldVirtualize = useCallback(() => {
        return events.length > 100; // Virtualize if more than 100 events
    }, [events]);

    const getVirtualizedEvents = useCallback((containerHeight: number) => {
        if (!shouldVirtualize()) {
            return {
                items: events,
                startIndex: 0,
                endIndex: events.length,
                totalHeight: events.length * virtualListConfig.itemHeight
            };
        }

        return performanceService.createVirtualizedList(
            events,
            virtualListConfig.itemHeight,
            containerHeight,
            virtualListConfig.renderItem
        );
    }, [events, shouldVirtualize, virtualListConfig]);

    // Optimized event filtering
    const filterEvents = useCallback((
        search: string,
        categories?: string[],
        dateRange?: { start: Date; end: Date },
        tags?: string[]
    ) => {
        return filterEventsOptimized(events, {
            search,
            categories,
            dateRange,
            tags
        });
    }, [events]);

    // Performance-optimized event aggregation
    const getEventsByDate = useCallback(() => {
        return aggregateEventsByDate(events);
    }, [events]);

    // Accessibility helpers
    const getAriaProps = useCallback((event: Event) => {
        return generateAriaLabels(event);
    }, []);

    // Focus management
    const setFocus = useCallback((element: HTMLElement) => {
        const restoreFocus = manageFocus(element);
        previousFocusRef.current = restoreFocus;

        // Announce focus change to screen readers
        if (isScreenReaderEnabled) {
            const ariaLabel = element.getAttribute('aria-label') || element.textContent || '';
            announceToScreenReader(`Foco em: ${ariaLabel}`);
        }
    }, [isScreenReaderEnabled]);

    // Search functionality with debouncing
    const debouncedSearch = useCallback((searchTerm: string) => {
        // Implement search logic here
        console.log('Searching for:', searchTerm);
    }, []);

    const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = event.target.value;
        debouncedSearch(searchTerm);
    }, [debouncedSearch]);

    // Performance measurement
    const measureRenderPerformance = useCallback((renderFunction: () => void) => {
        startPerformanceMeasure();
        renderFunction();
        endPerformanceMeasure();
    }, []);

    // Memory management
    const optimizeMemoryUsage = useCallback(() => {
        // Clear old cache entries
        cleanupCache();

        // Force garbage collection if available
        if ('gc' in window) {
            (window as any).gc();
        }
    }, []);

    // Keyboard navigation
    const handleKeyboardNavigation = useCallback((event: React.KeyboardEvent, currentIndex: number, maxIndex: number) => {
        let newIndex = currentIndex;

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                newIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                newIndex = Math.min(maxIndex, currentIndex + 1);
                break;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                event.preventDefault();
                newIndex = maxIndex;
                break;
            case 'PageUp':
                event.preventDefault();
                newIndex = Math.max(0, currentIndex - 10);
                break;
            case 'PageDown':
                event.preventDefault();
                newIndex = Math.min(maxIndex, currentIndex + 10);
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                // Activate selected item
                break;
        }

        return newIndex;
    }, []);

    // Touch gesture support
    const handleTouchGestures = useCallback(() => {
        if (!calendarContainerRef.current) return;

        let touchStartY = 0;
        let touchEndY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaY) > 50) {
                if (deltaY > 0) {
                    // Swipe down - next period
                    const nextEvent = new CustomEvent('calendar-next');
                    document.dispatchEvent(nextEvent);
                } else {
                    // Swipe up - previous period
                    const prevEvent = new CustomEvent('calendar-previous');
                    document.dispatchEvent(prevEvent);
                }
            }
        };

        const container = calendarContainerRef.current;
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    // Responsive design helpers
    const getResponsiveConfig = useCallback(() => {
        const width = window.innerWidth;

        if (width < 640) {
            return {
                isMobile: true,
                virtualThreshold: 50,
                itemsPerRow: 1
            };
        } else if (width < 1024) {
            return {
                isMobile: false,
                isTablet: true,
                virtualThreshold: 100,
                itemsPerRow: 2
            };
        } else {
            return {
                isMobile: false,
                isTablet: false,
                isDesktop: true,
                virtualThreshold: 200,
                itemsPerRow: 3
            };
        }
    }, []);

    // Reduce motion support
    const prefersReducedMotion = useCallback(() => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    return {
        // State
        isVirtualized,
        performanceMetrics,
        isKeyboardNavigationEnabled,
        isScreenReaderEnabled,
        virtualListConfig,

        // Actions
        setIsVirtualized,
        setPerformanceMetrics,
        setIsKeyboardNavigationEnabled,
        setIsScreenReaderEnabled,
        setVirtualListConfig,

        // Performance optimization
        shouldVirtualize,
        getVirtualizedEvents,
        filterEvents,
        getEventsByDate,
        measureRenderPerformance,
        optimizeMemoryUsage,

        // Accessibility
        getAriaProps,
        setFocus,
        announceToScreenReader,

        // Navigation
        handleKeyboardNavigation,
        handleTouchGestures,
        handleSearch,
        searchInputRef,
        calendarContainerRef,
        previousFocusRef,

        // Responsive
        getResponsiveConfig,

        // Preferences
        prefersReducedMotion,

        // Utilities
        cacheGet,
        cacheSet,
        cacheDelete,
        debounce,
        throttle
    };
};