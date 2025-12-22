import type { Event, RecurrenceRule } from '../types/calendar';

export interface ImportResult {
    success: boolean;
    events: Event[];
    errors: string[];
    warnings: string[];
    duplicates: number;
    skipped: number;
}

export interface ExportOptions {
    dateRange?: {
        start: Date;
        end: Date;
    };
    categories?: string[];
    includeCompleted?: boolean;
    includeRecurring?: boolean;
}

interface ICSEvent {
    uid: string;
    summary: string;
    description?: string;
    dtstart: Date;
    dtend: Date;
    dtstamp?: Date;
    location?: string;
    categories?: string;
    priority?: number;
    rrule?: string;
    attendees?: string[];
    organizer?: string;
    status?: string;
    class?: string;
    created?: Date;
    lastModified?: Date;
    sequence?: number;
}


class CalendarImportExportService {
    // Parse ICS file content
    public parseICS(content: string): ImportResult {
        const result: ImportResult = {
            success: false,
            events: [],
            errors: [],
            warnings: [],
            duplicates: 0,
            skipped: 0
        };

        try {
            // Split content into lines
            const lines = content.split(/\r?\n/);
            let currentEvent: Partial<ICSEvent> = {};
            let inEvent = false;
            let lineIndex = 0;

            for (const line of lines) {
                lineIndex++;
                const trimmedLine = line.trim();

                // Skip empty lines and comments
                if (!trimmedLine || trimmedLine.startsWith('//')) continue;

                // Event boundaries
                if (trimmedLine === 'BEGIN:VEVENT') {
                    inEvent = true;
                    currentEvent = {};
                    continue;
                }

                if (trimmedLine === 'END:VEVENT') {
                    if (inEvent && currentEvent.uid && currentEvent.summary && currentEvent.dtstart) {
                        try {
                            const event = this.convertICSEventToEvent(currentEvent as ICSEvent);
                            result.events.push(event);
                        } catch (error) {
                            result.errors.push(`Linha ${lineIndex}: Erro ao converter evento - ${error}`);
                            result.skipped++;
                        }
                    } else {
                        result.warnings.push(`Linha ${lineIndex}: Evento incompleto, ignorando`);
                        result.skipped++;
                    }
                    inEvent = false;
                    currentEvent = {};
                    continue;
                }

                if (!inEvent) continue;

                // Parse properties
                const colonIndex = trimmedLine.indexOf(':');
                if (colonIndex === -1) continue;

                const property = trimmedLine.substring(0, colonIndex).toUpperCase();
                let value = trimmedLine.substring(colonIndex + 1);

                // Handle folded lines (continuation)
                if (lines[lineIndex + 1] && lines[lineIndex + 1].startsWith(' ')) {
                    let nextLineIndex = lineIndex + 1;
                    while (nextLineIndex < lines.length && lines[nextLineIndex].startsWith(' ')) {
                        value += lines[nextLineIndex].substring(1);
                        nextLineIndex++;
                    }
                    lineIndex = nextLineIndex - 1;
                }

                // Parse specific properties
                switch (property) {
                    case 'UID':
                        currentEvent.uid = value;
                        break;
                    case 'SUMMARY':
                        currentEvent.summary = this.unescapeICS(value);
                        break;
                    case 'DESCRIPTION':
                        currentEvent.description = this.unescapeICS(value);
                        break;
                    case 'DTSTART':
                        currentEvent.dtstart = this.parseICSDate(value);
                        break;
                    case 'DTEND':
                        currentEvent.dtend = this.parseICSDate(value);
                        break;
                    case 'DTSTAMP':
                        currentEvent.dtstamp = this.parseICSDate(value);
                        break;
                    case 'LOCATION':
                        currentEvent.location = this.unescapeICS(value);
                        break;
                    case 'CATEGORIES':
                        currentEvent.categories = this.unescapeICS(value);
                        break;
                    case 'PRIORITY':
                        currentEvent.priority = parseInt(value);
                        break;
                    case 'RRULE':
                        currentEvent.rrule = value;
                        break;
                    case 'ATTENDEE':
                        if (!currentEvent.attendees) currentEvent.attendees = [];
                        currentEvent.attendees.push(this.unescapeICS(value));
                        break;
                    case 'ORGANIZER':
                        currentEvent.organizer = this.unescapeICS(value);
                        break;
                    case 'STATUS':
                        currentEvent.status = value;
                        break;
                    case 'CLASS':
                        currentEvent.class = value;
                        break;
                    case 'CREATED':
                        currentEvent.created = this.parseICSDate(value);
                        break;
                    case 'LAST-MODIFIED':
                        currentEvent.lastModified = this.parseICSDate(value);
                        break;
                    case 'SEQUENCE':
                        currentEvent.sequence = parseInt(value);
                        break;
                }
            }

            result.success = result.errors.length === 0;
            return result;

        } catch (error) {
            result.errors.push(`Erro geral ao processar arquivo: ${error}`);
            return result;
        }
    }

    // Convert ICS event to internal Event format
    private convertICSEventToEvent(icsEvent: ICSEvent): Event {
        const duration = icsEvent.dtend.getTime() - icsEvent.dtstart.getTime();
        const isAllDay = duration === 24 * 60 * 60 * 1000; // 24 hours

        // Parse category
        let category: 'meeting' | 'task' | 'reminder' | 'event' | 'personal' | 'work' = 'event';
        if (icsEvent.categories) {
            const categories = icsEvent.categories.toLowerCase().split(',');
            if (categories.includes('meeting')) category = 'meeting';
            else if (categories.includes('task')) category = 'task';
            else if (categories.includes('reminder')) category = 'reminder';
            else if (categories.includes('personal')) category = 'personal';
            else if (categories.includes('work')) category = 'work';
        }

        // Parse priority
        let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
        if (icsEvent.priority) {
            if (icsEvent.priority >= 7) priority = 'low';
            else if (icsEvent.priority >= 5) priority = 'medium';
            else if (icsEvent.priority >= 3) priority = 'high';
            else priority = 'urgent';
        }

        // Parse recurrence rule
        let recurrence: RecurrenceRule | undefined;
        if (icsEvent.rrule) {
            recurrence = this.parseRRule(icsEvent.rrule);
        }

        return {
            id: `imported_${icsEvent.uid}_${Date.now()}`,
            title: icsEvent.summary,
            description: icsEvent.description || '',
            startDate: icsEvent.dtstart,
            endDate: icsEvent.dtend,
            isAllDay,
            category,
            priority,
            location: icsEvent.location || '',
            attendees: icsEvent.attendees?.map((email, index) => ({
                id: `attendee_${Date.now()}_${index}`,
                name: email.split('@')[0] || email,
                email,
                confirmed: false
            })) || [],
            recurrence,
            reminders: [],
            attachments: [],
            tags: icsEvent.categories ? icsEvent.categories.split(',').map(cat => cat.trim()) : [],
            color: this.getColorForCategory(category),
            createdAt: icsEvent.created || new Date(),
            updatedAt: icsEvent.lastModified || icsEvent.created || new Date(),
            createdBy: 'imported'
        };
    }

    // Parse RRULE from ICS format
    private parseRRule(rrule: string): RecurrenceRule | undefined {
        try {
            const parts = rrule.split(';');
            const rule: any = {};

            parts.forEach(part => {
                const [key, value] = part.split('=');
                if (key && value) {
                    rule[key.toLowerCase()] = value;
                }
            });

            if (!rule.freq) return undefined;

            const frequency = rule.freq.toLowerCase();
            const interval = parseInt(rule.interval) || 1;

            let endDate: Date | undefined;
            if (rule.until) {
                endDate = this.parseICSDate(rule.until);
            }

            const count = rule.count ? parseInt(rule.count) : undefined;

            let daysOfWeek: number[] | undefined;
            if (rule.byday) {
                const days = rule.byday.split(',');
                daysOfWeek = days.map((day: string) => {
                    const dayMap: Record<string, number> = {
                        'su': 0, 'mo': 1, 'tu': 2, 'we': 3,
                        'th': 4, 'fr': 5, 'sa': 6
                    };
                    return dayMap[day.substring(0, 2).toLowerCase()] || 0;
                });
            }

            let dayOfMonth: number | undefined;
            if (rule.bymonthday) {
                dayOfMonth = parseInt(rule.bymonthday);
            }

            return {
                id: `rrule_${Date.now()}`,
                frequency: frequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
                interval,
                endDate,
                count,
                daysOfWeek,
                dayOfMonth
            };
        } catch (error) {
            console.error('Error parsing RRULE:', error);
            return undefined;
        }
    }

    // Export events to ICS format
    public exportToICS(events: Event[], options: ExportOptions = {}): string {
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//MaxNote//Calendar//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];

        // Filter events based on options
        let filteredEvents = events;

        if (options.dateRange) {
            filteredEvents = filteredEvents.filter(event =>
                event.startDate >= options.dateRange!.start &&
                event.startDate <= options.dateRange!.end
            );
        }

        if (options.categories && options.categories.length > 0) {
            filteredEvents = filteredEvents.filter(event =>
                options.categories!.includes(event.category)
            );
        }

        // Sort events by start date
        filteredEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        // Add events to ICS
        filteredEvents.forEach(event => {
            icsContent.push(...this.convertEventToICS(event));
        });

        icsContent.push('END:VCALENDAR');

        return icsContent.join('\r\n');
    }

    // Convert internal Event to ICS format
    private convertEventToICS(event: Event): string[] {
        const icsEvent: string[] = ['BEGIN:VEVENT'];

        // Basic properties
        icsEvent.push(`UID:${event.id}`);
        icsEvent.push(`DTSTAMP:${this.formatICSDate(new Date())}`);
        icsEvent.push(`DTSTART:${this.formatICSDate(event.startDate)}`);
        icsEvent.push(`DTEND:${this.formatICSDate(event.endDate)}`);
        icsEvent.push(`SUMMARY:${this.escapeICS(event.title)}`);

        // Optional properties
        if (event.description) {
            icsEvent.push(`DESCRIPTION:${this.escapeICS(event.description)}`);
        }

        if (event.location) {
            icsEvent.push(`LOCATION:${this.escapeICS(event.location)}`);
        }

        // Categories
        const categories = [...event.tags, event.category].filter(Boolean);
        if (categories.length > 0) {
            icsEvent.push(`CATEGORIES:${this.escapeICS(categories.join(','))}`);
        }

        // Priority
        const priorityMap = { low: 7, medium: 5, high: 3, urgent: 1 };
        icsEvent.push(`PRIORITY:${priorityMap[event.priority]}`);

        // Class
        icsEvent.push('CLASS:PUBLIC');

        // Created and modified dates
        icsEvent.push(`CREATED:${this.formatICSDate(event.createdAt)}`);
        icsEvent.push(`LAST-MODIFIED:${this.formatICSDate(event.updatedAt)}`);

        // Attendees
        event.attendees.forEach(attendee => {
            icsEvent.push(`ATTENDEE;CN=${this.escapeICS(attendee.name)}:mailto:${attendee.email}`);
        });

        // Recurrence rule
        if (event.recurrence) {
            const rrule = this.formatRRule(event.recurrence);
            if (rrule) {
                icsEvent.push(`RRULE:${rrule}`);
            }
        }

        icsEvent.push('END:VEVENT');
        return icsEvent;
    }

    // Format RRULE to ICS format
    private formatRRule(rule: RecurrenceRule): string | null {
        if (!rule.frequency) return null;

        const parts: string[] = [];

        parts.push(`FREQ=${rule.frequency.toUpperCase()}`);
        parts.push(`INTERVAL=${rule.interval}`);

        if (rule.endDate) {
            parts.push(`UNTIL=${this.formatICSDate(rule.endDate)}`);
        }

        if (rule.count) {
            parts.push(`COUNT=${rule.count}`);
        }

        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
            const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
            const days = rule.daysOfWeek.map(day => dayMap[day]).join(',');
            parts.push(`BYDAY=${days}`);
        }

        if (rule.dayOfMonth) {
            parts.push(`BYMONTHDAY=${rule.dayOfMonth}`);
        }

        return parts.join(';');
    }

    // Parse ICS date format
    private parseICSDate(dateStr: string): Date {
        // Handle both basic format (YYYYMMDDTHHMMSSZ) and format with timezone
        let cleanDate = dateStr;

        // Remove any timezone info
        const tzIndex = cleanDate.indexOf('TZID=');
        if (tzIndex !== -1) {
            cleanDate = cleanDate.substring(cleanDate.indexOf(':') + 1);
        }

        // Remove Z suffix if present
        if (cleanDate.endsWith('Z')) {
            cleanDate = cleanDate.slice(0, -1);
        }

        // Parse the date
        const year = parseInt(cleanDate.substring(0, 4));
        const month = parseInt(cleanDate.substring(4, 6)) - 1; // JS months are 0-indexed
        const day = parseInt(cleanDate.substring(6, 8));
        const hour = cleanDate.length > 8 ? parseInt(cleanDate.substring(9, 11)) : 0;
        const minute = cleanDate.length > 11 ? parseInt(cleanDate.substring(11, 13)) : 0;
        const second = cleanDate.length > 13 ? parseInt(cleanDate.substring(13, 15)) : 0;

        return new Date(year, month, day, hour, minute, second);
    }

    // Format date to ICS format
    private formatICSDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');

        return `${year}${month}${day}T${hour}${minute}${second}Z`;
    }

    // Escape special characters for ICS
    private escapeICS(text: string): string {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }

    // Unescape special characters from ICS
    private unescapeICS(text: string): string {
        return text
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\,/g, ',')
            .replace(/\\;/g, ';')
            .replace(/\\\\/g, '\\');
    }

    // Get color for category
    private getColorForCategory(category: string): string {
        const colorMap: Record<string, string> = {
            meeting: 'bg-blue-500',
            task: 'bg-green-500',
            reminder: 'bg-yellow-500',
            event: 'bg-purple-500',
            personal: 'bg-pink-500',
            work: 'bg-indigo-500'
        };
        return colorMap[category] || 'bg-gray-500';
    }

    // Download ICS file
    public downloadICS(events: Event[], filename: string = 'calendar.ics', options?: ExportOptions): void {
        const icsContent = this.exportToICS(events, options);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    // Import from file
    public async importFromFile(file: File): Promise<ImportResult> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                if (content) {
                    const result = this.parseICS(content);
                    resolve(result);
                } else {
                    resolve({
                        success: false,
                        events: [],
                        errors: ['Arquivo vazio'],
                        warnings: [],
                        duplicates: 0,
                        skipped: 0
                    });
                }
            };
            reader.onerror = () => {
                resolve({
                    success: false,
                    events: [],
                    errors: ['Erro ao ler arquivo'],
                    warnings: [],
                    duplicates: 0,
                    skipped: 0
                });
            };
            reader.readAsText(file);
        });
    }

    // Sync with external calendar (Google Calendar, Outlook, etc.)
    public async syncWithExternalCalendar(
        events: Event[],
        calendarUrl: string,
        authHeaders?: Record<string, string>
    ): Promise<{ success: boolean; added: number; updated: number; errors: string[] }> {
        try {
            // Export events to ICS
            const icsContent = this.exportToICS(events);

            // Send to external calendar
            const response = await fetch(calendarUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/calendar',
                    ...authHeaders
                },
                body: icsContent
            });

            if (response.ok) {
                return {
                    success: true,
                    added: events.length,
                    updated: 0,
                    errors: []
                };
            } else {
                return {
                    success: false,
                    added: 0,
                    updated: 0,
                    errors: [`Erro de sincronização: ${response.statusText}`]
                };
            }
        } catch (error) {
            return {
                success: false,
                added: 0,
                updated: 0,
                errors: [`Erro de rede: ${error}`]
            };
        }
    }
}

// Singleton instance
export const calendarImportExportService = new CalendarImportExportService();

// Utility functions
export const parseICSFile = (content: string) => {
    return calendarImportExportService.parseICS(content);
};

export const exportEventsToICS = (events: Event[], options?: ExportOptions) => {
    return calendarImportExportService.exportToICS(events, options);
};

export const downloadICSFile = (events: Event[], filename?: string, options?: ExportOptions) => {
    return calendarImportExportService.downloadICS(events, filename, options);
};

export const importCalendarFromFile = (file: File) => {
    return calendarImportExportService.importFromFile(file);
};

export const syncWithExternalCalendar = (
    events: Event[],
    calendarUrl: string,
    authHeaders?: Record<string, string>
) => {
    return calendarImportExportService.syncWithExternalCalendar(events, calendarUrl, authHeaders);
};