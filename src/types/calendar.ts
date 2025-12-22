// Base types for the calendar system

export type EventCategory = 'meeting' | 'task' | 'reminder' | 'event' | 'personal' | 'work';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type CalendarView = 'month' | 'week' | 'day';

export interface Attendee {
    id: string;
    name: string;
    email?: string;
    confirmed?: boolean;
}

export interface Reminder {
    id: string;
    minutesBefore: number;
    type: 'notification' | 'email' | 'sms';
    enabled: boolean;
}

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface RecurrenceRule {
    id: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number;
    count?: number;
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    category: EventCategory;
    priority: Priority;
    location?: string;
    attendees: Attendee[];
    recurrence?: RecurrenceRule;
    reminders: Reminder[];
    attachments: Attachment[];
    tags: string[];
    color: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

export interface EventFormData {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    isAllDay: boolean;
    category: EventCategory;
    priority: Priority;
    location: string;
    attendees: string;
    recurrence?: RecurrenceRule;
    reminders: Reminder[];
    tags: string[];
    color: string;
}

export interface CalendarState {
    // Navigation and view
    currentDate: Date;
    currentView: CalendarView;
    selectedDate: Date | null;

    // Events
    events: Event[];
    filteredEvents: Event[];
    selectedEvent: Event | null;

    // UI State
    isModalOpen: boolean;
    isCreating: boolean;
    isEditing: boolean;

    // Filters and search
    searchQuery: string;
    activeFilters: EventFilter[];

    // Notifications
    notifications: Notification[];
    notificationSettings: NotificationSettings;
}

export interface EventFilter {
    id: string;
    type: 'category' | 'priority' | 'tag' | 'date';
    value: string;
    label: string;
}

export interface Notification {
    id: string;
    eventId: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
}

export interface NotificationSettings {
    enabled: boolean;
    defaultReminder: number; // minutes before
    browserNotifications: boolean;
    inAppNotifications: boolean;
    sound: boolean;
}

export interface CalendarSettings {
    defaultView: CalendarView;
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    timeFormat: '12h' | '24h';
    timezone: string;
    notifications: NotificationSettings;
    workingHours: WorkingHours;
}

export interface WorkingHours {
    enabled: boolean;
    startTime: string;
    endTime: string;
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
}

export interface DateRange {
    start: Date;
    end: Date;
}

// Storage interfaces
export interface StorageService {
    // Events
    saveEvents(events: Event[]): void;
    loadEvents(): Event[];

    // Settings
    saveSettings(settings: CalendarSettings): void;
    loadSettings(): CalendarSettings;

    // Cache for performance
    cacheEvents(dateRange: DateRange, events: Event[]): void;
    getCachedEvents(dateRange: DateRange): Event[] | null;
}

// Integration interfaces
export interface ModuleIntegration {
    // With tasks
    syncWithTasks(): Promise<void>;
    convertTaskToEvent(task: any): Event;

    // With notes
    createNoteFromEvent(event: Event): any;
    linkEventToNote(eventId: string, noteId: string): void;

    // With tags
    syncTags(calendarTags: string[], globalTags: string[]): string[];
}