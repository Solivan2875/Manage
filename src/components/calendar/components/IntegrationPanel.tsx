import { useState } from 'react';
import {
    Calendar,
    CheckSquare,
    FileText,
    Tags,
    RefreshCw,
    Download,
    Upload,
    BarChart3,
    Wifi,
    WifiOff,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import type { Event } from '../../../types/calendar';
import type { Task, Note } from '../../../services/moduleIntegrationService';

interface IntegrationPanelProps {
    events: Event[];
    selectedEvent?: Event | null;
    onConvertToTask?: (event: Event) => void;
    onCreateNote?: (event: Event) => void;
    onSyncTasks?: () => void;
    onSyncNotes?: () => void;
    onExportCalendar?: () => void;
    onImportCalendar?: () => void;
    onShowAnalytics?: () => void;
    isOnline?: boolean;
    syncStatus?: 'idle' | 'syncing' | 'error';
    lastSyncTime?: Date | null;
    analytics?: {
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        taskEvents: number;
        completionRate: number;
        upcomingTasks: number;
    };
}

export const IntegrationPanel = ({
    events,
    selectedEvent,
    onConvertToTask,
    onCreateNote,
    onSyncTasks,
    onSyncNotes,
    onExportCalendar,
    onImportCalendar,
    onShowAnalytics,
    isOnline = true,
    syncStatus = 'idle',
    lastSyncTime,
    analytics
}: IntegrationPanelProps) => {
    const [activeTab, setActiveTab] = useState<'integration' | 'sync' | 'analytics'>('integration');

    const formatLastSyncTime = (date: Date | null) => {
        if (!date) return 'Nunca';

        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;

        return date.toLocaleDateString('pt-BR');
    };

    const getSyncStatusIcon = () => {
        switch (syncStatus) {
            case 'syncing':
                return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <CheckCircle className="w-4 h-4 text-green-500" />;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Integração
                </h3>
                <div className="flex items-center gap-2">
                    {isOnline ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                        <WifiOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500">
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                    onClick={() => setActiveTab('integration')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'integration'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Ações
                </button>
                <button
                    onClick={() => setActiveTab('sync')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'sync'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Sincronização
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

            {/* Integration Tab */}
            {activeTab === 'integration' && (
                <div className="space-y-4">
                    {selectedEvent && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Evento: {selectedEvent.title}
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => onConvertToTask?.(selectedEvent)}
                                    className="flex items-center gap-2 p-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    Converter em Tarefa
                                </button>
                                <button
                                    onClick={() => onCreateNote?.(selectedEvent)}
                                    className="flex items-center gap-2 p-2 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Criar Nota
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Ações em Lote
                        </h4>
                        <button
                            onClick={onSyncTasks}
                            className="w-full flex items-center gap-2 p-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors"
                        >
                            <CheckSquare className="w-4 h-4" />
                            Sincronizar Tarefas
                        </button>
                        <button
                            onClick={onSyncNotes}
                            className="w-full flex items-center gap-2 p-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                            Sincronizar Notas
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Importação/Exportação
                        </h4>
                        <button
                            onClick={onImportCalendar}
                            className="w-full flex items-center gap-2 p-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Importar Calendário
                        </button>
                        <button
                            onClick={onExportCalendar}
                            className="w-full flex items-center gap-2 p-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            Exportar Calendário
                        </button>
                    </div>
                </div>
            )}

            {/* Sync Tab */}
            {activeTab === 'sync' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2">
                            {getSyncStatusIcon()}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status da Sincronização
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">
                            {formatLastSyncTime(lastSyncTime || null)}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sincronização Automática
                        </h4>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Sincronizar quando online
                            </span>
                            <div className="w-10 h-6 bg-teal-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Sincronizar tags
                            </span>
                            <div className="w-10 h-6 bg-teal-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            onSyncTasks?.();
                            onSyncNotes?.();
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Sincronizar Agora
                    </button>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
                <div className="space-y-4">
                    <button
                        onClick={onShowAnalytics}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Ver Relatórios Detalhados
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {analytics.totalTasks}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                                Total de Tarefas
                            </div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {analytics.completedTasks}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">
                                Concluídas
                            </div>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {analytics.overdueTasks}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400">
                                Atrasadas
                            </div>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {Math.round(analytics.completionRate)}%
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">
                                Taxa de Conclusão
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Resumo de Eventos
                        </h4>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Eventos de Tarefa
                                </span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {analytics.taskEvents}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Próximas Tarefas
                                </span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {analytics.upcomingTasks}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};