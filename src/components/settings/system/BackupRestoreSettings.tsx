import { useState, useCallback } from 'react';
import { Download, Upload, RefreshCw, Calendar, Trash2, AlertTriangle } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsToggle } from '../shared/SettingsToggle';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { cn } from '../../../lib/utils';

interface BackupInfo {
    id: string;
    date: string;
    size: string;
    type: 'manual' | 'automatic';
}

export const BackupRestoreSettings: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
    const [backupFile, setBackupFile] = useState<File | null>(null);

    // Mock backup data - in a real app, this would come from the backend
    const [backups] = useState<BackupInfo[]>([
        {
            id: '1',
            date: '2024-01-15T10:30:00Z',
            size: '2.4 MB',
            type: 'automatic'
        },
        {
            id: '2',
            date: '2024-01-10T15:45:00Z',
            size: '2.1 MB',
            type: 'manual'
        },
        {
            id: '3',
            date: '2024-01-05T09:20:00Z',
            size: '1.8 MB',
            type: 'automatic'
        }
    ]);

    const handleCreateBackup = useCallback(async () => {
        setIsCreatingBackup(true);
        try {
            // Simulate backup creation
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real implementation, this would:
            // 1. Collect all user data
            // 2. Create a backup file
            // 3. Store it locally or in the cloud
            // 4. Update the backups list

            // For demo purposes, we'll create a simple JSON backup
            const backupData = {
                settings,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };

            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `maxnote-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error creating backup:', error);
        } finally {
            setIsCreatingBackup(false);
        }
    }, [settings]);

    const handleRestoreBackup = useCallback(async () => {
        if (!backupFile || !selectedBackup) return;

        setIsRestoring(true);
        try {
            // Simulate restore process
            await new Promise(resolve => setTimeout(resolve, 3000));

            // In a real implementation, this would:
            // 1. Validate the backup file
            // 2. Parse the backup data
            // 3. Restore user settings and data
            // 4. Handle conflicts and data migration

            setShowRestoreDialog(false);
            setBackupFile(null);
            setSelectedBackup(null);

        } catch (error) {
            console.error('Error restoring backup:', error);
        } finally {
            setIsRestoring(false);
        }
    }, [backupFile, selectedBackup]);

    const handleDeleteBackup = useCallback(async (backupId: string) => {
        try {
            // In a real implementation, this would delete the backup from storage
            console.log('Deleting backup:', backupId);
            setShowDeleteDialog(false);
            setSelectedBackup(null);
        } catch (error) {
            console.error('Error deleting backup:', error);
        }
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setBackupFile(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Backup Settings */}
            <SettingsCard
                title="Configurações de Backup"
                description="Configure como seus dados são salvos automaticamente"
            >
                <div className="space-y-4">
                    <SettingsToggle
                        label="Backup Automático"
                        description="Cria backups automáticos dos seus dados regularmente"
                        checked={settings.autoBackup}
                        onChange={(checked) => updateSettings({ autoBackup: checked })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Frequência do Backup
                            </label>
                            <select
                                value="daily"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                onChange={(e) => {
                                    // In a real implementation, this would update the backup frequency
                                    console.log('Backup frequency:', e.target.value);
                                }}
                            >
                                <option value="daily">Diariamente</option>
                                <option value="weekly">Semanalmente</option>
                                <option value="monthly">Mensalmente</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Retenção de Backups
                            </label>
                            <select
                                value="30"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                onChange={(e) => {
                                    // In a real implementation, this would update the retention period
                                    console.log('Backup retention:', e.target.value);
                                }}
                            >
                                <option value="7">7 dias</option>
                                <option value="30">30 dias</option>
                                <option value="90">90 dias</option>
                                <option value="365">1 ano</option>
                            </select>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Manual Backup */}
            <SettingsCard
                title="Backup Manual"
                description="Crie um backup completo dos seus dados agora"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Crie um backup completo de todas as suas notas, tarefas e configurações
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Último backup: {formatDate(backups[0]?.date || new Date().toISOString())}
                        </p>
                    </div>
                    <SettingsButton
                        variant="primary"
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                        loading={isCreatingBackup}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isCreatingBackup ? 'Criando...' : 'Criar Backup'}
                    </SettingsButton>
                </div>
            </SettingsCard>

            {/* Backup History */}
            <SettingsCard
                title="Histórico de Backups"
                description="Visualize e gerencie seus backups anteriores"
            >
                <div className="space-y-3">
                    {backups.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhum backup encontrado</p>
                            <p className="text-sm mt-2">Crie seu primeiro backup acima</p>
                        </div>
                    ) : (
                        backups.map((backup) => (
                            <div
                                key={backup.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        backup.type === 'automatic' ? 'bg-blue-500' : 'bg-green-500'
                                    )} />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(backup.date)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {backup.size} • {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <SettingsButton
                                        variant="secondary"
                                        onClick={() => {
                                            setSelectedBackup(backup);
                                            setShowRestoreDialog(true);
                                        }}
                                        className="text-xs px-3 py-1"
                                    >
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        Restaurar
                                    </SettingsButton>
                                    <SettingsButton
                                        variant="danger"
                                        onClick={() => {
                                            setSelectedBackup(backup);
                                            setShowDeleteDialog(true);
                                        }}
                                        className="text-xs px-3 py-1"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Excluir
                                    </SettingsButton>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SettingsCard>

            {/* Restore from File */}
            <SettingsCard
                title="Restaurar do Arquivo"
                description="Carregue um arquivo de backup para restaurar seus dados"
            >
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Arraste um arquivo de backup aqui ou clique para selecionar
                        </p>
                        <input
                            type="file"
                            accept=".json,.backup"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="backup-file-input"
                        />
                        <label
                            htmlFor="backup-file-input"
                            className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-colors"
                        >
                            Selecionar Arquivo
                        </label>
                        {backupFile && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {backupFile.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {(backupFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        )}
                    </div>

                    {backupFile && (
                        <SettingsButton
                            variant="primary"
                            onClick={() => setShowRestoreDialog(true)}
                            disabled={isRestoring}
                            loading={isRestoring}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {isRestoring ? 'Restaurando...' : 'Restaurar Backup'}
                        </SettingsButton>
                    )}
                </div>
            </SettingsCard>

            {/* Restore Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showRestoreDialog}
                onClose={() => {
                    setShowRestoreDialog(false);
                    setBackupFile(null);
                    setSelectedBackup(null);
                }}
                onConfirm={handleRestoreBackup}
                title="Restaurar Backup"
                message="Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos. Esta ação não pode ser desfeita."
                confirmText="Restaurar"
                cancelText="Cancelar"
                variant="warning"
                loading={isRestoring}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedBackup(null);
                }}
                onConfirm={() => selectedBackup && handleDeleteBackup(selectedBackup.id)}
                title="Excluir Backup"
                message="Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};