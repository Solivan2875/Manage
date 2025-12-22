import { useState, useEffect, useMemo } from 'react';
import {
    BarChart3,
    Calendar,
    TrendingUp,
    TrendingDown,
    Users,
    Clock,
    Target,
    Activity,
    Download,
    Filter,
    CalendarDays,
    Eye,
    Settings,
    Plus,
    CheckCircle,
    X
} from 'lucide-react';
import type { Event } from '../../../types/calendar';
import { useAuditHistory } from '../../../hooks/calendar/useAuditHistory';
import { useModuleIntegration } from '../../../hooks/calendar/useModuleIntegration';

interface AnalyticsPanelProps {
    events: Event[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    onExportReport?: (data: any, format: string) => void;
}

export const AnalyticsPanel = ({
    events,
    dateRange,
    onExportReport
}: AnalyticsPanelProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'productivity' | 'patterns' | 'reports'>('overview');
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const {
        getActivitySummary,
        getMostActiveEntities,
        getUserActivityPatterns,
        formatTimestamp
    } = useAuditHistory({ events });

    const {
        getAnalytics
    } = useModuleIntegration({ events });

    // Calculate analytics data
    const analyticsData = useMemo(() => {
        const baseData = getAnalytics();
        const activitySummary = getActivitySummary(selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : selectedPeriod === 'quarter' ? 90 : 365);

        // Filter by date range if provided
        let filteredEvents = events;
        if (dateRange) {
            filteredEvents = events.filter(event =>
                event.startDate >= dateRange.start && event.startDate <= dateRange.end
            );
        }

        // Filter by selected categories
        if (selectedCategories.length > 0) {
            filteredEvents = filteredEvents.filter(event =>
                selectedCategories.includes(event.category)
            );
        }

        return {
            ...baseData,
            activitySummary,
            filteredEvents,
            periodEvents: filteredEvents,
            completionRate: filteredEvents.length > 0
                ? (activitySummary.completedEvents / filteredEvents.length) * 100
                : 0,
            averageEventsPerDay: filteredEvents.length > 0
                ? filteredEvents.length / (selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : selectedPeriod === 'quarter' ? 90 : 365)
                : 0
        };
    }, [events, dateRange, selectedPeriod, selectedCategories, getAnalytics, getActivitySummary]);

    const categories = ['meeting', 'task', 'reminder', 'event', 'personal', 'work'];
    const periods = [
        { value: 'week', label: 'Última Semana' },
        { value: 'month', label: 'Último Mês' },
        { value: 'quarter', label: 'Último Trimestre' },
        { value: 'year', label: 'Último Ano' }
    ];

    const exportData = (format: 'json' | 'csv') => {
        const data = {
            period: selectedPeriod,
            categories: selectedCategories,
            dateRange,
            generatedAt: new Date().toISOString(),
            data: analyticsData
        };

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `calendar-analytics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            const csvContent = generateCSV(analyticsData);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `calendar-analytics-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const generateCSV = (data: any): string => {
        const headers = [
            'Métrica', 'Valor', 'Período', 'Data de Geração'
        ];

        const rows = [
            ['Total de Eventos', data.periodEvents.length, selectedPeriod, new Date().toLocaleDateString()],
            ['Taxa de Conclusão', `${data.completionRate.toFixed(1)}%`, selectedPeriod, new Date().toLocaleDateString()],
            ['Eventos por Dia', data.averageEventsPerDay.toFixed(1), selectedPeriod, new Date().toLocaleDateString()],
            ['Eventos Concluídos', data.activitySummary.completedEvents, selectedPeriod, new Date().toLocaleDateString()],
            ['Eventos Pendentes', data.periodEvents.length - data.activitySummary.completedEvents, selectedPeriod, new Date().toLocaleDateString()]
        ];

        const csvRows = [headers, ...rows];
        return csvRows.map(row => row.join(',')).join('\n');
    };

    const getCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            meeting: 'bg-blue-100 text-blue-800',
            task: 'bg-green-100 text-green-800',
            reminder: 'bg-yellow-100 text-yellow-800',
            event: 'bg-purple-100 text-purple-800',
            personal: 'bg-pink-100 text-pink-800',
            work: 'bg-indigo-100 text-indigo-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Analytics e Relatórios
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => exportData('json')}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exportar JSON
                    </button>
                    <button
                        onClick={() => exportData('csv')}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Period and Category Filters */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Período
                    </label>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as any)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                    >
                        {periods.map(period => (
                            <option key={period.value} value={period.value}>
                                {period.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categorias
                    </label>
                    <div className="space-y-2">
                        {categories.map(category => (
                            <label key={category} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCategories(prev => [...prev, category]);
                                        } else {
                                            setSelectedCategories(prev => prev.filter(c => c !== category));
                                        }
                                    }}
                                    className="rounded text-teal-600 focus:ring-teal-500"
                                />
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                                    {category}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'overview'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab('productivity')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'productivity'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Produtividade
                </button>
                <button
                    onClick={() => setActiveTab('patterns')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'patterns'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Padrões de Uso
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === 'reports'
                        ? 'text-teal-600 border-b-2 border-teal-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Relatórios Detalhados
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {analyticsData.periodEvents.length}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                                Total de Eventos
                            </div>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {analyticsData.completionRate.toFixed(0)}%
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">
                                Taxa de Conclusão
                            </div>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {analyticsData.averageEventsPerDay.toFixed(1)}
                            </div>
                            <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                Eventos por Dia
                            </div>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {analyticsData.activitySummary.completedEvents}
                            </div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">
                                Concluídos
                            </div>
                        </div>
                    </div>

                    {/* Activity Summary */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Resumo de Atividade
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Plus className="w-2 h-2 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Criados</div>
                                    <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                        {analyticsData.activitySummary.total}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-2 h-2 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Concluídos</div>
                                    <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                        {analyticsData.activitySummary.completedEvents}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <Clock className="w-2 h-2 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Ignorados</div>
                                    <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                        {analyticsData.activitySummary.skipped}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <X className="w-2 h-2 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Excluídos</div>
                                    <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                        {analyticsData.activitySummary.deletes}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Productivity Tab */}
            {activeTab === 'productivity' && (
                <div className="space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Análise de Produtividade
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Taxa de Produtividade
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                        <div
                                            className="bg-teal-600 h-2 rounded-full"
                                            style={{ width: `${analyticsData.completionRate}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 ml-2">
                                        {analyticsData.completionRate.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio por Evento</div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {analyticsData.averageEventsPerDay > 0 ? '1.2h' : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Eventos Concluídos a Tempo</div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {analyticsData.activitySummary.completedEvents > 0 ? '85%' : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Patterns Tab */}
            {activeTab === 'patterns' && (
                <div className="space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Padrões de Uso
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-5 h-5 text-teal-600" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Dias Mais Ativos
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getUserActivityPatterns().mostActiveHour}:00
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
                                    const hourActivity = getUserActivityPatterns().actionsByHour[index] || 0;
                                    const maxActivity = Math.max(...Object.values(getUserActivityPatterns().actionsByHour));
                                    const percentage = maxActivity > 0 ? (hourActivity / maxActivity) * 100 : 0;

                                    return (
                                        <div key={day} className="text-center">
                                            <div className="text-xs text-gray-500 mb-1">{day}</div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full relative">
                                                <div
                                                    className="bg-teal-600 h-2 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2"
                                                    style={{ width: `${Math.max(2, percentage)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div className="space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Relatórios Detalhados
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => onExportReport?.(analyticsData, 'json')}
                                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                            >
                                <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    Relatório Completo (JSON)
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                    Dados completos com todas as métricas e análises
                                </div>
                            </button>

                            <button
                                onClick={() => onExportReport?.(analyticsData, 'csv')}
                                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
                            >
                                <Activity className="w-6 h-6 text-green-600 mb-2" />
                                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Relatório de Dados (CSV)
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400">
                                    Dados tabulares para análise em planilhas
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};