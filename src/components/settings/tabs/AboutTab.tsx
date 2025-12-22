import { useState } from 'react';
import { Info, Smartphone, Monitor, Globe, Code, Users, FileText } from 'lucide-react';
import { AppInfo } from '../about/AppInfo';
import { LicenseInfo } from '../about/LicenseInfo';
import { Credits } from '../about/Credits';
import { Changelog } from '../about/Changelog';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { cn } from '../../../lib/utils';

type AboutSection = 'overview' | 'appinfo' | 'license' | 'credits' | 'changelog';

export const AboutTab: React.FC = () => {
    const [activeSection, setActiveSection] = useState<AboutSection>('overview');

    const sections = [
        {
            id: 'overview' as AboutSection,
            title: 'Visão Geral',
            description: 'Informações básicas sobre o MaxNote',
            icon: Info,
            component: null
        },
        {
            id: 'appinfo' as AboutSection,
            title: 'Informações do Aplicativo',
            description: 'Versão e detalhes técnicos',
            icon: Smartphone,
            component: AppInfo
        },
        {
            id: 'license' as AboutSection,
            title: 'Licença',
            description: 'Informações de licenciamento',
            icon: FileText,
            component: LicenseInfo
        },
        {
            id: 'credits' as AboutSection,
            title: 'Créditos',
            description: 'Equipe e contribuidores',
            icon: Users,
            component: Credits
        },
        {
            id: 'changelog' as AboutSection,
            title: 'Registro de Mudanças',
            description: 'Histórico de atualizações',
            icon: Code,
            component: Changelog
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
                            {/* App Overview Card */}
                            <SettingsCard
                                title="Sobre o MaxNote"
                                description="Aplicativo de produtividade e organização"
                            >
                                <div className="space-y-6">
                                    {/* App Description */}
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                                            <span className="text-white text-2xl font-bold">M</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                            MaxNote
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                            Um aplicativo moderno de produtividade que combina notas, tarefas, eventos e ideias rápidas
                                            em uma interface intuitiva e poderosa.
                                        </p>
                                        <div className="flex justify-center gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">1.2K+</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Usuários</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">50K+</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Notas</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">10K+</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Tarefas</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Key Features */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            Recursos Principais
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Notas Ricas
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Editor avançado com formatação e mídia
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Monitor className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Gestão de Tarefas
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Organize e acompanhe suas tarefas facilmente
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Calendário Integrado
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Gerencie eventos e compromissos
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Smartphone className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Sincronização em Nuvem
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Acesse seus dados em qualquer dispositivo
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            Ações Rápidas
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <SettingsButton
                                                variant="primary"
                                                onClick={() => setActiveSection('appinfo')}
                                                className="justify-center"
                                            >
                                                <Info className="w-4 h-4 mr-2" />
                                                Ver Informações
                                            </SettingsButton>
                                            <SettingsButton
                                                variant="secondary"
                                                onClick={() => setActiveSection('credits')}
                                                className="justify-center"
                                            >
                                                <Users className="w-4 h-4 mr-2" />
                                                Ver Créditos
                                            </SettingsButton>
                                            <SettingsButton
                                                variant="secondary"
                                                onClick={() => setActiveSection('changelog')}
                                                className="justify-center"
                                            >
                                                <Code className="w-4 h-4 mr-2" />
                                                Ver Mudanças
                                            </SettingsButton>
                                        </div>
                                    </div>
                                </div>
                            </SettingsCard>

                            {/* System Info Card */}
                            <SettingsCard
                                title="Informações do Sistema"
                                description="Detalhes técnicos sobre sua instalação"
                            >
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                                Ambiente
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Navegador
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {navigator.userAgent.split(' ')[0] || 'Desconhecido'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Plataforma
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {navigator.platform || 'Desconhecida'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Idioma
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {navigator.language || 'Desconhecido'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                                Aplicativo
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Versão
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        1.0.0
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Build
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        2024.01.15
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Ambiente
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        Produção
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SettingsCard>

                            {/* Support Card */}
                            <SettingsCard
                                title="Suporte e Ajuda"
                                description="Encontre ajuda e recursos adicionais"
                            >
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SettingsButton
                                            variant="primary"
                                            onClick={() => window.open('https://maxnote.com/docs', '_blank')}
                                            className="justify-center"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            Documentação
                                        </SettingsButton>
                                        <SettingsButton
                                            variant="secondary"
                                            onClick={() => window.open('https://maxnote.com/support', '_blank')}
                                            className="justify-center"
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            Suporte
                                        </SettingsButton>
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