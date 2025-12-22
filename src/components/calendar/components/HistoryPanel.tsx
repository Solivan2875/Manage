import { useState, useEffect } from 'react';
import {
    History,
    Clock,
    Edit,
    Trash2,
    Plus,
    Eye,
    Filter,
    Download,
    Upload,
    RotateCcw,
    Calendar,
    CheckSquare,
    FileText,
    Settings
} from 'lucide-react';
import type { Event } from '../../../types/calendar';
import { useAuditHistory } from '../../../hooks/calendar/useAuditHistory';
import type { AuditLog, AuditFilter } from '../../../services/auditService';

interface HistoryPanelProps {
    events: Event[];
    selectedEvent?: Event | null;
    onEventRevert?: (eventId: string, previousState: any) => void;
}

export const HistoryPanel = ({
    events,
    selectedEvent,
    onEventRevert
}: HistoryPanelProps) => {
    const [activeTab, setActiveTab] = useState<'recent' | 'event' | 'analytics'>('recent');
    const [showFilters, setShowFilters] = useState(false);
    const [tempFilter, setTempFilter] = useState<AuditFilter>({});

    const {
        logs,
        selectedEventHistory,
        recentActivity,
        statistics,
        filter,
        logView,
        getEventHistoryById,
        updateFilter,
        clearFilter,
        exportLogs,
        importLogs,
        clearLogs,
        revertToState,
        formatChange,
        formatAction,
        formatEntityType,
        formatTimestamp,
        getActivitySummary,
        getUserActivityPatterns
    } = useAuditHistory({ events });

    // Load event history when selected event changes
    useEffect(() => {
        if (selectedEvent) {
            getEventHistoryById(selectedEvent.id);
            setActiveTab('event');
        }
    }, [selectedEvent, getEventHistoryById]);

    const handleFilterApply = () => {
        updateFilter(tempFilter);
        setShowFilters(false);
    };

    const handleFilterClear = () => {
        setTempFilter({});
        clearFilter();
        setShowFilters(false);
    };

    const handleExport = () => {
        const logsJson = exportLogs();
        const blob = new Blob([logsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    if (importLogs(content)) {
                        alert('Logs importados com sucesso!');
                    } else {
                        alert('Erro ao importar logs. Verifique o formato do arquivo.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleRevert = (eventId: string, logId: string) => {
        const previousState = revertToState(eventId, logId);
        if (previousState && onEventRevert) {
            onEventRevert(eventId, previousState);
        }
    };

    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case 'event':
                return <Calendar className="w-4 h-4" />;
            case 'task':
                return <CheckSquare className="w-4 h-4" />;
            case 'note':
                return <FileText className="w-4 h-4" />;
            case 'settings':
                return <Settings className="w-4 h-4" />;
            default:
                return <History className="w-4 h-4" />;
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create':
                return <Plus className="w-4 h-4 text-green-500" />;
            case 'update':
                return <Edit className="w-4 h-4 text-blue-500" />;
            case 'delete':
                return <Trash2 className="w-4 h-4 text-red-500" />;
            case 'view':
                return <Eye className="w-4 h-4 text-gray-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const activitySummary = getActivitySummary(7);
    const userPatterns = getUserActivityPatterns();

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Histórico de Alterações
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Filtros"
                    >
                        <Filter className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={handleExport}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Exportar logs"
                    >
                        <Download className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                        onClick={handleImport}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Importar logs"
                    >
                        <Upload className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <select
                            value={tempFilter.entityType || ''}
                            onChange={(e) => setTempFilter(prev => ({
                                ...prev,
                                entityType: e.target.value as any || undefined
                            }))}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                        >
                            <option value="">Todos os tipos</option>
                            <option value="event">Eventos</option>
                            <option value="task">Tarefas</option>
                            <option value="note">Notas</option>
                            <option value="settings">Configurações</option>
                        </select>
                        <select
                            value={tempFilter.action || ''}
                            onChange={(e) => setTempFilter(prev => ({
                                ...prev,
                                action: e.target.value as any || undefined
                            }))}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                        >
                            <option value="">Todas as ações</option>
                            <option value="create">Criar</option>
                            <option value="update">Atualizar</option>
                            <option value="delete">Excluir</option>
                            <option value="view">Visualizar</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleFilterApply}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm transition-colors"
                        >
                            Aplicar Filtros
                        </button>
                        <button
                            onClick={handleFilterClear}
                            className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm transition-colors"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                    onClick={() => setActiveTab('recent')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'recent'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Atividade Recente
                </button>
                <button
                    onClick={() => setActiveTab('event')}
                    disabled={!selectedEvent}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'event'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-gray-500 hover:text-gray-700'
                        } ${!selectedEvent ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Histórico do Evento
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'analytics'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Analytics
                </button>
            </div>

            {/* Recent Activity Tab */}
            {activeTab === 'recent' && (
                <div className="space-y-3">
                    {recentActivity.map(log => (
                        <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="mt-1">
                                {getActionIcon(log.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {getEntityIcon(log.entityType)}
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {formatAction(log.action)} {formatEntityType(log.entityType)}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                    {formatTimestamp(log.timestamp)} • {log.userId}
                                </div>
                                {log.changes && log.changes.length > 0 && (
                                    <div className="space-y-1">
                                        {log.changes.slice(0, 3).map((change, index) => (
                                            <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                                                {formatChange(change)}
                                            </div>
                                        ))}
                                        {log.changes.length > 3 && (
                                            <div className="text-xs text-gray-500">
                                                +{log.changes.length - 3} outras alterações
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Event History Tab */}
            {activeTab === 'event' && selectedEvent && (
                <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                            {selectedEvent.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                            ID: {selectedEvent.id}
                        </p>
                    </div>

                    {selectedEventHistory.map(log => (
                        <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="mt-1">
                                {getActionIcon(log.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {formatAction(log.action)}
                                    </span>
                                    {log.action === 'update' && log.previousState && (
                                        <button
                                            onClick={() => handleRevert(selectedEvent.id, log.id)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                            title="Reverter para este estado"
                                        >
                                            <RotateCcw className="w-3 h-3 text-gray-500" />
                                        </button>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                    {formatTimestamp(log.timestamp)} • {log.userId}
                                </div>
                                {log.changes && log.changes.length > 0 && (
                                    <div className="space-y-1">
                                        {log.changes.map((change, index) => (
                                            <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                                                {formatChange(change)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-4">
                    {/* Activity Summary */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                            Resumo dos Últimos 7 Dias
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {activitySummary.total}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                    Total de Ações
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {activitySummary.creates}
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400">
                                    Criações
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {activitySummary.updates}
                                </div>
                                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                    Atualizações
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {activitySummary.deletes}
                                </div>
                                <div className="text-xs text-red-600 dark:text-red-400">
                                    Exclusões
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Activity Patterns */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                            Padrões de Atividade
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Hora mais ativa
                                </div>
                                <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                    {userPatterns.mostActiveHour}:00
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Total de ações
                                </div>
                                <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                    {userPatterns.totalActions}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};