import { useState, useMemo } from 'react';
import { Calendar, Tag, Zap, Star, AlertTriangle, CheckCircle, Download, Code, RefreshCw, Shield } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsSelect } from '../shared/SettingsSelect';
import { SettingsToggle } from '../shared/SettingsToggle';
import { cn } from '../../../lib/utils';

interface ChangelogEntry {
    id: string;
    version: string;
    date: string;
    type: 'major' | 'minor' | 'patch' | 'hotfix';
    title: string;
    description: string;
    features: string[];
    breaking: string[];
    fixes: string[];
    improvements: string[];
    author: string;
}

export const Changelog: React.FC = () => {
    const [selectedVersion, setSelectedVersion] = useState<string>('all');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    const changelog: ChangelogEntry[] = [
        {
            id: '1.2.0',
            version: '1.2.0',
            date: '2024-01-15',
            type: 'major',
            title: 'Interface de Configurações Completa',
            description: 'Nova página de configurações com seções de Perfil, Sistema, Dados, Acessibilidade e Sobre.',
            features: [
                'Página de configurações completa',
                'Gestão de dados e exportação',
                'Configurações de acessibilidade',
                'Seção Sobre com informações do aplicativo'
            ],
            breaking: [
                'Mudanças na estrutura de navegação',
                'Atualização de componentes compartilhados'
            ],
            fixes: [
                'Correção de bugs na sincronização',
                'Melhorias na performance de carregamento'
            ],
            improvements: [
                'Otimização de componentes',
                'Melhorias na acessibilidade',
                'Feedback visual aprimorado'
            ],
            author: 'Equipe MaxNote'
        },
        {
            id: '1.1.5',
            version: '1.1.5',
            date: '2024-01-10',
            type: 'minor',
            title: 'Melhorias de Acessibilidade e Backup',
            description: 'Novas funcionalidades de acessibilidade e sistema de backup automático.',
            features: [
                'Suporte a leitores de tela',
                'Configurações de alto contraste',
                'Atalhos de teclado personalizáveis',
                'Sistema de backup e restauração'
            ],
            breaking: [],
            fixes: [
                'Correção de bugs no editor de rich text',
                'Melhorias na navegação por teclado'
            ],
            improvements: [
                'Otimização de performance',
                'Interface mais responsiva'
            ],
            author: 'Equipe MaxNote'
        },
        {
            id: '1.1.0',
            version: '1.1.0',
            date: '2024-01-05',
            type: 'minor',
            title: 'Calendário Integrado e Jots',
            description: 'Novo módulo de calendário e notas rápidas.',
            features: [
                'Calendário completo com eventos',
                'Integração com notas e tarefas',
                'Jots para anotações rápidas',
                'Sincronização automática'
            ],
            breaking: [
                'Atualização na estrutura de dados',
                'Mudanças na API de armazenamento'
            ],
            fixes: [
                'Correção de bugs na renderização',
                'Melhorias na performance de busca'
            ],
            improvements: [
                'Otimização de componentes',
                'Melhorias na UX'
            ],
            author: 'Equipe MaxNote'
        },
        {
            id: '1.0.0',
            version: '1.0.0',
            date: '2023-12-20',
            type: 'major',
            title: 'Lançamento do MaxNote',
            description: 'Versão inicial do aplicativo com funcionalidades básicas.',
            features: [
                'Editor de rich text',
                'Gestão de notas',
                'Sistema de tags',
                'Interface responsiva'
            ],
            breaking: [],
            fixes: [
                'Estabilização geral',
                'Correções de bugs críticos'
            ],
            improvements: [
                'Performance otimizada',
                'UX focada na simplicidade'
            ],
            author: 'Equipe MaxNote'
        }
    ];

    const versionOptions = [
        { value: 'all', label: 'Todas as Versões' },
        { value: '1.2.0', label: 'v1.2.0 (Mais Recente)' },
        { value: '1.1.5', label: 'v1.1.5' },
        { value: '1.1.0', label: 'v1.1.0' },
        { value: '1.0.0', label: 'v1.0.0 (Lançamento)' }
    ];

    const filteredChangelog = useMemo(() => {
        if (selectedVersion === 'all') return changelog;
        return changelog.filter(entry => entry.version === selectedVersion);
    }, [selectedVersion]);

    const getTypeIcon = (type: ChangelogEntry['type']) => {
        switch (type) {
            case 'major':
                return AlertTriangle;
            case 'minor':
                return Star;
            case 'patch':
            case 'hotfix':
                return Zap;
            default:
                return CheckCircle;
        }
    };

    const getTypeColor = (type: ChangelogEntry['type']) => {
        switch (type) {
            case 'major':
                return 'text-red-600 dark:text-red-400';
            case 'minor':
                return 'text-blue-600 dark:text-blue-400';
            case 'patch':
            case 'hotfix':
                return 'text-yellow-600 dark:text-yellow-400';
            default:
                return 'text-green-600 dark:text-green-400';
        }
    };

    const getTypeLabel = (type: ChangelogEntry['type']) => {
        switch (type) {
            case 'major':
                return 'Atualização Principal';
            case 'minor':
                return 'Nova Funcionalidade';
            case 'patch':
                return 'Correção de Bugs';
            case 'hotfix':
                return 'Correção Crítica';
            default:
                return 'Melhoria';
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const exportChangelog = () => {
        const dataStr = JSON.stringify(filteredChangelog, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `maxnote-changelog-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Version Filter */}
            <SettingsCard
                title="Filtrar por Versão"
                description="Selecione uma versão específica ou veja todas"
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                        <SettingsSelect
                            value={selectedVersion}
                            onChange={setSelectedVersion}
                            options={versionOptions}
                        />
                    </div>
                    <div className="flex gap-2">
                        <SettingsButton
                            variant="secondary"
                            onClick={exportChangelog}
                            className="text-sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar Changelog
                        </SettingsButton>
                        <SettingsButton
                            variant="secondary"
                            onClick={() => window.open('https://github.com/maxnote/releases', '_blank')}
                            className="text-sm"
                        >
                            <Code className="w-4 h-4 mr-2" />
                            Ver no GitHub
                        </SettingsButton>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <SettingsToggle
                        label="Mostrar apenas Breaking Changes"
                        description="Oculta atualizações menores, focando apenas em mudanças quebrantes"
                        checked={showUnreadOnly}
                        onChange={setShowUnreadOnly}
                    />
                </div>
            </SettingsCard>

            {/* Changelog Entries */}
            <div className="space-y-6">
                {filteredChangelog.map((entry) => {
                    const Icon = getTypeIcon(entry.type);
                    return (
                        <SettingsCard
                            key={entry.id}
                            title={
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                                        getTypeColor(entry.type)
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {entry.version}
                                        </span>
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                            {getTypeLabel(entry.type)}
                                        </span>
                                    </div>
                                </div>
                            }
                            description={
                                <div className="space-y-4">
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                                        {entry.description}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Features */}
                                        {entry.features.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                    Novidades
                                                </h4>
                                                <ul className="space-y-2">
                                                    {entry.features.map((feature, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Breaking Changes */}
                                        {entry.breaking.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-red-900 dark:text-red-400 mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    Mudanças Quebrantes
                                                </h4>
                                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                    <p className="text-sm text-red-900 dark:text-red-100 mb-2">
                                                        <strong>Atenção:</strong> Esta versão contém mudanças que podem afetar sua experiência.
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {entry.breaking.map((change, index) => (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <RefreshCw className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                                <span className="text-sm text-red-700 dark:text-red-300">
                                                                    {change}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Fixes */}
                                        {entry.fixes.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-3 flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    Correções
                                                </h4>
                                                <ul className="space-y-2">
                                                    {entry.fixes.map((fix, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                                                {fix}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Improvements */}
                                        {entry.improvements.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-green-900 dark:text-green-400 mb-3 flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                    Melhorias
                                                </h4>
                                                <ul className="space-y-2">
                                                    {entry.improvements.map((improvement, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                                            <span className="text-sm text-green-700 dark:text-green-300">
                                                                {improvement}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            }
                            footer={
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {entry.author}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Lançado em {formatDate(entry.date)}
                                        </span>
                                    </div>
                                    <SettingsButton
                                        variant="secondary"
                                        onClick={() => window.open(`https://github.com/maxnote/releases/tag/v${entry.version}`, '_blank')}
                                        className="text-sm"
                                    >
                                        <Tag className="w-4 h-4 mr-2" />
                                        Ver Detalhes
                                    </SettingsButton>
                                </div>
                            }
                        />
                    );
                })}

                {filteredChangelog.length === 0 && (
                    <SettingsCard>
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-2">
                                Nenhuma versão encontrada
                            </p>
                            <p className="text-sm">
                                Tente selecionar outra versão ou ver todas as versões.
                            </p>
                        </div>
                    </SettingsCard>
                )}
            </div>

            {/* Download All */}
            <SettingsCard
                title="Baixar Todas as Versões"
                description="Obtenha todas as versões do MaxNote"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Versões Disponíveis
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                            Baixe versões anteriores do MaxNote para uso offline ou para testes específicos.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SettingsButton
                                variant="primary"
                                onClick={() => window.open('https://github.com/maxnote/releases', '_blank')}
                                className="justify-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Versões Anteriores
                            </SettingsButton>
                            <SettingsButton
                                variant="secondary"
                                onClick={() => window.open('https://maxnote.com/releases', '_blank')}
                                className="justify-center"
                            >
                                <Code className="w-4 h-4 mr-2" />
                                Notas de Versão
                            </SettingsButton>
                            <SettingsButton
                                variant="secondary"
                                onClick={() => window.open('https://maxnote.com/security', '_blank')}
                                className="justify-center"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                Informações de Segurança
                            </SettingsButton>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                            Recomendação
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            Recomendamos sempre usar a versão mais recente para obter as melhores funcionalidades
                            e correções de segurança disponíveis.
                        </p>
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
};