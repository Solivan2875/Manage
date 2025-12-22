import { useState, useEffect, useCallback } from 'react';
import type { Event } from '../../types/calendar';
import {
    auditService,
    logEventCreate,
    logEventUpdate,
    logEventDelete,
    logEventView,
    getEventHistory,
    getRecentActivity,
    getAuditStatistics,
    type AuditLog,
    type AuditFilter,
    type AuditChange
} from '../../services/auditService';

interface UseAuditHistoryProps {
    events: Event[];
    currentUserId?: string;
}

export const useAuditHistory = ({
    events,
    currentUserId = 'current-user'
}: UseAuditHistoryProps) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [selectedEventHistory, setSelectedEventHistory] = useState<AuditLog[]>([]);
    const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
    const [statistics, setStatistics] = useState<any>(null);
    const [filter, setFilter] = useState<AuditFilter>({});

    // Load initial data
    useEffect(() => {
        loadLogs();
        loadRecentActivity();
        loadStatistics();
    }, []);

    // Load logs with current filter
    const loadLogs = useCallback(() => {
        const filteredLogs = auditService.getLogs(filter);
        setLogs(filteredLogs);
    }, [filter]);

    // Load recent activity
    const loadRecentActivity = useCallback(() => {
        const activity = getRecentActivity(20);
        setRecentActivity(activity);
    }, []);

    // Load statistics
    const loadStatistics = useCallback(() => {
        const stats = getAuditStatistics(filter);
        setStatistics(stats);
    }, [filter]);

    // Event logging functions
    const logCreate = useCallback((event: Event) => {
        logEventCreate(event, currentUserId);
        loadLogs();
        loadRecentActivity();
        loadStatistics();
    }, [currentUserId, loadLogs, loadRecentActivity, loadStatistics]);

    const logUpdate = useCallback((eventId: string, previousEvent: Event, updatedEvent: Event) => {
        logEventUpdate(eventId, previousEvent, updatedEvent, currentUserId);
        loadLogs();
        loadRecentActivity();
        loadStatistics();
    }, [currentUserId, loadLogs, loadRecentActivity, loadStatistics]);

    const logDelete = useCallback((event: Event) => {
        logEventDelete(event, currentUserId);
        loadLogs();
        loadRecentActivity();
        loadStatistics();
    }, [currentUserId, loadLogs, loadRecentActivity, loadStatistics]);

    const logView = useCallback((eventId: string) => {
        logEventView(eventId, currentUserId);
        loadLogs();
        loadRecentActivity();
    }, [currentUserId, loadLogs, loadRecentActivity]);

    // Get history for a specific event
    const getEventHistoryById = useCallback((eventId: string) => {
        const history = getEventHistory(eventId);
        setSelectedEventHistory(history);
        return history;
    }, []);

    // Filter management
    const updateFilter = useCallback((newFilter: Partial<AuditFilter>) => {
        setFilter(prevFilter => ({ ...prevFilter, ...newFilter }));
    }, []);

    const clearFilter = useCallback(() => {
        setFilter({});
    }, []);

    // Export functions
    const exportLogs = useCallback((exportFilter?: AuditFilter) => {
        return auditService.exportLogs(exportFilter || filter);
    }, [filter]);

    const importLogs = useCallback((logsJson: string) => {
        const success = auditService.importLogs(logsJson);
        if (success) {
            loadLogs();
            loadRecentActivity();
            loadStatistics();
        }
        return success;
    }, [loadLogs, loadRecentActivity, loadStatistics]);

    // Clear logs
    const clearLogs = useCallback((clearFilter?: AuditFilter) => {
        auditService.clearLogs(clearFilter || filter);
        loadLogs();
        loadRecentActivity();
        loadStatistics();
    }, [filter, loadLogs, loadRecentActivity, loadStatistics]);

    // Revert to previous state
    const revertToState = useCallback((eventId: string, logId: string) => {
        const previousState = auditService.revertToState(eventId, 'event', logId);
        if (previousState) {
            loadLogs();
            loadRecentActivity();
            loadStatistics();
            return previousState;
        }
        return null;
    }, [loadLogs, loadRecentActivity, loadStatistics]);

    // Utility functions for formatting
    const formatChange = useCallback((change: AuditChange): string => {
        const { field, oldValue, newValue, type } = change;

        switch (type) {
            case 'array':
                return `${field}: array modified`;
            case 'object':
                return `${field}: object modified`;
            default:
                return `${field}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`;
        }
    }, []);

    const formatAction = useCallback((action: string): string => {
        switch (action) {
            case 'create':
                return 'Criado';
            case 'update':
                return 'Atualizado';
            case 'delete':
                return 'Excluído';
            case 'view':
                return 'Visualizado';
            default:
                return action;
        }
    }, []);

    const formatEntityType = useCallback((entityType: string): string => {
        switch (entityType) {
            case 'event':
                return 'Evento';
            case 'task':
                return 'Tarefa';
            case 'note':
                return 'Nota';
            case 'settings':
                return 'Configuração';
            default:
                return entityType;
        }
    }, []);

    const formatTimestamp = useCallback((timestamp: Date): string => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} dias atrás`;

        return timestamp.toLocaleDateString('pt-BR');
    }, []);

    // Get activity summary for a time period
    const getActivitySummary = useCallback((days: number = 7) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const periodLogs = auditService.getLogs({
            startDate
        });

        const summary = {
            total: periodLogs.length,
            creates: periodLogs.filter(log => log.action === 'create').length,
            updates: periodLogs.filter(log => log.action === 'update').length,
            deletes: periodLogs.filter(log => log.action === 'delete').length,
            views: periodLogs.filter(log => log.action === 'view').length,
            byEntityType: {} as Record<string, number>,
            byDay: {} as Record<string, number>
        };

        periodLogs.forEach(log => {
            // Count by entity type
            summary.byEntityType[log.entityType] = (summary.byEntityType[log.entityType] || 0) + 1;

            // Count by day
            const dayKey = log.timestamp.toISOString().split('T')[0];
            summary.byDay[dayKey] = (summary.byDay[dayKey] || 0) + 1;
        });

        return summary;
    }, []);

    // Get most active entities
    const getMostActiveEntities = useCallback((limit: number = 10) => {
        const stats = getAuditStatistics();
        return stats.mostModifiedEntities.slice(0, limit);
    }, []);

    // Get user activity patterns
    const getUserActivityPatterns = useCallback((userId?: string) => {
        const userLogs = auditService.getLogs({
            userId: userId || currentUserId
        });

        const patterns = {
            totalActions: userLogs.length,
            actionsByHour: {} as Record<string, number>,
            actionsByDayOfWeek: {} as Record<string, number>,
            mostActiveHour: 0,
            mostActiveDayOfWeek: 0
        };

        userLogs.forEach(log => {
            const hour = log.timestamp.getHours().toString();
            const dayOfWeek = log.timestamp.getDay().toString();

            patterns.actionsByHour[hour] = (patterns.actionsByHour[hour] || 0) + 1;
            patterns.actionsByDayOfWeek[dayOfWeek] = (patterns.actionsByDayOfWeek[dayOfWeek] || 0) + 1;
        });

        // Find most active hour and day
        let maxHourCount = 0;
        let maxDayCount = 0;

        Object.entries(patterns.actionsByHour).forEach(([hour, count]) => {
            if (count > maxHourCount) {
                maxHourCount = count;
                patterns.mostActiveHour = parseInt(hour);
            }
        });

        Object.entries(patterns.actionsByDayOfWeek).forEach(([day, count]) => {
            if (count > maxDayCount) {
                maxDayCount = count;
                patterns.mostActiveDayOfWeek = parseInt(day);
            }
        });

        return patterns;
    }, [currentUserId]);

    return {
        // Data
        logs,
        selectedEventHistory,
        recentActivity,
        statistics,
        filter,

        // Event logging
        logCreate,
        logUpdate,
        logDelete,
        logView,

        // History management
        getEventHistoryById,

        // Filter management
        updateFilter,
        clearFilter,

        // Import/Export
        exportLogs,
        importLogs,

        // Data management
        clearLogs,
        revertToState,

        // Analytics
        getActivitySummary,
        getMostActiveEntities,
        getUserActivityPatterns,

        // Utility functions
        formatChange,
        formatAction,
        formatEntityType,
        formatTimestamp,

        // Refresh functions
        refreshLogs: loadLogs,
        refreshRecentActivity: loadRecentActivity,
        refreshStatistics: loadStatistics
    };
};