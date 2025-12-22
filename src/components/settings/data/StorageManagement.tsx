import { useState, useCallback, useMemo } from 'react';
import { HardDrive, Trash2, RefreshCw, AlertTriangle, TrendingUp, FileText, Calendar, CheckSquare, Zap } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsToggle } from '../shared/SettingsToggle';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { cn } from '../../../lib/utils';

interface StorageItem {
    id: string;
    name: string;
    type: 'note' | 'task' | 'event' | 'jot' | 'attachment';
    size: number;
    createdAt: string;
    lastAccessed: string;
}

interface StorageStats {
    total: number;
    used: number;
    available: number;
    breakdown: {
        notes: number;
        tasks: number;
        events: number;
        jots: number;
        attachments: number;
    };
}

export const StorageManagement: React.FC = () => {
    const [isCleaning, setIsCleaning] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null);
    const [autoCleanup, setAutoCleanup] = useState(false);
    const [retentionDays, setRetentionDays] = useState(365);

    // Mock storage data - in a real app, this would come from the backend
    const [storageItems] = useState<StorageItem[]>([
        {
            id: '1',
            name: 'Projeto de Desenvolvimento',
            type: 'note',
            size: 245760,
            createdAt: '2024-01-15T10:30:00Z',
            lastAccessed: '2024-01-20T15:45:00Z'
        },
        {
            id: '2',
            name: 'Reunião de Equipe',
            type: 'event',
            size: 16384,
            createdAt: '2024-01-10T09:00:00Z',
            lastAccessed: '2024-01-10T17:00:00Z'
        },
        {
            id: '3',
            name: 'Tarefas do Mês',
            type: 'task',
            size: 81920,
            createdAt: '2024-01-01T00:00:00Z',
            lastAccessed: '2024-01-22T10:15:00Z'
        },
        {
            id: '4',
            name: 'Ideias Rápidas',
            type: 'jot',
            size: 4096,
            createdAt: '2024-01-05T14:20:00Z',
            lastAccessed: '2024-01-05T14:20:00Z'
        },
        {
            id: '5',
            name: 'documento.pdf',
            type: 'attachment',
            size: 2097152,
            createdAt: '2024-01-12T11:30:00Z',
            lastAccessed: '2024-01-18T16:30:00Z'
        }
    ]);

    const storageStats: StorageStats = useMemo(() => {
        const total = 5 * 1024 * 1024 * 1024; // 5GB
        const breakdown = storageItems.reduce((acc, item) => {
            switch (item.type) {
                case 'note':
                    acc.notes += item.size;
                    break;
                case 'task':
                    acc.tasks += item.size;
                    break;
                case 'event':
                    acc.events += item.size;
                    break;
                case 'jot':
                    acc.jots += item.size;
                    break;
                case 'attachment':
                    acc.attachments += item.size;
                    break;
            }
            return acc;
        }, { notes: 0, tasks: 0, events: 0, jots: 0, attachments: 0 });

        const used = Object.values(breakdown).reduce((sum, size) => sum + size, 0);

        return {
            total,
            used,
            available: total - used,
            breakdown
        };
    }, [storageItems]);

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeIcon = (type: StorageItem['type']) => {
        switch (type) {
            case 'note':
                return FileText;
            case 'task':
                return CheckSquare;
            case 'event':
                return Calendar;
            case 'jot':
                return Zap;
            case 'attachment':
                return HardDrive;
            default:
                return FileText;
        }
    };

    const getTypeColor = (type: StorageItem['type']) => {
        switch (type) {
            case 'note':
                return 'text-blue-600 dark:text-blue-400';
            case 'task':
                return 'text-green-600 dark:text-green-400';
            case 'event':
                return 'text-purple-600 dark:text-purple-400';
            case 'jot':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'attachment':
                return 'text-orange-600 dark:text-orange-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getTypeLabel = (type: StorageItem['type']) => {
        switch (type) {
            case 'note':
                return 'Nota';
            case 'task':
                return 'Tarefa';
            case 'event':
                return 'Evento';
            case 'jot':
                return 'Jot';
            case 'attachment':
                return 'Anexo';
            default:
                return 'Desconhecido';
        }
    };

    const handleCleanup = useCallback(async () => {
        setIsCleaning(true);
        try {
            // Simulate cleanup process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real implementation, this would:
            // 1. Identify old/unaccessed items
            // 2. Remove temporary files
            // 3. Optimize database
            // 4. Update storage stats

            console.log('Storage cleanup completed');
        } catch (error) {
            console.error('Error during cleanup:', error);
        } finally {
            setIsCleaning(false);
        }
    }, []);

    const handleDeleteItem = useCallback(async (item: StorageItem) => {
        try {
            // Simulate item deletion
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real implementation, this would delete the item from storage
            console.log('Deleted item:', item.id);
            setShowDeleteDialog(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }, []);

    const getStoragePercentage = () => {
        return Math.round((storageStats.used / storageStats.total) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Storage Overview */}
            <SettingsCard
                title="Visão Geral do Armazenamento"
                description="Informações sobre seu uso de armazenamento"
            >
                <div className="space-y-6">
                    {/* Main Storage Bar */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Espaço Utilizado
                            </span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatSize(storageStats.used)} de {formatSize(storageStats.total)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div
                                className={cn(
                                    "h-4 rounded-full transition-all duration-300",
                                    getStoragePercentage() > 80
                                        ? "bg-red-500"
                                        : getStoragePercentage() > 60
                                            ? "bg-yellow-500"
                                            : "bg-teal-500"
                                )}
                                style={{ width: `${getStoragePercentage()}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatSize(storageStats.available)} disponíveis
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {getStoragePercentage()}% utilizado
                            </span>
                        </div>
                    </div>

                    {/* Storage Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatSize(storageStats.breakdown.notes)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Notas</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <CheckSquare className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatSize(storageStats.breakdown.tasks)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Tarefas</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatSize(storageStats.breakdown.events)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Eventos</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatSize(storageStats.breakdown.jots)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Jots</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <HardDrive className="w-6 h-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatSize(storageStats.breakdown.attachments)}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Anexos</div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Storage Management */}
            <SettingsCard
                title="Gerenciamento de Armazenamento"
                description="Ferramentas para otimizar seu espaço de armazenamento"
            >
                <div className="space-y-4">
                    <SettingsToggle
                        label="Limpeza Automática"
                        description="Remover automaticamente itens antigos não acessados"
                        checked={autoCleanup}
                        onChange={setAutoCleanup}
                    />

                    {autoCleanup && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Período de Retenção (dias)
                            </label>
                            <input
                                type="number"
                                min="7"
                                max="365"
                                value={retentionDays}
                                onChange={(e) => setRetentionDays(parseInt(e.target.value) || 365)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Itens não acessados há mais de {retentionDays} dias serão removidos
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <SettingsButton
                            variant="primary"
                            onClick={handleCleanup}
                            disabled={isCleaning}
                            loading={isCleaning}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {isCleaning ? 'Limpando...' : 'Limpar Armazenamento'}
                        </SettingsButton>
                        <SettingsButton
                            variant="secondary"
                            onClick={() => {
                                // In a real implementation, this would open a detailed storage analysis
                                console.log('Analyze storage');
                            }}
                        >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Analisar Uso
                        </SettingsButton>
                    </div>
                </div>
            </SettingsCard>

            {/* Storage Items List */}
            <SettingsCard
                title="Itens de Armazenamento"
                description="Visualize e gerencie itens individuais no seu armazenamento"
            >
                <div className="space-y-3">
                    {storageItems.map((item) => {
                        const Icon = getTypeIcon(item.type);
                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Icon className={cn("w-5 h-5 flex-shrink-0", getTypeColor(item.type))} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {item.name}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{getTypeLabel(item.type)}</span>
                                            <span>{formatSize(item.size)}</span>
                                            <span>Criado: {formatDate(item.createdAt)}</span>
                                            <span>Acessado: {formatDate(item.lastAccessed)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <SettingsButton
                                        variant="danger"
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setShowDeleteDialog(true);
                                        }}
                                        className="text-xs px-3 py-1"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Excluir
                                    </SettingsButton>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {storageItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum item encontrado</p>
                        <p className="text-sm mt-2">Seu armazenamento está vazio</p>
                    </div>
                )}
            </SettingsCard>

            {/* Storage Tips */}
            <SettingsCard
                title="Dicas de Armazenamento"
                description="Sugestões para otimizar seu uso de armazenamento"
            >
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Anexos Grandes
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                Anexos grandes ocupam mais espaço. Considere compactar imagens antes de fazer upload.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                Limpeza Regular
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                Remova itens antigos e não utilizados regularmente para liberar espaço.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                Backup em Nuvem
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Faça backup regularmente e mantenha apenas dados essenciais no dispositivo.
                            </p>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedItem(null);
                }}
                onConfirm={() => selectedItem && handleDeleteItem(selectedItem)}
                title="Excluir Item"
                message={`Tem certeza que deseja excluir "${selectedItem?.name}"? Esta ação não pode ser desfeita.`}
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};