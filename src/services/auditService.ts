import type { Event } from '../types/calendar';

export interface AuditLog {
    id: string;
    entityType: 'event' | 'task' | 'note' | 'settings';
    entityId: string;
    action: 'create' | 'update' | 'delete' | 'view';
    timestamp: Date;
    userId: string;
    changes?: AuditChange[];
    metadata?: Record<string, any>;
    previousState?: any;
    newState?: any;
}

export interface AuditChange {
    field: string;
    oldValue: any;
    newValue: any;
    type: 'field' | 'array' | 'object';
}

export interface AuditFilter {
    entityType?: 'event' | 'task' | 'note' | 'settings';
    entityId?: string;
    action?: 'create' | 'update' | 'delete' | 'view';
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    field?: string;
}

class AuditService {
    private logs: AuditLog[] = [];
    private readonly maxLogs = 1000; // Maximum number of logs to keep

    constructor() {
        this.loadLogs();
    }

    // Load logs from localStorage
    private loadLogs() {
        try {
            const stored = localStorage.getItem('maxnote_audit_logs');
            if (stored) {
                this.logs = JSON.parse(stored).map((log: any) => ({
                    ...log,
                    timestamp: new Date(log.timestamp)
                }));
            }
        } catch (error) {
            console.error('Error loading audit logs:', error);
            this.logs = [];
        }
    }

    // Save logs to localStorage
    private saveLogs() {
        try {
            localStorage.setItem('maxnote_audit_logs', JSON.stringify(this.logs));
        } catch (error) {
            console.error('Error saving audit logs:', error);
        }
    }

    // Clean old logs to prevent storage issues
    private cleanOldLogs() {
        if (this.logs.length > this.maxLogs) {
            // Keep only the most recent logs
            this.logs = this.logs.slice(-this.maxLogs);
            this.saveLogs();
        }
    }

    // Log an action
    public log(
        entityType: 'event' | 'task' | 'note' | 'settings',
        entityId: string,
        action: 'create' | 'update' | 'delete' | 'view',
        userId: string,
        previousState?: any,
        newState?: any,
        metadata?: Record<string, any>
    ) {
        const changes = this.detectChanges(previousState, newState);

        const log: AuditLog = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            entityType,
            entityId,
            action,
            timestamp: new Date(),
            userId,
            changes: changes.length > 0 ? changes : undefined,
            metadata,
            previousState,
            newState
        };

        this.logs.push(log);
        this.saveLogs();
        this.cleanOldLogs();
    }

    // Detect changes between two states
    private detectChanges(previousState: any, newState: any): AuditChange[] {
        if (!previousState || !newState) return [];

        const changes: AuditChange[] = [];
        const allKeys = new Set([...Object.keys(previousState), ...Object.keys(newState)]);

        for (const key of allKeys) {
            const oldValue = previousState?.[key];
            const newValue = newState?.[key];

            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                let type: 'field' | 'array' | 'object' = 'field';

                if (Array.isArray(oldValue) || Array.isArray(newValue)) {
                    type = 'array';
                } else if (typeof oldValue === 'object' && oldValue !== null && typeof newValue === 'object' && newValue !== null) {
                    type = 'object';
                }

                changes.push({
                    field: key,
                    oldValue,
                    newValue,
                    type
                });
            }
        }

        return changes;
    }

    // Get logs with optional filtering
    public getLogs(filter?: AuditFilter): AuditLog[] {
        let filteredLogs = [...this.logs];

        if (filter) {
            if (filter.entityType) {
                filteredLogs = filteredLogs.filter(log => log.entityType === filter.entityType);
            }

            if (filter.entityId) {
                filteredLogs = filteredLogs.filter(log => log.entityId === filter.entityId);
            }

            if (filter.action) {
                filteredLogs = filteredLogs.filter(log => log.action === filter.action);
            }

            if (filter.userId) {
                filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
            }

            if (filter.startDate) {
                filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startDate!);
            }

            if (filter.endDate) {
                filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endDate!);
            }

            if (filter.field) {
                filteredLogs = filteredLogs.filter(log =>
                    log.changes?.some(change => change.field === filter.field)
                );
            }
        }

        // Sort by timestamp (newest first)
        return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // Get logs for a specific entity
    public getEntityHistory(entityId: string, entityType?: 'event' | 'task' | 'note' | 'settings'): AuditLog[] {
        return this.getLogs({
            entityId,
            entityType
        });
    }

    // Get recent activity
    public getRecentActivity(limit: number = 50): AuditLog[] {
        return this.getLogs().slice(0, limit);
    }

    // Get statistics
    public getStatistics(filter?: AuditFilter): {
        totalLogs: number;
        actionsByType: Record<string, number>;
        entitiesByType: Record<string, number>;
        activityByDate: Record<string, number>;
        mostActiveUsers: Array<{ userId: string; count: number }>;
        mostModifiedEntities: Array<{ entityId: string; entityType: string; count: number }>;
    } {
        const logs = this.getLogs(filter);

        const actionsByType: Record<string, number> = {};
        const entitiesByType: Record<string, number> = {};
        const activityByDate: Record<string, number> = {};
        const userActivity: Record<string, number> = {};
        const entityActivity: Record<string, { entityType: string; count: number }> = {};

        logs.forEach(log => {
            // Count actions by type
            actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;

            // Count entities by type
            entitiesByType[log.entityType] = (entitiesByType[log.entityType] || 0) + 1;

            // Count activity by date
            const dateKey = log.timestamp.toISOString().split('T')[0];
            activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;

            // Count user activity
            userActivity[log.userId] = (userActivity[log.userId] || 0) + 1;

            // Count entity activity
            const entityKey = `${log.entityType}:${log.entityId}`;
            if (!entityActivity[entityKey]) {
                entityActivity[entityKey] = { entityType: log.entityType, count: 0 };
            }
            entityActivity[entityKey].count++;
        });

        // Sort and limit results
        const mostActiveUsers = Object.entries(userActivity)
            .map(([userId, count]) => ({ userId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const mostModifiedEntities = Object.entries(entityActivity)
            .map(([key, data]) => ({
                entityId: key.split(':')[1],
                entityType: data.entityType,
                count: data.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            totalLogs: logs.length,
            actionsByType,
            entitiesByType,
            activityByDate,
            mostActiveUsers,
            mostModifiedEntities
        };
    }

    // Export logs
    public exportLogs(filter?: AuditFilter): string {
        const logs = this.getLogs(filter);
        return JSON.stringify(logs, null, 2);
    }

    // Import logs (for backup/restore)
    public importLogs(logsJson: string): boolean {
        try {
            const importedLogs = JSON.parse(logsJson);

            if (!Array.isArray(importedLogs)) {
                throw new Error('Invalid format: expected array');
            }

            // Validate log structure
            const validLogs = importedLogs.filter(log =>
                log.id &&
                log.entityType &&
                log.entityId &&
                log.action &&
                log.timestamp &&
                log.userId
            );

            this.logs = [...this.logs, ...validLogs.map((log: any) => ({
                ...log,
                timestamp: new Date(log.timestamp)
            }))];

            this.saveLogs();
            this.cleanOldLogs();
            return true;
        } catch (error) {
            console.error('Error importing logs:', error);
            return false;
        }
    }

    // Clear logs
    public clearLogs(filter?: AuditFilter): void {
        if (filter) {
            // Remove only logs that match the filter
            this.logs = this.logs.filter(log => {
                if (filter.entityType && log.entityType === filter.entityType) return false;
                if (filter.entityId && log.entityId === filter.entityId) return false;
                if (filter.action && log.action === filter.action) return false;
                if (filter.userId && log.userId === filter.userId) return false;
                if (filter.startDate && log.timestamp >= filter.startDate) return false;
                if (filter.endDate && log.timestamp <= filter.endDate) return false;
                return true;
            });
        } else {
            // Clear all logs
            this.logs = [];
        }

        this.saveLogs();
    }

    // Revert to a previous state
    public revertToState(entityId: string, entityType: 'event' | 'task' | 'note' | 'settings', logId: string): any | null {
        const log = this.logs.find(l => l.id === logId && l.entityId === entityId && l.entityType === entityType);

        if (!log || !log.previousState) {
            return null;
        }

        // Log the revert action
        this.log(
            entityType,
            entityId,
            'update',
            'system-revert',
            undefined,
            log.previousState,
            { revertedFromLogId: logId, originalAction: log.action }
        );

        return log.previousState;
    }
}

// Singleton instance
export const auditService = new AuditService();

// Utility functions
export const logEventCreate = (event: Event, userId: string = 'current-user') => {
    auditService.log('event', event.id, 'create', userId, undefined, event);
};

export const logEventUpdate = (eventId: string, previousEvent: Event, updatedEvent: Event, userId: string = 'current-user') => {
    auditService.log('event', eventId, 'update', userId, previousEvent, updatedEvent);
};

export const logEventDelete = (event: Event, userId: string = 'current-user') => {
    auditService.log('event', event.id, 'delete', userId, event, undefined);
};

export const logEventView = (eventId: string, userId: string = 'current-user') => {
    auditService.log('event', eventId, 'view', userId);
};

export const getEventHistory = (eventId: string) => {
    return auditService.getEntityHistory(eventId, 'event');
};

export const getRecentActivity = (limit?: number) => {
    return auditService.getRecentActivity(limit);
};

export const getAuditStatistics = (filter?: AuditFilter) => {
    return auditService.getStatistics(filter);
};