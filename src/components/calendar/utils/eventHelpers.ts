import type { Event, EventCategory, Priority } from '../../../types/calendar';
import { isSameDay, isDateInRange } from './dateHelpers';

export const getEventsForDate = (events: Event[], date: Date): Event[] => {
    return events.filter(event => isSameDay(event.startDate, date));
};

export const getEventsForWeek = (events: Event[], weekStart: Date): Event[] => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return events.filter(event =>
        isDateInRange(event.startDate, { start: weekStart, end: weekEnd }) ||
        isDateInRange(event.endDate, { start: weekStart, end: weekEnd }) ||
        (event.startDate <= weekStart && event.endDate >= weekEnd)
    );
};

export const getEventsForMonth = (events: Event[], year: number, month: number): Event[] => {
    return events.filter(event => {
        return event.startDate.getFullYear() === year && event.startDate.getMonth() === month;
    });
};

export const getUpcomingEvents = (events: Event[], limit: number = 5): Event[] => {
    const now = new Date();
    return events
        .filter(event => event.startDate >= now)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        .slice(0, limit);
};

export const getPastEvents = (events: Event[], limit: number = 5): Event[] => {
    const now = new Date();
    return events
        .filter(event => event.startDate < now)
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
        .slice(0, limit);
};

export const getEventsByCategory = (events: Event[], category: EventCategory): Event[] => {
    return events.filter(event => event.category === category);
};

export const getEventsByPriority = (events: Event[], priority: Priority): Event[] => {
    return events.filter(event => event.priority === priority);
};

export const searchEvents = (events: Event[], query: string): Event[] => {
    if (!query.trim()) return events;

    const lowerQuery = query.toLowerCase();
    return events.filter(event =>
        event.title.toLowerCase().includes(lowerQuery) ||
        (event.description && event.description.toLowerCase().includes(lowerQuery)) ||
        (event.location && event.location.toLowerCase().includes(lowerQuery)) ||
        event.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        event.attendees.some(attendee => attendee.name.toLowerCase().includes(lowerQuery))
    );
};

export const filterEventsByTags = (events: Event[], tags: string[]): Event[] => {
    if (tags.length === 0) return events;

    return events.filter(event =>
        tags.some(tag => event.tags.includes(tag))
    );
};

export const hasTimeConflict = (event1: Event, event2: Event): boolean => {
    if (!isSameDay(event1.startDate, event2.startDate)) return false;

    return (
        (event1.startDate <= event2.startDate && event1.endDate > event2.startDate) ||
        (event2.startDate <= event1.startDate && event2.endDate > event1.startDate)
    );
};

export const getTimeConflicts = (events: Event[]): Event[][] => {
    const conflicts: Event[][] = [];
    const processed = new Set<string>();

    for (let i = 0; i < events.length; i++) {
        if (processed.has(events[i].id)) continue;

        const conflictGroup = [events[i]];
        processed.add(events[i].id);

        for (let j = i + 1; j < events.length; j++) {
            if (processed.has(events[j].id)) continue;

            if (conflictGroup.some(event => hasTimeConflict(event, events[j]))) {
                conflictGroup.push(events[j]);
                processed.add(events[j].id);
            }
        }

        if (conflictGroup.length > 1) {
            conflicts.push(conflictGroup);
        }
    }

    return conflicts;
};

export const getCategoryColor = (category: EventCategory): string => {
    const colors = {
        meeting: 'bg-blue-500',
        task: 'bg-green-500',
        reminder: 'bg-purple-500',
        event: 'bg-yellow-500',
        personal: 'bg-pink-500',
        work: 'bg-indigo-500'
    };

    return colors[category] || 'bg-gray-500';
};

export const getPriorityColor = (priority: Priority): string => {
    const colors = {
        low: 'border-gray-300',
        medium: 'border-yellow-300',
        high: 'border-orange-300',
        urgent: 'border-red-300'
    };

    return colors[priority] || 'border-gray-300';
};

export const createEvent = (
    title: string,
    startDate: Date,
    endDate: Date,
    category: EventCategory = 'event',
    options: Partial<Event> = {}
): Event => {
    const now = new Date();

    return {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        description: options.description || '',
        startDate,
        endDate,
        isAllDay: options.isAllDay || false,
        category,
        priority: options.priority || 'medium',
        location: options.location || '',
        attendees: options.attendees || [],
        reminders: options.reminders || [],
        attachments: options.attachments || [],
        tags: options.tags || [],
        color: options.color || getCategoryColor(category),
        createdAt: now,
        updatedAt: now,
        createdBy: options.createdBy || 'current-user',
        ...options
    };
};

export const updateEvent = (event: Event, updates: Partial<Event>): Event => {
    return {
        ...event,
        ...updates,
        updatedAt: new Date()
    };
};

export const duplicateEvent = (event: Event, newStartDate?: Date): Event => {
    const startDate = newStartDate || new Date(event.startDate);
    const duration = event.endDate.getTime() - event.startDate.getTime();
    const endDate = new Date(startDate.getTime() + duration);

    return createEvent(
        event.title,
        startDate,
        endDate,
        event.category,
        {
            description: event.description,
            isAllDay: event.isAllDay,
            priority: event.priority,
            location: event.location,
            attendees: [...event.attendees],
            reminders: [...event.reminders],
            attachments: [...event.attachments],
            tags: [...event.tags],
            color: event.color,
            createdBy: event.createdBy
        }
    );
};