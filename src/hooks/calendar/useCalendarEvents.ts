import { useState, useEffect, useCallback } from 'react';
import type { Event, EventFormData } from '../../types/calendar';
import { eventsService, type CalendarEvent as SupabaseEvent } from '../../services/supabaseService';
import { createEvent, duplicateEvent } from '../../components/calendar/utils/eventHelpers';

// Map Supabase event to local Event type
const mapSupabaseEvent = (event: SupabaseEvent): Event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: new Date(event.start_date),
    endDate: new Date(event.end_date),
    isAllDay: event.all_day,
    category: 'event',
    priority: 'medium',
    location: event.location || '',
    attendees: [],
    reminders: event.reminder ? [{ id: '1', minutesBefore: event.reminder, type: 'notification', enabled: true }] : [],
    attachments: [],
    tags: [],
    color: event.color || 'bg-blue-500',
    createdAt: new Date(event.created_at),
    updatedAt: new Date(event.updated_at),
    createdBy: event.user_id,
    recurrence: event.recurrence ? {
        id: '1',
        frequency: event.recurrence as 'daily' | 'weekly' | 'monthly' | 'yearly',
        interval: 1
    } : undefined,
});

// Map local Event to Supabase format
const mapEventToSupabase = (event: Event): Partial<SupabaseEvent> => ({
    title: event.title,
    description: event.description,
    start_date: event.startDate.toISOString(),
    end_date: event.endDate.toISOString(),
    all_day: event.isAllDay,
    location: event.location,
    color: event.color,
    reminder: event.reminders && event.reminders.length > 0 ? event.reminders[0].minutesBefore : null,
    recurrence: event.recurrence?.frequency,
});

export const useCalendarEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load events from Supabase
    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await eventsService.getAll();
            if (error) {
                setError(error);
                setEvents([]);
            } else if (data) {
                setEvents(data.map(mapSupabaseEvent));
            }
        } catch (err) {
            console.error('Error loading events:', err);
            setError('Erro ao carregar eventos');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const createEventFromForm = useCallback((formData: EventFormData): Event => {
        const attendees = formData.attendees
            .split(',')
            .map(name => name.trim())
            .filter(name => name)
            .map((name, index) => ({
                id: `attendee_${Date.now()}_${index}`,
                name,
                confirmed: false
            }));

        return createEvent(
            formData.title,
            formData.startDate,
            formData.endDate,
            formData.category,
            {
                description: formData.description,
                isAllDay: formData.isAllDay,
                priority: formData.priority,
                location: formData.location,
                attendees,
                tags: formData.tags,
                color: formData.color
            }
        );
    }, []);

    const addEvent = useCallback(async (event: Event) => {
        try {
            const eventData = {
                title: event.title,
                description: event.description || '',
                start_date: event.startDate.toISOString(),
                end_date: event.endDate.toISOString(),
                all_day: event.isAllDay,
                location: event.location || null,
                color: event.color,
                reminder: event.reminders && event.reminders.length > 0 ? event.reminders[0].minutesBefore : null,
                recurrence: event.recurrence?.frequency || null,
            };
            const { data, error } = await eventsService.create(eventData);
            if (error) {
                setError(error);
            } else if (data) {
                setEvents(prevEvents => [...prevEvents, mapSupabaseEvent(data)]);
                return mapSupabaseEvent(data);
            }
        } catch (err) {
            console.error('Error adding event:', err);
            setError('Erro ao criar evento');
        }
        return null;
    }, []);

    const addEventFromForm = useCallback(async (formData: EventFormData) => {
        const newEvent = createEventFromForm(formData);
        return await addEvent(newEvent);
    }, [createEventFromForm, addEvent]);

    const updateEventById = useCallback(async (id: string, updates: Partial<Event>) => {
        try {
            const { data, error } = await eventsService.update(id, mapEventToSupabase(updates as Event));
            if (error) {
                setError(error);
            } else if (data) {
                setEvents(prevEvents =>
                    prevEvents.map(event =>
                        event.id === id ? mapSupabaseEvent(data) : event
                    )
                );
            }
        } catch (err) {
            console.error('Error updating event:', err);
            setError('Erro ao atualizar evento');
        }
    }, []);

    const deleteEventById = useCallback(async (id: string) => {
        try {
            const { success, error } = await eventsService.delete(id);
            if (error) {
                setError(error);
            } else if (success) {
                setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
            }
        } catch (err) {
            console.error('Error deleting event:', err);
            setError('Erro ao excluir evento');
        }
    }, []);

    const duplicateEventById = useCallback(async (id: string, newStartDate?: Date) => {
        const eventToDuplicate = events.find(e => e.id === id);
        if (eventToDuplicate) {
            const duplicatedEvent = duplicateEvent(eventToDuplicate, newStartDate);
            return await addEvent(duplicatedEvent);
        }
        return null;
    }, [events, addEvent]);

    const getEventById = useCallback((id: string): Event | undefined => {
        return events.find(event => event.id === id);
    }, [events]);

    const clearAllEvents = useCallback(async () => {
        // Delete all events from Supabase
        for (const event of events) {
            await eventsService.delete(event.id);
        }
        setEvents([]);
    }, [events]);

    const importEvents = useCallback(async (importedEvents: Event[]) => {
        // Clear existing events and create new ones
        await clearAllEvents();
        for (const event of importedEvents) {
            await addEvent(event);
        }
    }, [clearAllEvents, addEvent]);

    return {
        events,
        loading,
        error,
        addEvent,
        addEventFromForm,
        updateEvent: updateEventById,
        deleteEvent: deleteEventById,
        duplicateEvent: duplicateEventById,
        getEventById,
        clearAllEvents,
        importEvents,
        createEventFromForm,
        refreshEvents: loadEvents,
    };
};