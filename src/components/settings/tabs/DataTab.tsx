import { useState } from 'react';
import { Database, Download, HardDrive, Trash2, AlertTriangle } from 'lucide-react';
import { DataExport } from '../data/DataExport';
import { StorageManagement } from '../data/StorageManagement';
import { AccountDeletion } from '../data/AccountDeletion';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { cn } from '../../../lib/utils';

type DataSection = 'overview' | 'export' | 'storage' | 'deletion';

export const DataTab: React.FC = () => {
    const [activeSection, setActiveSection] = useState<DataSection>('overview');

    const sections = [
        {
            id: 'overview' as DataSection,
            title: 'Visão Geral',
            description: 'Resumo do uso de dados e informações da conta',
            icon: Database,
            component: null
        },
        {
            id: 'export' as DataSection,
            title: 'Exportar Dados',
            description: 'Exporte seus dados em diferentes formatos',
            icon: Download,
            component: DataExport
        },
        {
            id: 'storage' as DataSection,
            title: 'Gerenciamento de Armazenamento',
            description: 'Analise e gerencie seu espaço de armazenamento',
            icon: HardDrive,
            component: StorageManagement
        },
        {
            id: 'deletion' as DataSection,
            title: 'Exclusão de Conta',
            description: 'Exclua permanentemente sua conta e dados',
            icon: Trash2,
            component: AccountDeletion
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
                            {/* Data Overview Card */}
                            <SettingsCard
                                title="Resumo de Dados"
                                description="Informações sobre seu uso de dados e armazenamento"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            1,234
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Notas
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            567
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Tarefas
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            89
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Eventos
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            2.4 GB
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Armazenamento
                                        </div>
                                    </div>
                                </div>
                            </SettingsCard>

                            {/* Storage Breakdown */}
                            <SettingsCard
                                title="Uso de Armazenamento"
                                description="Detalhamento do espaço utilizado por tipo de conteúdo"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Notas
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            856 MB
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Tarefas
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            432 MB
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Eventos
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            234 MB
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Anexos
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            878 MB
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '37%' }}></div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Total Utilizado
                                        </span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            2.4 GB de 5 GB
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2">
                                        <div className="bg-teal-500 h-3 rounded-full" style={{ width: '48%' }}></div>
                                    </div>
                                </div>
                            </SettingsCard>

                            {/* Quick Actions */}
                            <SettingsCard
                                title="Ações Rápidas"
                                description="Ações comuns para gerenciamento de dados"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <SettingsButton
                                        variant="primary"
                                        onClick={() => setActiveSection('export')}
                                        className="justify-center"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Exportar Dados
                                    </SettingsButton>
                                    <SettingsButton
                                        variant="secondary"
                                        onClick={() => setActiveSection('storage')}
                                        className="justify-center"
                                    >
                                        <HardDrive className="w-4 h-4 mr-2" />
                                        Gerenciar Armazenamento
                                    </SettingsButton>
                                    <SettingsButton
                                        variant="danger"
                                        onClick={() => setActiveSection('deletion')}
                                        className="justify-center"
                                    >
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Excluir Conta
                                    </SettingsButton>
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