import { useState, useEffect } from 'react';
import {
    Wifi,
    WifiOff,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    X
} from 'lucide-react';
import type { SyncStatus } from '../../../services/offlineSyncService';
import { useOfflineSync } from '../../../hooks/calendar/useOfflineSync';

interface SyncStatusIndicatorProps {
    compact?: boolean;
    showDetails?: boolean;
    onSyncClick?: () => void;
}

export const SyncStatusIndicator = ({
    compact = false,
    showDetails = false,
    onSyncClick
}: SyncStatusIndicatorProps) => {
    const [showDetailsPanel, setShowDetailsPanel] = useState(false);
    const {
        syncStatus,
        isOfflineMode,
        syncQueue,
        triggerSync,
        getSyncStatusText,
        getLastSyncTimeText,
        getQueueByType,
        getQueueByEntityType
    } = useOfflineSync({
        events: [],
        // Pass empty functions since we're only using status
        onEventAdd: () => { },
        onEventUpdate: () => { },
        onEventDelete: () => { }
    });

    const handleSyncClick = () => {
        if (onSyncClick) {
            onSyncClick();
        } else if (syncStatus.isOnline && !syncStatus.syncInProgress) {
            triggerSync();
        }
    };

    const getStatusIcon = () => {
        if (!syncStatus.isOnline) {
            return <WifiOff className="w-4 h-4 text-gray-400" />;
        }

        if (syncStatus.syncInProgress) {
            return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
        }

        if (syncStatus.lastSyncError) {
            return <AlertCircle className="w-4 h-4 text-red-500" />;
        }

        if (syncStatus.pendingSyncItems > 0) {
            return <Clock className="w-4 h-4 text-yellow-500" />;
        }

        return <CheckCircle className="w-4 h-4 text-green-500" />;
    };

    const getStatusColor = () => {
        if (!syncStatus.isOnline) return 'text-gray-500';
        if (syncStatus.syncInProgress) return 'text-blue-500';
        if (syncStatus.lastSyncError) return 'text-red-500';
        if (syncStatus.pendingSyncItems > 0) return 'text-yellow-500';
        return 'text-green-500';
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleSyncClick}>
                {getStatusIcon()}
                <span className={`text-xs ${getStatusColor()}`}>
                    {getSyncStatusText()}
                </span>
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => showDetails && setShowDetailsPanel(!showDetailsPanel)}
            >
                {getStatusIcon()}
                <div className="flex-1">
                    <div className={`text-sm font-medium ${getStatusColor()}`}>
                        {getSyncStatusText()}
                    </div>
                    <div className="text-xs text-gray-500">
                        {syncStatus.isOnline ? 'Online' : 'Offline'}
                        {syncStatus.lastSyncTime && ` • ${getLastSyncTimeText()}`}
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSyncClick();
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
                >
                    <RefreshCw className={`w-4 h-4 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {showDetails && showDetailsPanel && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Detalhes da Sincronização
                        </h3>
                        <button
                            onClick={() => setShowDetailsPanel(false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Connection Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Conexão
                            </span>
                            <div className="flex items-center gap-1">
                                {syncStatus.isOnline ? (
                                    <Wifi className="w-4 h-4 text-green-500" />
                                ) : (
                                    <WifiOff className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium">
                                    {syncStatus.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        {/* Last Sync */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Última sincronização
                            </span>
                            <span className="text-sm font-medium">
                                {getLastSyncTimeText()}
                            </span>
                        </div>

                        {/* Pending Items */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Itens pendentes
                            </span>
                            <span className="text-sm font-medium">
                                {syncStatus.pendingSyncItems}
                            </span>
                        </div>

                        {/* Error Status */}
                        {syncStatus.lastSyncError && (
                            <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-red-700 dark:text-red-400">
                                        Erro na sincronização
                                    </div>
                                    <div className="text-xs text-red-600 dark:text-red-300">
                                        {syncStatus.lastSyncError}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Queue Details */}
                        {syncQueue.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                                    Fila de Sincronização
                                </h4>
                                <div className="space-y-2">
                                    {/* By Type */}
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                            <div className="font-medium text-blue-600 dark:text-blue-400">
                                                {getQueueByType('create').length}
                                            </div>
                                            <div className="text-blue-600 dark:text-blue-400">
                                                Criações
                                            </div>
                                        </div>
                                        <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                            <div className="font-medium text-yellow-600 dark:text-yellow-400">
                                                {getQueueByType('update').length}
                                            </div>
                                            <div className="text-yellow-600 dark:text-yellow-400">
                                                Atualizações
                                            </div>
                                        </div>
                                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                            <div className="font-medium text-red-600 dark:text-red-400">
                                                {getQueueByType('delete').length}
                                            </div>
                                            <div className="text-red-600 dark:text-red-400">
                                                Exclusões
                                            </div>
                                        </div>
                                    </div>

                                    {/* By Entity */}
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                            <div className="font-medium text-purple-600 dark:text-purple-400">
                                                {getQueueByEntityType('event').length}
                                            </div>
                                            <div className="text-purple-600 dark:text-purple-400">
                                                Eventos
                                            </div>
                                        </div>
                                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                            <div className="font-medium text-green-600 dark:text-green-400">
                                                {getQueueByEntityType('task').length}
                                            </div>
                                            <div className="text-green-600 dark:text-green-400">
                                                Tarefas
                                            </div>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                            <div className="font-medium text-gray-600 dark:text-gray-400">
                                                {getQueueByEntityType('note').length}
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400">
                                                Notas
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};