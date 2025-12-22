const { renderHook, act, waitFor } = require('@testing-library/react');
const { describe, it, expect, beforeEach } = require('@jest/globals');

// Mock do supabaseService
const mockEventsService = {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

jest.mock('../services/supabaseService', () => ({
    eventsService: mockEventsService,
}));

// Mock do storageService
jest.mock('../components/calendar/utils/storageHelpers', () => ({
    storageService: {
        loadEvents: jest.fn(),
        saveEvents: jest.fn(),
    },
}));

// Mock do eventHelpers
jest.mock('../components/calendar/utils/eventHelpers', () => ({
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    duplicateEvent: jest.fn(),
}));

const { storageService } = require('../components/calendar/utils/storageHelpers');
const { createEvent, updateEvent, duplicateEvent } = require('../components/calendar/utils/eventHelpers');

const mockStorageService = jest.mocked(storageService);
const mockCreateEvent = jest.mocked(createEvent);
const mockUpdateEvent = jest.mocked(updateEvent);
const mockDuplicateEvent = jest.mocked(duplicateEvent);

describe('useCalendarEvents', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockStorageService.loadEvents.mockReturnValue([]);
        mockStorageService.saveEvents.mockImplementation(() => { });

        // Configurar o mock do eventsService
        mockEventsService.getAll.mockResolvedValue({ data: [], error: null });
        mockEventsService.create.mockResolvedValue({
            data: {
                id: 'new-event',
                title: 'New Event',
                start_date: '2025-01-15T14:00:00.000Z',
                end_date: '2025-01-15T15:00:00.000Z',
                created_at: '2025-01-15T10:00:00.000Z',
                updated_at: '2025-01-15T10:00:00.000Z',
                user_id: 'current-user',
            },
            error: null
        });
        mockEventsService.update.mockResolvedValue({
            data: {
                id: 'test-event-1',
                title: 'Updated Event',
                start_date: '2025-01-15T14:00:00.000Z',
                end_date: '2025-01-15T15:00:00.000Z',
                created_at: '2025-01-15T10:00:00.000Z',
                updated_at: '2025-01-15T10:00:00.000Z',
                user_id: 'current-user',
            },
            error: null
        });
        mockEventsService.delete.mockResolvedValue({ success: true, error: null });

        // Mock do createEvent
        mockCreateEvent.mockImplementation((
            title,
            startDate,
            endDate,
            category,
            options = {}
        ) => ({
            id: 'new-event-id',
            title,
            startDate,
            endDate,
            category,
            isAllDay: options.isAllDay || false,
            priority: options.priority || 'medium',
            location: options.location || '',
            attendees: options.attendees || [],
            reminders: [],
            attachments: [],
            tags: options.tags || [],
            color: options.color || 'bg-blue-500',
            description: options.description || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'current-user',
        }));

        // Mock do updateEvent
        mockUpdateEvent.mockImplementation((event, updates) => ({
            ...event,
            ...updates,
            updatedAt: new Date(),
        }));

        // Mock do duplicateEvent
        mockDuplicateEvent.mockImplementation((event, newStartDate) => ({
            ...event,
            id: 'duplicated-event-id',
            startDate: newStartDate || event.startDate,
            endDate: newStartDate ? new Date(newStartDate.getTime() + (event.endDate.getTime() - event.startDate.getTime())) : event.endDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
    });

    it('deve carregar eventos do storage ao montar', async () => {
        const mockEvents = [
            {
                id: '1',
                title: 'Test Event',
                startDate: new Date('2025-01-15T10:00:00'),
                endDate: new Date('2025-01-15T11:00:00'),
                isAllDay: false,
                category: 'meeting',
                priority: 'medium',
                attendees: [],
                reminders: [],
                attachments: [],
                tags: [],
                color: 'bg-blue-500',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'current-user',
            },
        ];

        mockStorageService.loadEvents.mockReturnValue(mockEvents);

        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(mockStorageService.loadEvents).toHaveBeenCalledTimes(1);
        expect(result.current.events).toEqual(mockEvents);
    });

    it('deve usar eventos mock quando não há eventos no storage', async () => {
        mockStorageService.loadEvents.mockReturnValue([]);

        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.events.length).toBeGreaterThan(0);
        expect(mockStorageService.saveEvents).toHaveBeenCalled();
    });

    it('deve adicionar um novo evento', async () => {
        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const newEvent = {
            id: 'new-event',
            title: 'New Event',
            startDate: new Date('2025-01-15T10:00:00'),
            endDate: new Date('2025-01-15T11:00:00'),
            isAllDay: false,
            category: 'meeting',
            priority: 'medium',
            attendees: [],
            reminders: [],
            attachments: [],
            tags: [],
            color: 'bg-blue-500',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'current-user',
        };

        act(() => {
            result.current.addEvent(newEvent);
        });

        expect(result.current.events).toContain(newEvent);
        expect(mockStorageService.saveEvents).toHaveBeenCalled();
    });

    it('deve adicionar evento a partir de formulário', async () => {
        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const formData = {
            title: 'Form Event',
            description: 'Description',
            startDate: new Date('2025-01-15T10:00:00'),
            endDate: new Date('2025-01-15T11:00:00'),
            isAllDay: false,
            category: 'meeting',
            priority: 'high',
            location: 'Location',
            attendees: 'John, Sarah',
            reminders: [],
            tags: ['tag1', 'tag2'],
            color: 'bg-green-500',
        };

        act(() => {
            result.current.addEventFromForm(formData);
        });

        expect(mockCreateEvent).toHaveBeenCalledWith(
            formData.title,
            formData.startDate,
            formData.endDate,
            formData.category,
            {
                description: formData.description,
                isAllDay: formData.isAllDay,
                priority: formData.priority,
                location: formData.location,
                attendees: [
                    { id: expect.stringContaining('attendee_'), name: 'John', confirmed: false },
                    { id: expect.stringContaining('attendee_'), name: 'Sarah', confirmed: false },
                ],
                tags: formData.tags,
                color: formData.color,
            }
        );
    });

    it('deve atualizar um evento existente', async () => {
        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const eventId = result.current.events[0]?.id;
        if (!eventId) throw new Error('No event found for testing');

        const updates = {
            title: 'Updated Event',
            priority: 'high',
        };

        act(() => {
            result.current.updateEvent(eventId, updates);
        });

        expect(mockUpdateEvent).toHaveBeenCalledWith(
            expect.objectContaining({ id: eventId }),
            updates
        );
    });

    it('deve deletar um evento', async () => {
        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const initialEventCount = result.current.events.length;
        const eventId = result.current.events[0]?.id;
        if (!eventId) throw new Error('No event found for testing');

        act(() => {
            result.current.deleteEvent(eventId);
        });

        expect(result.current.events.length).toBe(initialEventCount - 1);
        expect(result.current.events.find(e => e.id === eventId)).toBeUndefined();
    });

    it('deve duplicar um evento', async () => {
        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const eventId = result.current.events[0]?.id;
        if (!eventId) throw new Error('No event found for testing');

        const newStartDate = new Date('2025-01-20T10:00:00');

        act(() => {
            result.current.duplicateEvent(eventId, newStartDate);
        });

        expect(mockDuplicateEvent).toHaveBeenCalledWith(
            expect.objectContaining({ id: eventId }),
            newStartDate
        );
    });

    it('deve limpar todos os eventos', async () => {
        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.events.length).toBeGreaterThan(0);

        act(() => {
            result.current.clearAllEvents();
        });

        expect(result.current.events.length).toBe(0);
        expect(mockStorageService.saveEvents).toHaveBeenCalledWith([]);
    });

    it('deve importar eventos', async () => {
        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const importedEvents = [
            {
                id: 'imported-1',
                title: 'Imported Event',
                startDate: new Date('2025-01-15T10:00:00'),
                endDate: new Date('2025-01-15T11:00:00'),
                isAllDay: false,
                category: 'meeting',
                priority: 'medium',
                attendees: [],
                reminders: [],
                attachments: [],
                tags: [],
                color: 'bg-blue-500',
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'current-user',
            },
        ];

        act(() => {
            result.current.importEvents(importedEvents);
        });

        expect(result.current.events).toEqual(importedEvents);
        expect(mockStorageService.saveEvents).toHaveBeenCalledWith(importedEvents);
    });

    it('deve obter evento por ID', async () => {
        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const eventId = result.current.events[0]?.id;
        if (!eventId) throw new Error('No event found for testing');

        const event = result.current.getEventById(eventId);

        expect(event).toEqual(result.current.events[0]);
    });

    it('deve retornar undefined para ID não encontrado', async () => {
        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const event = result.current.getEventById('non-existent-id');

        expect(event).toBeUndefined();
    });

    it('deve tratar erros ao carregar eventos', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        mockStorageService.loadEvents.mockImplementation(() => {
            throw new Error('Storage error');
        });

        const { result } = renderHook(() => require('../hooks/calendar/useCalendarEvents').useCalendarEvents());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(consoleSpy).toHaveBeenCalledWith('Error loading events:', expect.any(Error));
        expect(result.current.events.length).toBeGreaterThan(0); // Deve usar eventos mock

        consoleSpy.mockRestore();
    });
});