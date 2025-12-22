import { useState, useCallback } from 'react';
import { Smartphone, Monitor, Globe, Code, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { cn } from '../../../lib/utils';

interface SystemInfo {
    appVersion: string;
    buildNumber: string;
    platform: string;
    browser: string;
    language: string;
    timezone: string;
    lastUpdate: string;
    updateAvailable: boolean;
}

export const AppInfo: React.FC = () => {
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

    // Mock system info - in a real app, this would come from the app state
    const [systemInfo] = useState<SystemInfo>({
        appVersion: '1.0.0',
        buildNumber: '2024.01.15.001',
        platform: navigator.platform || 'Desconhecido',
        browser: getBrowserInfo(),
        language: navigator.language || 'Desconhecido',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Desconhecido',
        lastUpdate: '2024-01-15',
        updateAvailable: false
    });

    function getBrowserInfo(): string {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Desconhecido';
    }

    const handleCheckUpdate = useCallback(async () => {
        setIsCheckingUpdate(true);
        try {
            // Simulate update check
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real implementation, this would:
            // 1. Check for updates against a server
            // 2. Download update if available
            // 3. Prompt user to install

            setShowUpdateDialog(true);
        } catch (error) {
            console.error('Error checking for updates:', error);
        } finally {
            setIsCheckingUpdate(false);
        }
    }, []);

    const handleInstallUpdate = useCallback(async () => {
        try {
            // Simulate update installation
            await new Promise(resolve => setTimeout(resolve, 3000));

            // In a real implementation, this would:
            // 1. Download the update
            // 2. Install the update
            // 3. Restart the application

            setShowUpdateDialog(false);
        } catch (error) {
            console.error('Error installing update:', error);
        }
    }, []);

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* App Version Info */}
            <SettingsCard
                title="Informações do Aplicativo"
                description="Detalhes sobre a versão atual do MaxNote"
            >
                <div className="space-y-6">
                    {/* Version Display */}
                    <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/30 rounded-xl">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">M</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            MaxNote
                        </h2>
                        <div className="space-y-2">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                Versão {systemInfo.appVersion}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Build {systemInfo.buildNumber}
                            </div>
                            {systemInfo.updateAvailable && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                                    <AlertCircle className="w-4 h-4" />
                                    Atualização Disponível
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Update Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SettingsButton
                            variant="primary"
                            onClick={handleCheckUpdate}
                            disabled={isCheckingUpdate}
                            loading={isCheckingUpdate}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {isCheckingUpdate ? 'Verificando...' : 'Verificar Atualizações'}
                        </SettingsButton>
                        <SettingsButton
                            variant="secondary"
                            onClick={() => window.open('https://maxnote.com/releases', '_blank')}
                        >
                            Histórico de Versões
                        </SettingsButton>
                    </div>
                </div>
            </SettingsCard>

            {/* System Information */}
            <SettingsCard
                title="Informações do Sistema"
                description="Detalhes técnicos sobre seu ambiente"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Platform Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Ambiente
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Plataforma
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {systemInfo.platform}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Navegador
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {systemInfo.browser}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Idioma
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {systemInfo.language}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Code className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Fuso Horário
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {systemInfo.timezone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* App Stats */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Estatísticas
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Última Atualização
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatDate(systemInfo.lastUpdate)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Dias em Uso
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        127
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Notas Criadas
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        1,234
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Tarefas Concluídas
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        892
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Update Dialog */}
            <ConfirmDialog
                isOpen={showUpdateDialog}
                onClose={() => setShowUpdateDialog(false)}
                onConfirm={handleInstallUpdate}
                title="Atualização Disponível"
                message="MaxNote 1.1.0 está disponível com correções de bugs e melhorias de performance."
                confirmText="Instalar Atualização"
                cancelText="Agora Não"
                variant="success"
            />
        </div>
    );
};