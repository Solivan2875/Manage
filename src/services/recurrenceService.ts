import type { Event, RecurrenceRule } from '../types/calendar';

export interface RecurrenceException {
    id: string;
    originalEventId: string;
    originalDate: Date;
    modifiedEvent?: Event;
    isDeleted: boolean;
    reason?: string;
}

export interface RecurrencePattern {
    id: string;
    rule: RecurrenceRule;
    startDate: Date;
    endDate?: Date;
    exceptions: RecurrenceException[];
}

class RecurrenceService {
    private patterns: Map<string, RecurrencePattern> = new Map();

    constructor() {
        this.loadPatterns();
    }

    // Load patterns from localStorage
    private loadPatterns() {
        try {
            const stored = localStorage.getItem('maxnote_recurrence_patterns');
            if (stored) {
                const patternsData = JSON.parse(stored);
                patternsData.forEach((pattern: any) => {
                    this.patterns.set(pattern.id, {
                        ...pattern,
                        startDate: new Date(pattern.startDate),
                        endDate: pattern.endDate ? new Date(pattern.endDate) : undefined,
                        exceptions: pattern.exceptions.map((exc: any) => ({
                            ...exc,
                            originalDate: new Date(exc.originalDate)
                        }))
                    });
                });
            }
        } catch (error) {
            console.error('Error loading recurrence patterns:', error);
        }
    }

    // Save patterns to localStorage
    private savePatterns() {
        try {
            const patternsData = Array.from(this.patterns.values());
            localStorage.setItem('maxnote_recurrence_patterns', JSON.stringify(patternsData));
        } catch (error) {
            console.error('Error saving recurrence patterns:', error);
        }
    }

    // Create a new recurrence pattern
    public createPattern(event: Event, rule: RecurrenceRule): RecurrencePattern {
        const pattern: RecurrencePattern = {
            id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            rule,
            startDate: event.startDate,
            endDate: rule.endDate,
            exceptions: []
        };

        this.patterns.set(pattern.id, pattern);
        this.savePatterns();
        return pattern;
    }

    // Update a recurrence pattern
    public updatePattern(patternId: string, updates: Partial<RecurrencePattern>): boolean {
        const pattern = this.patterns.get(patternId);
        if (!pattern) return false;

        const updatedPattern = { ...pattern, ...updates };
        this.patterns.set(patternId, updatedPattern);
        this.savePatterns();
        return true;
    }

    // Delete a recurrence pattern
    public deletePattern(patternId: string): boolean {
        const deleted = this.patterns.delete(patternId);
        if (deleted) {
            this.savePatterns();
        }
        return deleted;
    }

    // Get a pattern by ID
    public getPattern(patternId: string): RecurrencePattern | undefined {
        return this.patterns.get(patternId);
    }

    // Get all patterns
    public getAllPatterns(): RecurrencePattern[] {
        return Array.from(this.patterns.values());
    }

    // Generate recurring events for a date range
    public generateRecurringEvents(
        patternId: string,
        startDate: Date,
        endDate: Date,
        baseEvent: Event
    ): Event[] {
        const pattern = this.patterns.get(patternId);
        if (!pattern) return [];

        const events: Event[] = [];
        const currentDate = new Date(pattern.startDate);

        // Don't generate events before the start date
        if (currentDate > endDate) return events;

        // Generate events based on the recurrence rule
        while (currentDate <= endDate) {
            // Check if this date is within the pattern's end date
            if (pattern.endDate && currentDate > pattern.endDate) break;

            // Check for exceptions
            const isException = pattern.exceptions.some(exc =>
                this.isSameDay(exc.originalDate, currentDate) &&
                (exc.isDeleted || exc.modifiedEvent)
            );

            if (!isException) {
                // Create a new event instance
                const eventInstance = this.createEventInstance(baseEvent, currentDate, patternId);
                events.push(eventInstance);
            } else {
                // Check if there's a modified event for this date
                const modifiedException = pattern.exceptions.find(exc =>
                    this.isSameDay(exc.originalDate, currentDate) &&
                    exc.modifiedEvent
                );

                if (modifiedException && modifiedException.modifiedEvent) {
                    events.push(modifiedException.modifiedEvent);
                }
            }

            // Move to next occurrence
            this.getNextOccurrence(currentDate, pattern.rule);
        }

        return events;
    }

    // Create an event instance from a base event and date
    private createEventInstance(baseEvent: Event, date: Date, patternId: string): Event {
        const duration = baseEvent.endDate.getTime() - baseEvent.startDate.getTime();

        return {
            ...baseEvent,
            id: `${baseEvent.id}_${date.getTime()}`,
            startDate: new Date(date),
            endDate: new Date(date.getTime() + duration),
            recurrence: {
                ...baseEvent.recurrence,
                frequency: baseEvent.recurrence?.frequency || 'daily',
                interval: baseEvent.recurrence?.interval || 1,
                id: patternId
            }
        };
    }

    // Calculate the next occurrence date
    private getNextOccurrence(currentDate: Date, rule: RecurrenceRule): Date {
        const next = new Date(currentDate);

        switch (rule.frequency) {
            case 'daily':
                next.setDate(next.getDate() + rule.interval);
                break;

            case 'weekly':
                next.setDate(next.getDate() + (rule.interval * 7));
                break;

            case 'monthly':
                next.setMonth(next.getMonth() + rule.interval);
                if (rule.dayOfMonth) {
                    next.setDate(rule.dayOfMonth);
                }
                break;

            case 'yearly':
                next.setFullYear(next.getFullYear() + rule.interval);
                if (rule.dayOfMonth) {
                    next.setDate(rule.dayOfMonth);
                }
                break;
        }

        return next;
    }

    // Add an exception to a recurrence pattern
    public addException(
        patternId: string,
        originalDate: Date,
        modifiedEvent?: Event,
        isDeleted: boolean = false,
        reason?: string
    ): boolean {
        const pattern = this.patterns.get(patternId);
        if (!pattern) return false;

        // Check if exception already exists
        const existingException = pattern.exceptions.find(exc =>
            this.isSameDay(exc.originalDate, originalDate)
        );

        if (existingException) {
            // Update existing exception
            existingException.modifiedEvent = modifiedEvent;
            existingException.isDeleted = isDeleted;
            existingException.reason = reason;
        } else {
            // Add new exception
            const exception: RecurrenceException = {
                id: `exception_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                originalEventId: patternId,
                originalDate: new Date(originalDate),
                modifiedEvent,
                isDeleted,
                reason
            };
            pattern.exceptions.push(exception);
        }

        this.savePatterns();
        return true;
    }

    // Remove an exception from a recurrence pattern
    public removeException(patternId: string, exceptionId: string): boolean {
        const pattern = this.patterns.get(patternId);
        if (!pattern) return false;

        const initialLength = pattern.exceptions.length;
        pattern.exceptions = pattern.exceptions.filter(exc => exc.id !== exceptionId);

        if (pattern.exceptions.length < initialLength) {
            this.savePatterns();
            return true;
        }

        return false;
    }

    // Check if two dates are the same day
    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    // Get all exceptions for a pattern
    public getExceptions(patternId: string): RecurrenceException[] {
        const pattern = this.patterns.get(patternId);
        return pattern ? pattern.exceptions : [];
    }

    // Get a specific exception
    public getException(patternId: string, exceptionId: string): RecurrenceException | undefined {
        const pattern = this.patterns.get(patternId);
        if (!pattern) return undefined;

        return pattern.exceptions.find(exc => exc.id === exceptionId);
    }

    // Check if a date has an exception
    public hasException(patternId: string, date: Date): boolean {
        const pattern = this.patterns.get(patternId);
        if (!pattern) return false;

        return pattern.exceptions.some(exc => this.isSameDay(exc.originalDate, date));
    }

    // Get the next occurrence after a specific date
    public getNextOccurrenceAfter(patternId: string, afterDate: Date, baseEvent: Event): Date | null {
        const pattern = this.patterns.get(patternId);
        if (!pattern) return null;

        let currentDate = new Date(Math.max(pattern.startDate.getTime(), afterDate.getTime() + 86400000)); // Add 1 day

        const maxIterations = 1000; // Prevent infinite loops
        let iterations = 0;

        while (iterations < maxIterations) {
            // Check if this date is within the pattern's end date
            if (pattern.endDate && currentDate > pattern.endDate) break;

            // Check for exceptions
            const isException = pattern.exceptions.some(exc =>
                this.isSameDay(exc.originalDate, currentDate) &&
                exc.isDeleted
            );

            if (!isException) {
                return currentDate;
            }

            // Move to next occurrence
            this.getNextOccurrence(currentDate, pattern.rule);
            iterations++;
        }

        return null;
    }

    // Get all occurrences within a date range
    public getOccurrencesInRange(
        patternId: string,
        startDate: Date,
        endDate: Date,
        baseEvent: Event
    ): Date[] {
        const pattern = this.patterns.get(patternId);
        if (!pattern) return [];

        const occurrences: Date[] = [];
        let currentDate = new Date(pattern.startDate);

        while (currentDate <= endDate && occurrences.length < 1000) { // Limit to prevent performance issues
            if (currentDate >= startDate) {
                // Check for exceptions
                const isException = pattern.exceptions.some(exc =>
                    this.isSameDay(exc.originalDate, currentDate) &&
                    exc.isDeleted
                );

                if (!isException) {
                    occurrences.push(new Date(currentDate));
                }
            }

            // Move to next occurrence
            this.getNextOccurrence(currentDate, pattern.rule);

            // Check if we've passed the end date
            if (pattern.endDate && currentDate > pattern.endDate) break;
        }

        return occurrences;
    }

    // Convert a recurrence rule to a human-readable string
    public ruleToString(rule: RecurrenceRule): string {
        const frequencyText = {
            daily: 'diariamente',
            weekly: 'semanalmente',
            monthly: 'mensalmente',
            yearly: 'anualmente'
        }[rule.frequency];

        let result = `Repete ${frequencyText}`;

        if (rule.interval > 1) {
            result = `Repete a cada ${rule.interval} ${frequencyText}`;
        }

        if (rule.endDate) {
            result += ` até ${rule.endDate.toLocaleDateString('pt-BR')}`;
        }

        if (rule.count) {
            result += ` por ${rule.count} ocorrências`;
        }

        return result;
    }

    // Validate a recurrence rule
    public validateRule(rule: RecurrenceRule): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!rule.frequency) {
            errors.push('Frequência é obrigatória');
        }

        if (!rule.interval || rule.interval < 1) {
            errors.push('Intervalo deve ser maior que 0');
        }

        if (rule.interval > 999) {
            errors.push('Intervalo não pode ser maior que 999');
        }

        if (rule.count && rule.count < 1) {
            errors.push('Número de ocorrências deve ser maior que 0');
        }

        if (rule.count && rule.count > 999) {
            errors.push('Número de ocorrências não pode ser maior que 999');
        }

        if (rule.dayOfMonth && (rule.dayOfMonth < 1 || rule.dayOfMonth > 31)) {
            errors.push('Dia do mês deve estar entre 1 e 31');
        }

        if (rule.endDate && rule.endDate <= new Date()) {
            errors.push('Data de término deve ser no futuro');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Clean up old patterns
    public cleanup() {
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        for (const [patternId, pattern] of this.patterns) {
            // Remove patterns that ended more than a year ago
            if (pattern.endDate && pattern.endDate < oneYearAgo) {
                this.patterns.delete(patternId);
            }
        }

        this.savePatterns();
    }
}

// Singleton instance
export const recurrenceService = new RecurrenceService();

// Utility functions
export const createRecurrencePattern = (event: Event, rule: RecurrenceRule) => {
    return recurrenceService.createPattern(event, rule);
};

export const generateRecurringEvents = (patternId: string, startDate: Date, endDate: Date, baseEvent: Event) => {
    return recurrenceService.generateRecurringEvents(patternId, startDate, endDate, baseEvent);
};

export const addRecurrenceException = (patternId: string, originalDate: Date, modifiedEvent?: Event, isDeleted?: boolean) => {
    return recurrenceService.addException(patternId, originalDate, modifiedEvent, isDeleted);
};

export const getRecurrenceRuleString = (rule: RecurrenceRule) => {
    return recurrenceService.ruleToString(rule);
};

export const validateRecurrenceRule = (rule: RecurrenceRule) => {
    return recurrenceService.validateRule(rule);
};