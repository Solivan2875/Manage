import { useState, useCallback } from 'react';
import type { Event } from '../../types/calendar';
import {
    calendarImportExportService,
    parseICSFile,
    exportEventsToICS,
    downloadICSFile,
    importCalendarFromFile,
    syncWithExternalCalendar,
    type ImportResult,
    type ExportOptions
} from '../../services/calendarImportExportService';

interface UseCalendarImportExportProps {
    events: Event[];
    onEventAdd?: (event: Event) => void;
    onEventUpdate?: (id: string, updates: Partial<Event>) => void;
    onEventDelete?: (id: string) => void;
}

export const useCalendarImportExport = ({
    events,
    onEventAdd,
    onEventUpdate,
    onEventDelete
}: UseCalendarImportExportProps) => {
    const [isImporting, setIsImporting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [exportOptions, setExportOptions] = useState<ExportOptions>({});

    // Import events from ICS file
    const importFromFile = useCallback(async (file: File) => {
        setIsImporting(true);
        setImportResult(null);

        try {
            const result = await importCalendarFromFile(file);

            if (result.success && result.events.length > 0) {
                // Add imported events to the calendar
                result.events.forEach(event => {
                    if (onEventAdd) {
                        onEventAdd(event);
                    }
                });
            }

            setImportResult(result);
        } catch (error) {
            setImportResult({
                success: false,
                events: [],
                errors: [`Erro ao importar arquivo: ${error}`],
                warnings: [],
                duplicates: 0,
                skipped: 0
            });
        } finally {
            setIsImporting(false);
        }
    }, [onEventAdd]);

    // Export events to ICS format
    const exportToICS = useCallback((options?: ExportOptions) => {
        setIsExporting(true);

        try {
            const finalOptions = { ...exportOptions, ...options };
            const icsContent = exportEventsToICS(events, finalOptions);

            // Create download link
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `maxnote-calendar-${new Date().toISOString().split('T')[0]}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting calendar:', error);
            alert('Erro ao exportar calendário. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    }, [events, exportOptions]);

    // Download ICS file directly
    const downloadICS = useCallback((filename?: string, options?: ExportOptions) => {
        setIsExporting(true);

        try {
            downloadICSFile(events, filename, options);
        } catch (error) {
            console.error('Error downloading ICS:', error);
            alert('Erro ao baixar arquivo. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    }, [events]);

    // Sync with external calendar
    const syncWithExternal = useCallback(async (
        calendarUrl: string,
        authHeaders?: Record<string, string>
    ) => {
        setIsSyncing(true);

        try {
            const result = await syncWithExternalCalendar(events, calendarUrl, authHeaders);

            if (result.success) {
                alert(`Sincronização concluída! ${result.added} eventos adicionados.`);
            } else {
                alert(`Erro na sincronização: ${result.errors.join(', ')}`);
            }
        } catch (error) {
            console.error('Error syncing with external calendar:', error);
            alert('Erro ao sincronizar com calendário externo. Verifique a conexão.');
        } finally {
            setIsSyncing(false);
        }
    }, [events]);

    // Parse ICS content directly
    const parseICS = useCallback((content: string): ImportResult => {
        return parseICSFile(content);
    }, []);

    // Update export options
    const updateExportOptions = useCallback((newOptions: Partial<ExportOptions>) => {
        setExportOptions(prev => ({ ...prev, ...newOptions }));
    }, []);

    // Get export statistics
    const getExportStatistics = useCallback((options?: ExportOptions) => {
        const finalOptions = { ...exportOptions, ...options };

        let filteredEvents = events;

        if (finalOptions.dateRange) {
            filteredEvents = filteredEvents.filter(event =>
                event.startDate >= finalOptions.dateRange!.start &&
                event.startDate <= finalOptions.dateRange!.end
            );
        }

        if (finalOptions.categories && finalOptions.categories.length > 0) {
            filteredEvents = filteredEvents.filter(event =>
                finalOptions.categories!.includes(event.category)
            );
        }

        const stats = {
            total: filteredEvents.length,
            byCategory: {} as Record<string, number>,
            byPriority: {} as Record<string, number>,
            recurring: 0,
            dateRange: finalOptions.dateRange ? {
                start: finalOptions.dateRange!.start,
                end: finalOptions.dateRange!.end,
                days: Math.ceil((finalOptions.dateRange!.end.getTime() - finalOptions.dateRange!.start.getTime()) / (1000 * 60 * 60 * 24))
            } : null
        };

        filteredEvents.forEach(event => {
            // Count by category
            stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1;

            // Count by priority
            stats.byPriority[event.priority] = (stats.byPriority[event.priority] || 0) + 1;

            // Count recurring events
            if (event.recurrence) {
                stats.recurring++;
            }
        });

        return stats;
    }, [events, exportOptions]);

    // Validate file before import
    const validateImportFile = useCallback((file: File): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        // Check file type
        if (!file.name.toLowerCase().endsWith('.ics')) {
            errors.push('O arquivo deve ter extensão .ics');
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            errors.push('O arquivo é muito grande (máximo 10MB)');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }, []);

    // Get supported calendar providers
    const getSupportedProviders = useCallback(() => {
        return [
            {
                name: 'Google Calendar',
                url: 'https://calendar.google.com/calendar/dav',
                authType: 'oauth2',
                instructions: 'Use sua conta Google para autenticar'
            },
            {
                name: 'Outlook',
                url: 'https://outlook.office365.com/api/v2.0/me/calendars',
                authType: 'oauth2',
                instructions: 'Use sua conta Microsoft para autenticar'
            },
            {
                name: 'Apple Calendar',
                url: 'https://caldav.icloud.com/',
                authType: 'basic',
                instructions: 'Use seu Apple ID e senha'
            },
            {
                name: 'CalDAV Genérico',
                url: '',
                authType: 'basic',
                instructions: 'URL do servidor CalDAV e credenciais'
            }
        ];
    }, []);

    // Format file size for display
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    // Clear import result
    const clearImportResult = useCallback(() => {
        setImportResult(null);
    }, []);

    // Reset export options
    const resetExportOptions = useCallback(() => {
        setExportOptions({});
    }, []);

    return {
        // State
        isImporting,
        isExporting,
        isSyncing,
        importResult,
        exportOptions,

        // Import operations
        importFromFile,
        parseICS,
        validateImportFile,
        clearImportResult,

        // Export operations
        exportToICS,
        downloadICS,
        updateExportOptions,
        resetExportOptions,

        // Sync operations
        syncWithExternal,

        // Analytics
        getExportStatistics,
        getSupportedProviders,
        formatFileSize
    };
};