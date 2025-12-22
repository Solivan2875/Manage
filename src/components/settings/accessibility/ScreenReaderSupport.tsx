import { useState, useCallback } from 'react';
import { Volume2, Eye, Navigation, Mic, AlertCircle, CheckCircle } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsToggle } from '../shared/SettingsToggle';
import { SettingsSelect } from '../shared/SettingsSelect';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { cn } from '../../../lib/utils';

interface ScreenReaderFeature {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    category: 'navigation' | 'content' | 'interaction' | 'announcements';
}

export const ScreenReaderSupport: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const [showTestDialog, setShowTestDialog] = useState(false);
    const [testResults, setTestResults] = useState<string[]>([]);

    const [features, setFeatures] = useState<ScreenReaderFeature[]>([
        {
            id: 'aria-labels',
            name: 'Rótulos ARIA',
            description: 'Fornece descrições textuais para elementos interativos',
            enabled: true,
            category: 'content'
        },
        {
            id: 'live-regions',
            name: 'Regiões ARIA Live',
            description: 'Anuncia mudanças dinâmicas de conteúdo',
            enabled: true,
            category: 'announcements'
        },
        {
            id: 'keyboard-navigation',
            name: 'Navegação por Teclado',
            description: 'Suporte completo para navegação sem mouse',
            enabled: true,
            category: 'navigation'
        },
        {
            id: 'focus-indicators',
            name: 'Indicadores de Foco',
            description: 'Indicadores visuais claros para elemento focado',
            enabled: true,
            category: 'navigation'
        },
        {
            id: 'semantic-markup',
            name: 'Marcação Semântica',
            description: 'Usa tags HTML5 apropriadas para estrutura',
            enabled: true,
            category: 'content'
        },
        {
            id: 'alt-text',
            name: 'Texto Alternativo',
            description: 'Descrições para imagens e elementos visuais',
            enabled: true,
            category: 'content'
        },
        {
            id: 'error-announcements',
            name: 'Anúncios de Erro',
            description: 'Notificações verbais para mensagens de erro',
            enabled: true,
            category: 'announcements'
        },
        {
            id: 'success-announcements',
            name: 'Anúncios de Sucesso',
            description: 'Confirmações verbais para ações concluídas',
            enabled: true,
            category: 'announcements'
        }
    ]);

    const announcementSpeedOptions = [
        { value: 'fast', label: 'Rápida', description: 'Anúncios mais rápidos' },
        { value: 'normal', label: 'Normal', description: 'Velocidade padrão' },
        { value: 'slow', label: 'Lenta', description: 'Anúncios mais lentos e claros' }
    ];

    const handleFeatureToggle = useCallback((featureId: string, enabled: boolean) => {
        setFeatures(prev => prev.map(feature =>
            feature.id === featureId ? { ...feature, enabled } : feature
        ));
    }, []);

    const handleScreenReaderToggle = useCallback((enabled: boolean) => {
        updateSettings({ screenReader: enabled });
    }, [updateSettings]);

    const handleAnnouncementSpeedChange = useCallback((speed: string) => {
        // In a real implementation, this would update announcement speed
        console.log('Announcement speed:', speed);
    }, []);

    const runAccessibilityTest = useCallback(() => {
        const results = [];

        // Test 1: Heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length > 0) {
            results.push('✓ Estrutura de cabeçalhos encontrada');
        } else {
            results.push('✗ Nenhum cabeçalho encontrado');
        }

        // Test 2: ARIA labels
        const buttons = document.querySelectorAll('button[aria-label], button[aria-labelledby]');
        if (buttons.length > 0) {
            results.push('✓ Botões com rótulos ARIA encontrados');
        } else {
            results.push('⚠ Alguns botões podem não ter rótulos descritivos');
        }

        // Test 3: Alt text
        const images = document.querySelectorAll('img[alt]');
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imagesWithoutAlt.length === 0) {
            results.push('✓ Todas as imagens possuem texto alternativo');
        } else {
            results.push(`⚠ ${imagesWithoutAlt.length} imagens sem texto alternativo`);
        }

        // Test 4: Focus management
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            results.push('✓ Elementos focalizáveis encontrados');
        } else {
            results.push('⚠ Verifique elementos focalizáveis');
        }

        setTestResults(results);
        setShowTestDialog(true);
    }, []);

    const categoryIcons = {
        navigation: Navigation,
        content: Eye,
        interaction: Mic,
        announcements: Volume2
    };

    const categoryLabels = {
        navigation: 'Navegação',
        content: 'Conteúdo',
        interaction: 'Interação',
        announcements: 'Anúncios'
    };

    const groupedFeatures = features.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {} as Record<string, ScreenReaderFeature[]>);

    return (
        <div className="space-y-6">
            {/* Main Screen Reader Toggle */}
            <SettingsCard
                title="Suporte a Leitor de Tela"
                description="Ative otimizações para leitores de tela"
            >
                <div className="space-y-4">
                    <SettingsToggle
                        label="Modo Leitor de Tela"
                        description="Otimiza a interface para tecnologias assistivas"
                        checked={settings.screenReader}
                        onChange={handleScreenReaderToggle}
                    />

                    {settings.screenReader && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                        Modo Leitor de Tela Ativado
                                    </p>
                                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                        A interface está otimizada para leitores de tela como NVDA, JAWS e VoiceOver.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsCard>

            {/* Features by Category */}
            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                return (
                    <SettingsCard
                        key={category}
                        title={`Recursos de ${categoryLabels[category as keyof typeof categoryLabels]}`}
                        description={`Configure recursos relacionados a ${categoryLabels[category as keyof typeof categoryLabels].toLowerCase()}`}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {categoryLabels[category as keyof typeof categoryLabels]}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Recursos essenciais para acessibilidade
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {categoryFeatures.map((feature) => (
                                    <div
                                        key={feature.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {feature.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {feature.description}
                                            </p>
                                        </div>
                                        <button
                                            className={cn(
                                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
                                                feature.enabled
                                                    ? "bg-teal-600"
                                                    : "bg-gray-200 dark:bg-gray-700"
                                            )}
                                            onClick={() => handleFeatureToggle(feature.id, !feature.enabled)}
                                        >
                                            <span className={cn(
                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                feature.enabled ? "translate-x-6" : "translate-x-1"
                                            )} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SettingsCard>
                );
            })}

            {/* Announcement Settings */}
            {settings.screenReader && (
                <SettingsCard
                    title="Configurações de Anúncios"
                    description="Controle como as informações são anunciadas"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Velocidade dos Anúncios
                            </label>
                            <select
                                defaultValue="normal"
                                onChange={(e) => handleAnnouncementSpeedChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                {announcementSpeedOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Ajusta a velocidade dos anúncios verbais
                            </p>
                        </div>

                        <SettingsToggle
                            label="Anúncios Detalhados"
                            description="Fornece informações mais detalhadas nos anúncios"
                            checked={true}
                            onChange={() => { }}
                        />

                        <SettingsToggle
                            label="Anúncios de Contexto"
                            description="Anuncia mudanças de contexto e navegação"
                            checked={true}
                            onChange={() => { }}
                        />
                    </div>
                </SettingsCard>
            )}

            {/* Testing Tools */}
            <SettingsCard
                title="Ferramentas de Teste"
                description="Verifique a acessibilidade da interface"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Teste de Acessibilidade
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Verifique automaticamente recursos de acessibilidade na página atual
                                </p>
                            </div>
                        </div>
                    </div>

                    <SettingsButton
                        variant="primary"
                        onClick={runAccessibilityTest}
                        className="w-full sm:w-auto"
                    >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Executar Teste de Acessibilidade
                    </SettingsButton>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Leitores Compatíveis
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• NVDA</li>
                                <li>• JAWS</li>
                                <li>• VoiceOver</li>
                                <li>• TalkBack</li>
                                <li>• Narrator</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Navegação por Teclado
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• Tab: Próximo elemento</li>
                                <li>• Shift+Tab: Elemento anterior</li>
                                <li>• Enter: Ativar botão/link</li>
                                <li>• Espaço: Marcar/desmarcar</li>
                                <li>• Setas: Navegar opções</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Test Results Dialog */}
            <ConfirmDialog
                isOpen={showTestDialog}
                onClose={() => setShowTestDialog(false)}
                onConfirm={() => setShowTestDialog(false)}
                title="Resultados do Teste de Acessibilidade"
                message="Teste de acessibilidade concluído. Verifique o console para detalhes."
                confirmText="OK"
                cancelText=""
                variant="info"
            />
        </div>
    );
};
