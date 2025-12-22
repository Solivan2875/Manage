import { useState } from 'react';
import { RefreshCw, Cloud, Download, Upload, Clock, Shield, Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SettingsCard, SettingsToggle, SettingsButton } from '../shared';
import type { UserSettings } from '../../../types/settings';

interface DataSyncSettingsProps {
    settings: UserSettings;
    onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
}

interface SyncStatus {
    lastSync: string;
    status: 'success' | 'error' | 'syncing' | 'pending';
    itemsToSync: number;
    conflicts: number;
}

export const DataSyncSettings: React.FC<DataSyncSettingsProps> = ({
    settings,
    onUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        lastSync: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        status: 'success',
        itemsToSync: 0,
        conflicts: 0,
    });
    const [formData, setFormData] = useState({
        autoSync: settings.autoSync,
        autoBackup: settings.autoBackup,
        syncInterval: 15, // minutes
        backupRetention: 30, // days
    });

    const handleToggleChange = (field: string, value: boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaveStatus('idle');
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaveStatus('idle');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate({
                autoSync: formData.autoSync,
                autoBackup: formData.autoBackup,
            });
            setSaveStatus('success');
            setIsEditing(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            autoSync: settings.autoSync,
            autoBackup: settings.autoBackup,
            syncInterval: 15,
            backupRetention: 30,
        });
        setIsEditing(false);
        setSaveStatus('idle');
    };

    const handleManualSync = async () => {
        setIsSyncing(true);
        setSyncStatus(prev => ({ ...prev, status: 'syncing' }));

        try {
            // Simulate sync process
            await new Promise(resolve => setTimeout(resolve, 2000));

            setSyncStatus({
                lastSync: new Date().toISOString(),
                status: 'success',
                itemsToSync: 0,
                conflicts: 0,
            });
        } catch (error) {
            setSyncStatus(prev => ({ ...prev, status: 'error' }));
        } finally {
            setIsSyncing(false);
        }
    };

    const formatLastSync = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 30) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return Check;
            case 'error':
                return X;
            case 'syncing':
                return RefreshCw;
            case 'pending':
                return Clock;
            default:
                return Clock;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'text-green-600 dark:text-green-400';
            case 'error':
                return 'text-red-600 dark:text-red-400';
            case 'syncing':
                return 'text-blue-600 dark:text-blue-400';
            case 'pending':
                return 'text-yellow-600 dark:text-yellow-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const StatusIcon = getStatusIcon(syncStatus.status);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Sincronização e Backup
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configure sincronização automática e backup de seus dados
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {saveStatus === 'success' && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Salvo</span>
                        </div>
                    )}

                    {saveStatus === 'error' && (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <X className="w-4 h-4" />
                            <span className="text-sm">Erro</span>
                        </div>
                    )}

                    {!isEditing ? (
                        <SettingsButton onClick={() => setIsEditing(true)}>
                            Editar
                        </SettingsButton>
                    ) : (
                        <div className="flex items-center gap-2">
                            <SettingsButton
                                variant="secondary"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                Cancelar
                            </SettingsButton>
                            <SettingsButton
                                onClick={handleSave}
                                loading={isSaving}
                            >
                                Salvar
                            </SettingsButton>
                        </div>
                    )}
                </div>
            </div>

            {/* Sync Status */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Cloud className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Status da Sincronização
                        </h4>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    syncStatus.status === 'success' && "bg-green-100 dark:bg-green-900/20",
                                    syncStatus.status === 'error' && "bg-red-100 dark:bg-red-900/20",
                                    syncStatus.status === 'syncing' && "bg-blue-100 dark:bg-blue-900/20",
                                    syncStatus.status === 'pending' && "bg-yellow-100 dark:bg-yellow-900/20"
                                )}>
                                    <StatusIcon className={cn(
                                        "w-5 h-5",
                                        getStatusColor(syncStatus.status)
                                    )} />
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                        {syncStatus.status === 'success' && 'Sincronizado'}
                                        {syncStatus.status === 'error' && 'Erro na Sincronização'}
                                        {syncStatus.status === 'syncing' && 'Sincronizando...'}
                                        {syncStatus.status === 'pending' && 'Sincronização Pendente'}
                                    </h5>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Última sincronização: {formatLastSync(syncStatus.lastSync)}
                                    </p>
                                </div>
                            </div>

                            <SettingsButton
                                onClick={handleManualSync}
                                loading={isSyncing}
                                variant="secondary"
                            >
                                <RefreshCw className={cn(
                                    "w-4 h-4 mr-1",
                                    isSyncing && "animate-spin"
                                )} />
                                Sincronizar Agora
                            </SettingsButton>
                        </div>

                        {syncStatus.conflicts > 0 && (
                            <div className="mt-4 flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                <div>
                                    <h6 className="font-medium text-yellow-900 dark:text-yellow-100">
                                        Conflitos Detectados
                                    </h6>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                        {syncStatus.conflicts} conflito{syncStatus.conflicts > 1 ? 's' : ''} encontrado{syncStatus.conflicts > 1 ? 's' : ''}.
                                        Resolva manualmente ou force a sincronização.
                                    </p>
                                </div>
                            </div>
                        )}

                        {syncStatus.itemsToSync > 0 && (
                            <div className="mt-4 flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <h6 className="font-medium text-blue-900 dark:text-blue-100">
                                        Itens Pendentes
                                    </h6>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        {syncStatus.itemsToSync} item{syncStatus.itemsToSync > 1 ? 's' : ''} aguardando sincronização.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SettingsCard>

            {/* Sync Settings */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Configurações de Sincronização
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <SettingsToggle
                            label="Sincronização Automática"
                            description="Sincronizar dados automaticamente em segundo plano"
                            checked={formData.autoSync}
                            onChange={(checked) => handleToggleChange('autoSync', checked)}
                            disabled={!isEditing}
                        />

                        {formData.autoSync && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Intervalo de Sincronização
                                </label>
                                <select
                                    value={formData.syncInterval}
                                    onChange={(e) => handleInputChange('syncInterval', parseInt(e.target.value))}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value={5}>A cada 5 minutos</option>
                                    <option value={15}>A cada 15 minutos</option>
                                    <option value={30}>A cada 30 minutos</option>
                                    <option value={60}>A cada hora</option>
                                    <option value={240}>A cada 4 horas</option>
                                    <option value={1440}>Diariamente</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </SettingsCard>

            {/* Backup Settings */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Configurações de Backup
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <SettingsToggle
                            label="Backup Automático"
                            description="Criar backups automáticos dos seus dados"
                            checked={formData.autoBackup}
                            onChange={(checked) => handleToggleChange('autoBackup', checked)}
                            disabled={!isEditing}
                        />

                        {formData.autoBackup && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Retenção de Backup
                                </label>
                                <select
                                    value={formData.backupRetention}
                                    onChange={(e) => handleInputChange('backupRetention', parseInt(e.target.value))}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value={7}>7 dias</option>
                                    <option value={15}>15 dias</option>
                                    <option value={30}>30 dias</option>
                                    <option value={60}>60 dias</option>
                                    <option value={90}>90 dias</option>
                                    <option value={365}>1 ano</option>
                                </select>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Backups mais antigos serão excluídos automaticamente
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Manual Backup Actions */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <SettingsButton
                                variant="secondary"
                                className="flex items-center justify-center gap-2"
                                onClick={() => { }}
                            >
                                <Download className="w-4 h-4" />
                                Baixar Backup
                            </SettingsButton>
                            <SettingsButton
                                variant="secondary"
                                className="flex items-center justify-center gap-2"
                                onClick={() => { }}
                            >
                                <Upload className="w-4 h-4" />
                                Restaurar Backup
                            </SettingsButton>
                        </div>
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
};