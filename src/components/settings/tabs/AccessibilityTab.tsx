import { useState } from 'react';
import { Accessibility, Eye, Keyboard, Volume2 } from 'lucide-react';
import { DisplaySettings } from '../accessibility/DisplaySettings';
import { KeyboardShortcuts } from '../accessibility/KeyboardShortcuts';
import { ScreenReaderSupport } from '../accessibility/ScreenReaderSupport';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { cn } from '../../../lib/utils';

type AccessibilitySection = 'overview' | 'display' | 'keyboard' | 'screenreader';

export const AccessibilityTab: React.FC = () => {
    const [activeSection, setActiveSection] = useState<AccessibilitySection>('overview');

    const sections = [
        {
            id: 'overview' as AccessibilitySection,
            title: 'Visão Geral',
            description: 'Resumo das configurações de acessibilidade',
            icon: Accessibility,
            component: null
        },
        {
            id: 'display' as AccessibilitySection,
            title: 'Configurações de Exibição',
            description: 'Ajuste o tamanho da fonte, contraste e movimento',
            icon: Eye,
            component: DisplaySettings
        },
        {
            id: 'keyboard' as AccessibilitySection,
            title: 'Atalhos de Teclado',
            description: 'Configure atalhos personalizados e navegação',
            icon: Keyboard,
            component: KeyboardShortcuts
        },
        {
            id: 'screenreader' as AccessibilitySection,
            title: 'Suporte a Leitores de Tela',
            description: 'Otimizações para leitores de tela',
            icon: Volume2,
            component: ScreenReaderSupport
        }
    ];

    const currentSection = sections.find(s => s.id === activeSection);
    const CurrentComponent = currentSection?.component;

    return (
        <div className="space-y-6">
            {/* Section Navigation */}
            <div className="flex flex-col lg:flex-row gap-4">
                <nav className="lg:w-64 flex-shrink-0">
                    <div className="space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left",
                                        activeSection === section.id
                                            ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-l-4 border-teal-600"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                    )}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium">{section.title}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {section.description}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {activeSection === 'overview' && (
                        <div className="space-y-6">
                            {/* Accessibility Overview Card */}
                            <SettingsCard
                                title="Configurações de Acessibilidade"
                                description="Personalize o MaxNote para atender às suas necessidades de acessibilidade"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Eye className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Exibição
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Ajuste o tamanho da fonte, contraste e redução de movimento
                                        </p>
                                        <SettingsButton
                                            variant="primary"
                                            onClick={() => setActiveSection('display')}
                                            className="w-full"
                                        >
                                            Configurar
                                        </SettingsButton>
                                    </div>

                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Keyboard className="w-8 h-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Teclado
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Configure atalhos personalizados e navegação por teclado
                                        </p>
                                        <SettingsButton
                                            variant="primary"
                                            onClick={() => setActiveSection('keyboard')}
                                            className="w-full"
                                        >
                                            Configurar
                                        </SettingsButton>
                                    </div>

                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Volume2 className="w-8 h-8 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Leitor de Tela
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Otimize a experiência para leitores de tela
                                        </p>
                                        <SettingsButton
                                            variant="primary"
                                            onClick={() => setActiveSection('screenreader')}
                                            className="w-full"
                                        >
                                            Configurar
                                        </SettingsButton>
                                    </div>

                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Accessibility className="w-8 h-8 mx-auto mb-3 text-teal-600 dark:text-teal-400" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Geral
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Configurações gerais de acessibilidade
                                        </p>
                                        <div className="space-y-2">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                <div className="flex justify-between">
                                                    <span>Tema:</span>
                                                    <span>Sistema</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Tamanho da fonte:</span>
                                                    <span>Médio</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Alto contraste:</span>
                                                    <span>Desativado</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SettingsCard>

                            {/* Quick Settings */}
                            <SettingsCard
                                title="Configurações Rápidas"
                                description="Ajustes mais comuns de acessibilidade"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                Alto Contraste
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Aumenta o contraste para melhor legibilidade
                                            </p>
                                        </div>
                                        <button
                                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                            onClick={() => {
                                                // In a real implementation, this would toggle high contrast
                                                console.log('Toggle high contrast');
                                            }}
                                        >
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                Reduzir Movimento
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Reduz animações e transições
                                            </p>
                                        </div>
                                        <button
                                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                            onClick={() => {
                                                // In a real implementation, this would toggle motion reduction
                                                console.log('Toggle motion reduction');
                                            }}
                                        >
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                Tamanho da Fonte
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Ajusta o tamanho do texto em todo o aplicativo
                                            </p>
                                        </div>
                                        <select
                                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            onChange={(e) => {
                                                // In a real implementation, this would change font size
                                                console.log('Font size:', e.target.value);
                                            }}
                                        >
                                            <option value="small">Pequeno</option>
                                            <option value="medium" selected>Médio</option>
                                            <option value="large">Grande</option>
                                        </select>
                                    </div>
                                </div>
                            </SettingsCard>

                            {/* Accessibility Tips */}
                            <SettingsCard
                                title="Dicas de Acessibilidade"
                                description="Sugestões para melhorar sua experiência"
                            >
                                <div className="space-y-3">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                            Navegação por Teclado
                                        </h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Use a tecla Tab para navegar entre elementos e Enter para ativar botões e links.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                                            Atalhos Globais
                                        </h4>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Pressione Ctrl+K para abrir a busca de configurações rapidamente.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                                            Suporte a Leitores de Tela
                                        </h4>
                                        <p className="text-sm text-purple-700 dark:text-purple-300">
                                            O MaxNote é compatível com leitores de tela populares como NVDA, JAWS e VoiceOver.
                                        </p>
                                    </div>
                                </div>
                            </SettingsCard>
                        </div>
                    )}

                    {CurrentComponent && <CurrentComponent />}
                </div>
            </div>
        </div>
    );
};