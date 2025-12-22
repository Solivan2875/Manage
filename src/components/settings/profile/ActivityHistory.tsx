import { useState, useMemo } from 'react';
import { Search, Filter, Download, Calendar, User, Settings, Database, Accessibility, ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SettingsButton, SettingsCard, SettingsSelect } from '../shared';
import type { ActivityLog } from '../../../types/settings';

interface ActivityHistoryProps {
    activities: ActivityLog[];
    onExport?: (filteredActivities: ActivityLog[]) => void;
}

const categoryIcons = {
    profile: User,
    system: Settings,
    data: Database,
    accessibility: Accessibility,
};

const categoryLabels = {
    profile: 'Perfil',
    system: 'Sistema',
    data: 'Dados',
    accessibility: 'Acessibilidade',
};

const actionLabels: Record<string, string> = {
    'profile.updated': 'Perfil atualizado',
    'profile.avatar_changed': 'Avatar alterado',
    'profile.privacy_updated': 'Configurações de privacidade alteradas',
    'system.theme_changed': 'Tema alterado',
    'system.language_changed': 'Idioma alterado',
    'system.notifications_updated': 'Notificações configuradas',
    'data.exported': 'Dados exportados',
    'data.backup_created': 'Backup criado',
    'data.sync_completed': 'Sincronização concluída',
    'accessibility.settings_updated': 'Configurações de acessibilidade atualizadas',
};

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({
    activities,
    onExport
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('7days');
    const [showFilters, setShowFilters] = useState(false);

    // Filter activities based on search, category, and date range
    const filteredActivities = useMemo(() => {
        let filtered = [...activities];

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(activity =>
                actionLabels[activity.action]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                activity.details?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(activity => activity.category === selectedCategory);
        }

        // Filter by date range
        const now = new Date();
        const cutoffDate = new Date();

        switch (dateRange) {
            case '1day':
                cutoffDate.setDate(now.getDate() - 1);
                break;
            case '7days':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case '30days':
                cutoffDate.setDate(now.getDate() - 30);
                break;
            case '90days':
                cutoffDate.setDate(now.getDate() - 90);
                break;
            default:
                cutoffDate.setFullYear(now.getFullYear() - 1);
        }

        filtered = filtered.filter(activity =>
            new Date(activity.timestamp) >= cutoffDate
        );

        // Sort by timestamp (newest first)
        filtered.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return filtered;
    }, [activities, searchQuery, selectedCategory, dateRange]);

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatRelativeTime = (timestamp: string) => {
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

        return formatDate(timestamp);
    };

    const handleExport = () => {
        if (onExport) {
            onExport(filteredActivities);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Histórico de Atividades
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Visualize e exporte seu histórico de atividades no MaxNote
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <SettingsButton
                        variant="secondary"
                        onClick={handleExport}
                        disabled={filteredActivities.length === 0}
                    >
                        <Download className="w-4 h-4 mr-1" />
                        Exportar
                    </SettingsButton>
                </div>
            </div>

            {/* Search and Filters */}
            <SettingsCard>
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar atividades..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                        <ChevronDown className={cn(
                            "w-4 h-4 transition-transform",
                            showFilters && "rotate-180"
                        )} />
                    </button>

                    {/* Expandable Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <SettingsSelect
                                    label="Categoria"
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    options={[
                                        { value: 'all', label: 'Todas as categorias' },
                                        { value: 'profile', label: 'Perfil' },
                                        { value: 'system', label: 'Sistema' },
                                        { value: 'data', label: 'Dados' },
                                        { value: 'accessibility', label: 'Acessibilidade' },
                                    ]}
                                />
                            </div>

                            <div>
                                <SettingsSelect
                                    label="Período"
                                    value={dateRange}
                                    onChange={setDateRange}
                                    options={[
                                        { value: '1day', label: 'Últimas 24 horas' },
                                        { value: '7days', label: 'Últimos 7 dias' },
                                        { value: '30days', label: 'Últimos 30 dias' },
                                        { value: '90days', label: 'Últimos 90 dias' },
                                        { value: '1year', label: 'Último ano' },
                                    ]}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </SettingsCard>

            {/* Activities List */}
            <SettingsCard>
                <div className="space-y-1">
                    {filteredActivities.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchQuery || selectedCategory !== 'all' || dateRange !== '7days'
                                    ? 'Nenhuma atividade encontrada com os filtros selecionados'
                                    : 'Nenhuma atividade registrada ainda'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredActivities.map((activity) => {
                            const Icon = categoryIcons[activity.category];
                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex-shrink-0">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            activity.category === 'profile' && "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                                            activity.category === 'system' && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
                                            activity.category === 'data' && "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
                                            activity.category === 'accessibility' && "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {actionLabels[activity.action] || activity.action}
                                                </p>
                                                {activity.details && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {activity.details}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatRelativeTime(activity.timestamp)}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    {categoryLabels[activity.category]}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {filteredActivities.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Mostrando {filteredActivities.length} atividade{filteredActivities.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </SettingsCard>
        </div>
    );
};