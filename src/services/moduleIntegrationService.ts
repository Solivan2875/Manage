import type { Event } from '../types/calendar';

// Interfaces for Task and Note (based on the existing implementations)
export interface Task {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    tags: string[];
    subtasks?: Task[];
}

export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    isPinned: boolean;
}

// Event-Task conversion
export const convertTaskToEvent = (task: Task): Event => {
    const startDate = task.dueDate || new Date();
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration

    return {
        id: `event_from_task_${task.id}`,
        title: task.title,
        description: task.description,
        startDate,
        endDate,
        isAllDay: false,
        category: 'task',
        priority: task.priority as 'low' | 'medium' | 'high',
        location: '',
        attendees: [],
        reminders: task.dueDate ? [{
            id: `reminder_${task.id}`,
            minutesBefore: 60,
            type: 'notification',
            enabled: true
        }] : [],
        attachments: [],
        tags: [...task.tags, 'from-task'],
        color: getEventColorFromPriority(task.priority),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user'
    };
};

export const convertEventToTask = (event: Event): Task => {
    return {
        id: `task_from_event_${event.id}`,
        title: event.title,
        description: event.description,
        completed: false,
        priority: event.priority === 'urgent' ? 'high' : event.priority,
        dueDate: event.startDate,
        tags: event.tags.filter(tag => tag !== 'from-task'),
        subtasks: []
    };
};

// Event-Note conversion
export const createNoteFromEvent = (event: Event): Note => {
    const eventSummary = generateEventSummary(event);

    return {
        id: `note_from_event_${event.id}`,
        title: `Nota: ${event.title}`,
        content: eventSummary,
        tags: [...event.tags, 'evento'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPinned: event.priority === 'high'
    };
};

// Link bidirectional between events and notes
export const linkEventToNote = (eventId: string, noteId: string) => {
    // This would typically update both the event and note in storage
    // For now, we'll just return the link information
    return {
        eventId,
        noteId,
        linkType: 'related',
        createdAt: new Date()
    };
};

// Tag synchronization
export const syncTags = (calendarTags: string[], globalTags: string[]): string[] => {
    const mergedTags = [...new Set([...globalTags, ...calendarTags])];
    return mergedTags;
};

// Task-Event synchronization
export const syncTaskWithEvent = (task: Task, event: Event): { task: Task; event: Event } => {
    // Update task from event
    const updatedTask: Task = {
        ...task,
        title: event.title,
        description: event.description,
        priority: event.priority === 'urgent' ? 'high' : event.priority,
        dueDate: event.startDate,
        tags: event.tags.filter(tag => tag !== 'from-task')
    };

    // Update event from task
    const updatedEvent: Event = {
        ...event,
        title: task.title,
        description: task.description,
        priority: task.priority,
        startDate: task.dueDate || event.startDate,
        endDate: task.dueDate ? new Date(task.dueDate.getTime() + 60 * 60 * 1000) : event.endDate,
        tags: [...task.tags, 'from-task']
    };

    return { task: updatedTask, event: updatedEvent };
};

// Helper functions
const getEventColorFromPriority = (priority: 'low' | 'medium' | 'high'): string => {
    switch (priority) {
        case 'high':
            return 'bg-red-500';
        case 'medium':
            return 'bg-yellow-500';
        case 'low':
            return 'bg-green-500';
        default:
            return 'bg-blue-500';
    }
};

const generateEventSummary = (event: Event): string => {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    let summary = `# ${event.title}\n\n`;

    if (event.description) {
        summary += `**Descrição:** ${event.description}\n\n`;
    }

    summary += `**Data e Hora:** ${formatDate(event.startDate)}\n`;

    if (!event.isAllDay && event.endDate) {
        summary += `**Término:** ${formatDate(event.endDate)}\n`;
    }

    if (event.location) {
        summary += `**Local:** ${event.location}\n`;
    }

    if (event.category) {
        summary += `**Categoria:** ${event.category}\n`;
    }

    if (event.priority) {
        summary += `**Prioridade:** ${event.priority}\n`;
    }

    if (event.attendees && event.attendees.length > 0) {
        summary += `**Participantes:** ${event.attendees.map(a => a.name).join(', ')}\n`;
    }

    if (event.tags && event.tags.length > 0) {
        summary += `**Tags:** ${event.tags.join(', ')}\n`;
    }

    summary += `\n---\n*Esta nota foi gerada automaticamente a partir de um evento do calendário.*`;

    return summary;
};

// Batch operations
export const batchConvertTasksToEvents = (tasks: Task[]): Event[] => {
    return tasks.map(task => convertTaskToEvent(task));
};

export const batchConvertEventsToTasks = (events: Event[]): Task[] => {
    return events
        .filter(event => event.category === 'task')
        .map(event => convertEventToTask(event));
};

export const batchCreateNotesFromEvents = (events: Event[]): Note[] => {
    return events.map(event => createNoteFromEvent(event));
};

// Analytics integration
export const getTaskEventAnalytics = (tasks: Task[], events: Event[]) => {
    const taskEvents = events.filter(event => event.category === 'task');
    const completedTasks = tasks.filter(task => task.completed);
    const overdueTasks = tasks.filter(task =>
        task.dueDate && task.dueDate < new Date() && !task.completed
    );

    return {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        taskEvents: taskEvents.length,
        completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
        upcomingTasks: tasks.filter(task =>
            task.dueDate && task.dueDate >= new Date() && !task.completed
        ).length
    };
};