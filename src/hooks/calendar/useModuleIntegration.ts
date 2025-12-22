import { useState, useCallback, useEffect } from 'react';
import type { Event } from '../../types/calendar';
import {
    convertTaskToEvent,
    convertEventToTask,
    createNoteFromEvent,
    linkEventToNote,
    syncTags,
    syncTaskWithEvent,
    batchConvertTasksToEvents,
    batchConvertEventsToTasks,
    batchCreateNotesFromEvents,
    getTaskEventAnalytics,
    type Task,
    type Note
} from '../../services/moduleIntegrationService';

interface UseModuleIntegrationProps {
    events: Event[];
    onEventAdd?: (event: Event) => void;
    onEventUpdate?: (id: string, updates: Partial<Event>) => void;
}

export const useModuleIntegration = ({
    events,
    onEventAdd,
    onEventUpdate
}: UseModuleIntegrationProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    // Monitor online/offline status
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

    // Load tasks and notes from localStorage
    useEffect(() => {
        try {
            const storedTasks = localStorage.getItem('maxnote_tasks');
            if (storedTasks) {
                const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
                    ...task,
                    dueDate: task.dueDate ? new Date(task.dueDate) : undefined
                }));
                setTasks(parsedTasks);
            }

            const storedNotes = localStorage.getItem('maxnote_notes');
            if (storedNotes) {
                const parsedNotes = JSON.parse(storedNotes).map((note: any) => ({
                    ...note,
                    createdAt: new Date(note.createdAt),
                    updatedAt: new Date(note.updatedAt)
                }));
                setNotes(parsedNotes);
            }
        } catch (error) {
            console.error('Error loading tasks and notes:', error);
        }
    }, []);

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        if (tasks.length > 0) {
            localStorage.setItem('maxnote_tasks', JSON.stringify(tasks));
        }
    }, [tasks]);

    // Save notes to localStorage whenever they change
    useEffect(() => {
        if (notes.length > 0) {
            localStorage.setItem('maxnote_notes', JSON.stringify(notes));
        }
    }, [notes]);

    // Convert task to event
    const convertTaskToEventAndAdd = useCallback((task: Task) => {
        const event = convertTaskToEvent(task);
        if (onEventAdd) {
            onEventAdd(event);
        }
        return event;
    }, [onEventAdd]);

    // Convert event to task
    const convertEventToTaskAndAdd = useCallback((event: Event) => {
        const task = convertEventToTask(event);
        setTasks(prevTasks => [...prevTasks, task]);
        return task;
    }, []);

    // Create note from event
    const createNoteFromEventAndAdd = useCallback((event: Event) => {
        const note = createNoteFromEvent(event);
        setNotes(prevNotes => [...prevNotes, note]);

        // Link event to note
        const link = linkEventToNote(event.id, note.id);

        // Store link information
        const links = JSON.parse(localStorage.getItem('maxnote_event_note_links') || '[]');
        links.push(link);
        localStorage.setItem('maxnote_event_note_links', JSON.stringify(links));

        return note;
    }, []);

    // Sync task with event
    const syncTaskWithEventById = useCallback((taskId: string, eventId: string) => {
        const task = tasks.find(t => t.id === taskId);
        const event = events.find(e => e.id === eventId);

        if (!task || !event) return null;

        const { task: updatedTask, event: updatedEvent } = syncTaskWithEvent(task, event);

        // Update task
        setTasks(prevTasks =>
            prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );

        // Update event
        if (onEventUpdate) {
            onEventUpdate(eventId, updatedEvent);
        }

        return { task: updatedTask, event: updatedEvent };
    }, [tasks, events, onEventUpdate]);

    // Sync tags between modules
    const syncAllTags = useCallback(() => {
        const calendarTags = events.flatMap(event => event.tags);
        const taskTags = tasks.flatMap(task => task.tags);
        const noteTags = notes.flatMap(note => note.tags);

        const allTags = [...calendarTags, ...taskTags, ...noteTags];
        const uniqueTags = [...new Set(allTags)];

        // Update global tags in localStorage
        localStorage.setItem('maxnote_global_tags', JSON.stringify(uniqueTags));

        return uniqueTags;
    }, [events, tasks, notes]);

    // Batch operations
    const batchConvertAllTasks = useCallback(() => {
        const newEvents = batchConvertTasksToEvents(tasks);
        newEvents.forEach(event => {
            if (onEventAdd) {
                onEventAdd(event);
            }
        });
        return newEvents;
    }, [tasks, onEventAdd]);

    const batchConvertAllTaskEvents = useCallback(() => {
        const taskEvents = events.filter(event => event.category === 'task');
        const newTasks = batchConvertEventsToTasks(taskEvents);
        setTasks(prevTasks => [...prevTasks, ...newTasks]);
        return newTasks;
    }, [events]);

    const batchCreateNotesFromAllEvents = useCallback(() => {
        const newNotes = batchCreateNotesFromEvents(events);
        setNotes(prevNotes => [...prevNotes, ...newNotes]);
        return newNotes;
    }, [events]);

    // Get analytics
    const getAnalytics = useCallback(() => {
        return getTaskEventAnalytics(tasks, events);
    }, [tasks, events]);

    // Auto-sync when online
    useEffect(() => {
        if (isOnline && syncStatus === 'idle') {
            setSyncStatus('syncing');

            try {
                // Sync all tags
                syncAllTags();

                // Update last sync time
                setLastSyncTime(new Date());
                setSyncStatus('idle');
            } catch (error) {
                console.error('Error during sync:', error);
                setSyncStatus('error');
            }
        }
    }, [isOnline, syncStatus, syncAllTags]);

    // Get linked notes for an event
    const getLinkedNotes = useCallback((eventId: string) => {
        try {
            const links = JSON.parse(localStorage.getItem('maxnote_event_note_links') || '[]');
            const eventLinks = links.filter((link: any) => link.eventId === eventId);
            return notes.filter(note => eventLinks.some((link: any) => link.noteId === note.id));
        } catch (error) {
            console.error('Error getting linked notes:', error);
            return [];
        }
    }, [notes]);

    // Get linked events for a note
    const getLinkedEvents = useCallback((noteId: string) => {
        try {
            const links = JSON.parse(localStorage.getItem('maxnote_event_note_links') || '[]');
            const noteLinks = links.filter((link: any) => link.noteId === noteId);
            return events.filter(event => noteLinks.some((link: any) => link.eventId === event.id));
        } catch (error) {
            console.error('Error getting linked events:', error);
            return [];
        }
    }, [events]);

    return {
        // State
        tasks,
        notes,
        isOnline,
        syncStatus,
        lastSyncTime,

        // Conversion functions
        convertTaskToEventAndAdd,
        convertEventToTaskAndAdd,
        createNoteFromEventAndAdd,

        // Sync functions
        syncTaskWithEventById,
        syncAllTags,

        // Batch operations
        batchConvertAllTasks,
        batchConvertAllTaskEvents,
        batchCreateNotesFromAllEvents,

        // Analytics
        getAnalytics,

        // Link functions
        getLinkedNotes,
        getLinkedEvents,

        // Utility functions
        setTasks,
        setNotes,
    };
};