import { useState, useCallback, useRef, useEffect } from 'react';
import type { Event, EventFormData, EventCategory, Priority, Reminder, RecurrenceRule } from '../../types/calendar';
import { duplicateEvent } from '../../components/calendar/utils/eventHelpers';

interface UseEventModalProps {
    onCreateEvent?: (formData: EventFormData) => void;
    onUpdateEvent?: (id: string, formData: EventFormData) => void;
    onDeleteEvent?: (id: string) => void;
    onDuplicateEvent?: (event: Event) => void;
}

export const useEventModal = ({ onCreateEvent, onUpdateEvent, onDeleteEvent, onDuplicateEvent }: UseEventModalProps = {}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Form state
    const [formData, setFormData] = useState<EventFormData>({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        isAllDay: false,
        category: 'event',
        priority: 'medium',
        location: '',
        attendees: '',
        reminders: [],
        tags: [],
        color: 'bg-blue-500'
    });

    const titleInputRef = useRef<HTMLInputElement>(null);

    // Focus management
    useEffect(() => {
        if (isOpen && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isOpen]);

    const openModal = useCallback((date?: Date) => {
        setIsOpen(true);
        setIsEditing(false);
        setEditingEventId(null);
        setSelectedDate(date || null);

        // Reset form with default values
        const now = date || new Date();
        const endTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour

        setFormData({
            title: '',
            description: '',
            startDate: now,
            endDate: endTime,
            isAllDay: false,
            category: 'event',
            priority: 'medium',
            location: '',
            attendees: '',
            reminders: [],
            tags: [],
            color: 'bg-blue-500'
        });
    }, []);

    const openEditModal = useCallback((event: Event) => {
        setIsOpen(true);
        setIsEditing(true);
        setEditingEventId(event.id);
        setSelectedDate(event.startDate);

        setFormData({
            title: event.title,
            description: event.description || '',
            startDate: event.startDate,
            endDate: event.endDate,
            isAllDay: event.isAllDay,
            category: event.category,
            priority: event.priority,
            location: event.location || '',
            attendees: event.attendees.map(a => a.name).join(', '),
            reminders: event.reminders,
            tags: event.tags,
            color: event.color
        });
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setIsEditing(false);
        setEditingEventId(null);
        setSelectedDate(null);

        // Reset form
        setFormData({
            title: '',
            description: '',
            startDate: new Date(),
            endDate: new Date(),
            isAllDay: false,
            category: 'event',
            priority: 'medium',
            location: '',
            attendees: '',
            reminders: [],
            tags: [],
            color: 'bg-blue-500'
        });
    }, []);

    const updateFormField = useCallback(<K extends keyof EventFormData>(
        field: K,
        value: EventFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSave = useCallback(() => {
        if (!formData.title.trim()) {
            // Focus title field if empty
            titleInputRef.current?.focus();
            return;
        }

        if (isEditing && editingEventId) {
            onUpdateEvent?.(editingEventId, formData);
        } else {
            onCreateEvent?.(formData);
        }

        closeModal();
    }, [formData, isEditing, editingEventId, onCreateEvent, onUpdateEvent, closeModal]);

    const handleDelete = useCallback(() => {
        if (editingEventId) {
            onDeleteEvent?.(editingEventId);
            closeModal();
        }
    }, [editingEventId, onDeleteEvent, closeModal]);

    const handleCancel = useCallback(() => {
        closeModal();
    }, [closeModal]);

    const validateForm = useCallback((): string[] => {
        const errors: string[] = [];

        if (!formData.title.trim()) {
            errors.push('O título é obrigatório');
        }

        if (formData.startDate >= formData.endDate) {
            errors.push('A data de início deve ser anterior à data de término');
        }

        return errors;
    }, [formData]);

    const isValid = useCallback(() => {
        return validateForm().length === 0;
    }, [validateForm]);

    // Quick setters for common operations
    const setTitle = useCallback((title: string) => {
        updateFormField('title', title);
    }, [updateFormField]);

    const setDescription = useCallback((description: string) => {
        updateFormField('description', description);
    }, [updateFormField]);

    const setStartDate = useCallback((date: Date) => {
        updateFormField('startDate', date);
        // Auto-adjust end date if it's before start date
        if (date >= formData.endDate) {
            const newEndDate = new Date(date.getTime() + 60 * 60 * 1000); // +1 hour
            updateFormField('endDate', newEndDate);
        }
    }, [updateFormField, formData.endDate]);

    const setEndDate = useCallback((date: Date) => {
        updateFormField('endDate', date);
    }, [updateFormField]);

    const setCategory = useCallback((category: EventCategory) => {
        updateFormField('category', category);
    }, [updateFormField]);

    const setPriority = useCallback((priority: Priority) => {
        updateFormField('priority', priority);
    }, [updateFormField]);

    const setLocation = useCallback((location: string) => {
        updateFormField('location', location);
    }, [updateFormField]);

    const setAttendees = useCallback((attendees: string) => {
        updateFormField('attendees', attendees);
    }, [updateFormField]);

    const setColor = useCallback((color: string) => {
        updateFormField('color', color);
    }, [updateFormField]);

    const setIsAllDay = useCallback((isAllDay: boolean) => {
        updateFormField('isAllDay', isAllDay);

        // Adjust times for all-day events
        if (isAllDay) {
            const start = new Date(formData.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(formData.startDate);
            end.setHours(23, 59, 59, 999);

            updateFormField('startDate', start);
            updateFormField('endDate', end);
        }
    }, [updateFormField, formData.startDate]);

    const setTags = useCallback((tags: string[]) => {
        updateFormField('tags', tags);
    }, [updateFormField]);

    const setReminders = useCallback((reminders: Reminder[]) => {
        updateFormField('reminders', reminders);
    }, [updateFormField]);

    const setRecurrence = useCallback((recurrence?: RecurrenceRule) => {
        updateFormField('recurrence', recurrence);
    }, [updateFormField]);

    const handleDuplicate = useCallback(() => {
        if (isEditing && editingEventId) {
            // Create a temporary event from form data for duplication
            const tempEvent: Event = {
                id: editingEventId,
                title: formData.title,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate,
                isAllDay: formData.isAllDay,
                category: formData.category,
                priority: formData.priority,
                location: formData.location,
                attendees: formData.attendees
                    .split(',')
                    .map(name => name.trim())
                    .filter(name => name)
                    .map((name, index) => ({
                        id: `attendee_${Date.now()}_${index}`,
                        name,
                        confirmed: false
                    })),
                recurrence: formData.recurrence,
                reminders: formData.reminders,
                attachments: [],
                tags: formData.tags,
                color: formData.color,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'current-user'
            };

            const duplicatedEvent = duplicateEvent(tempEvent);
            onDuplicateEvent?.(duplicatedEvent);
            closeModal();
        }
    }, [isEditing, editingEventId, formData, onDuplicateEvent, closeModal]);

    return {
        // Modal state
        isOpen,
        isEditing,
        editingEventId,
        selectedDate,

        // Form data
        formData,
        titleInputRef,

        // Modal actions
        openModal,
        openEditModal,
        closeModal,

        // Form actions
        handleSave,
        handleDelete,
        handleCancel,
        updateFormField,

        // Validation
        validateForm,
        isValid,

        // Quick setters
        setTitle,
        setDescription,
        setStartDate,
        setEndDate,
        setCategory,
        setPriority,
        setLocation,
        setAttendees,
        setColor,
        setIsAllDay,
        setTags,
        setReminders,
        setRecurrence,
        handleDuplicate
    };
};