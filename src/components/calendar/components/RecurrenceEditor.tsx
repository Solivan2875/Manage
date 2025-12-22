import { useState, useEffect } from 'react';
import {
    Repeat,
    Calendar,
    Clock,
    X,
    Check,
    AlertCircle
} from 'lucide-react';
import type { RecurrenceRule } from '../../../types/calendar';
import { useRecurrence } from '../../../hooks/calendar/useRecurrence';

interface RecurrenceEditorProps {
    event?: any;
    rule?: RecurrenceRule;
    onSave?: (rule: RecurrenceRule) => void;
    onCancel?: () => void;
    isOpen?: boolean;
}

export const RecurrenceEditor = ({
    event,
    rule: initialRule,
    onSave,
    onCancel,
    isOpen
}: RecurrenceEditorProps) => {
    const [rule, setRule] = useState<RecurrenceRule>(() => ({
        id: initialRule?.id || `rule_${Date.now()}`,
        frequency: initialRule?.frequency || 'weekly',
        interval: initialRule?.interval || 1,
        endDate: initialRule?.endDate,
        daysOfWeek: initialRule?.daysOfWeek || [],
        dayOfMonth: initialRule?.dayOfMonth,
        count: initialRule?.count
    }));

    const [endDateType, setEndDateType] = useState<'never' | 'date' | 'count'>(
        initialRule?.endDate ? 'date' : initialRule?.count ? 'count' : 'never'
    );

    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const { validateRule, formatRecurrenceRule } = useRecurrence({
        events: [],
        onEventAdd: () => { },
        onEventUpdate: () => { },
        onEventDelete: () => { }
    });

    const weekDays = [
        { value: 0, label: 'Dom' },
        { value: 1, label: 'Seg' },
        { value: 2, label: 'Ter' },
        { value: 3, label: 'Qua' },
        { value: 4, label: 'Qui' },
        { value: 5, label: 'Sex' },
        { value: 6, label: 'Sáb' }
    ];

    const frequencyOptions = [
        { value: 'daily', label: 'Diariamente' },
        { value: 'weekly', label: 'Semanalmente' },
        { value: 'monthly', label: 'Mensalmente' },
        { value: 'yearly', label: 'Anualmente' }
    ];

    useEffect(() => {
        if (initialRule) {
            setRule(initialRule);
            setEndDateType(
                initialRule.endDate ? 'date' : initialRule.count ? 'count' : 'never'
            );
        }
    }, [initialRule]);

    useEffect(() => {
        const validation = validateRule(rule);
        setValidationErrors(validation.errors);
    }, [rule, validateRule]);

    const handleSave = () => {
        const validation = validateRule(rule);
        if (validation.isValid && onSave) {
            onSave(rule);
        }
    };

    const handleFrequencyChange = (frequency: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
        setRule(prev => ({ ...prev, frequency }));

        // Reset dependent fields when frequency changes
        if (frequency === 'daily') {
            setRule(prev => ({ ...prev, daysOfWeek: [], dayOfMonth: undefined }));
        } else if (frequency === 'weekly') {
            setRule(prev => ({ ...prev, dayOfMonth: undefined }));
        } else if (frequency === 'monthly') {
            setRule(prev => ({ ...prev, daysOfWeek: [] }));
        }
    };

    const handleDayOfWeekToggle = (day: number) => {
        setRule(prev => ({
            ...prev,
            daysOfWeek: prev.daysOfWeek?.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...(prev.daysOfWeek || []), day]
        }));
    };

    const handleEndDateTypeChange = (type: 'never' | 'date' | 'count') => {
        setEndDateType(type);

        if (type === 'never') {
            setRule(prev => ({ ...prev, endDate: undefined, count: undefined }));
        } else if (type === 'date') {
            setRule(prev => ({ ...prev, count: undefined }));
        } else if (type === 'count') {
            setRule(prev => ({ ...prev, endDate: undefined }));
        }
    };

    const getFrequencyText = () => {
        const intervalText = rule.interval === 1 ? '' : `a cada ${rule.interval} `;

        switch (rule.frequency) {
            case 'daily':
                return `${intervalText}dia${rule.interval > 1 ? 's' : ''}`;
            case 'weekly':
                return `${intervalText}semana${rule.interval > 1 ? 's' : ''}`;
            case 'monthly':
                return `${intervalText}mês${rule.interval > 1 ? 'es' : ''}`;
            case 'yearly':
                return `${intervalText}ano${rule.interval > 1 ? 's' : ''}`;
            default:
                return '';
        }
    };

    const getRecurrenceSummary = () => {
        let summary = `Repete ${getFrequencyText()}`;

        if (rule.frequency === 'weekly' && rule.daysOfWeek && rule.daysOfWeek.length > 0) {
            const days = rule.daysOfWeek.map(day => weekDays.find(d => d.value === day)?.label).join(', ');
            summary += ` às ${days}`;
        }

        if (rule.frequency === 'monthly' && rule.dayOfMonth) {
            summary += ` no dia ${rule.dayOfMonth}`;
        }

        if (endDateType === 'date' && rule.endDate) {
            summary += ` até ${rule.endDate.toLocaleDateString('pt-BR')}`;
        }

        if (endDateType === 'count' && rule.count) {
            summary += ` por ${rule.count} ocorrência${rule.count > 1 ? 's' : ''}`;
        }

        return summary;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Repeat className="w-5 h-5 text-teal-600" />
                        Configurar Recorrência
                    </h3>
                    <button
                        onClick={onCancel}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Frequency Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Frequência
                        </label>
                        <select
                            value={rule.frequency}
                            onChange={(e) => handleFrequencyChange(e.target.value as any)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            {frequencyOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Interval */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Repetir
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                max="999"
                                value={rule.interval}
                                onChange={(e) => setRule(prev => ({
                                    ...prev,
                                    interval: parseInt(e.target.value) || 1
                                }))}
                                className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <span className="text-gray-600 dark:text-gray-400">
                                {getFrequencyText()}
                            </span>
                        </div>
                    </div>

                    {/* Days of Week (for weekly) */}
                    {rule.frequency === 'weekly' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Dias da semana
                            </label>
                            <div className="flex gap-2">
                                {weekDays.map(day => (
                                    <button
                                        key={day.value}
                                        onClick={() => handleDayOfWeekToggle(day.value)}
                                        className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${rule.daysOfWeek?.includes(day.value)
                                                ? 'bg-teal-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Day of Month (for monthly) */}
                    {rule.frequency === 'monthly' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Dia do mês
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={rule.dayOfMonth || ''}
                                onChange={(e) => setRule(prev => ({
                                    ...prev,
                                    dayOfMonth: parseInt(e.target.value) || undefined
                                }))}
                                placeholder="Ex: 15"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    )}

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Terminar
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={endDateType === 'never'}
                                    onChange={() => handleEndDateTypeChange('never')}
                                    className="text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Nunca
                                </span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={endDateType === 'date'}
                                    onChange={() => handleEndDateTypeChange('date')}
                                    className="text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Em
                                </span>
                                <input
                                    type="date"
                                    value={rule.endDate ? rule.endDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setRule(prev => ({
                                        ...prev,
                                        endDate: e.target.value ? new Date(e.target.value) : undefined
                                    }))}
                                    disabled={endDateType !== 'date'}
                                    className="p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                                />
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={endDateType === 'count'}
                                    onChange={() => handleEndDateTypeChange('count')}
                                    className="text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Após
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    max="999"
                                    value={rule.count || ''}
                                    onChange={(e) => setRule(prev => ({
                                        ...prev,
                                        count: parseInt(e.target.value) || undefined
                                    }))}
                                    disabled={endDateType !== 'count'}
                                    className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    ocorrências
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-red-700 dark:text-red-400">
                                        Erros de validação
                                    </div>
                                    <ul className="text-xs text-red-600 dark:text-red-300 mt-1">
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {getRecurrenceSummary()}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={validationErrors.length > 0}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};