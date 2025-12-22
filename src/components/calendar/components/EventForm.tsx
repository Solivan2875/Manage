import { useEffect, useRef, useState } from 'react';
import { Plus, X, Calendar, Clock, Tag, Users, MapPin, Repeat, Bell } from 'lucide-react';
import type { EventFormData, EventCategory, Priority, Reminder, RecurrenceRule } from '../../../types/calendar';
import { getCategoryColor } from '../utils/eventHelpers';

interface EventFormProps {
    formData: EventFormData;
    isEditing?: boolean;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
    onIsAllDayChange: (isAllDay: boolean) => void;
    onCategoryChange: (category: EventCategory) => void;
    onPriorityChange: (priority: Priority) => void;
    onLocationChange: (value: string) => void;
    onAttendeesChange: (value: string) => void;
    onColorChange: (value: string) => void;
    onTagsChange: (tags: string[]) => void;
    onRemindersChange: (reminders: Reminder[]) => void;
    onRecurrenceChange: (recurrence?: RecurrenceRule) => void;
    onCancel: () => void;
    onSave: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    inputRef?: React.RefObject<HTMLInputElement>;
}

export const EventForm = ({
    formData,
    isEditing = false,
    onTitleChange,
    onDescriptionChange,
    onStartDateChange,
    onEndDateChange,
    onIsAllDayChange,
    onCategoryChange,
    onPriorityChange,
    onLocationChange,
    onAttendeesChange,
    onColorChange,
    onTagsChange,
    onRemindersChange,
    onRecurrenceChange,
    onCancel,
    onSave,
    onDelete,
    onDuplicate,
    inputRef
}: EventFormProps) => {
    const titleInputRef = useRef<HTMLInputElement>(null);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [newReminderMinutes, setNewReminderMinutes] = useState('15');
    const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!formData.recurrence);

    // Focus title input on mount
    useEffect(() => {
        if (titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, []);

    // Update recurrence state when formData changes
    useEffect(() => {
        setRecurrenceEnabled(!!formData.recurrence);
    }, [formData.recurrence]);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        onStartDateChange(newDate);

        // Auto-adjust end date if it's before start date
        if (newDate >= formData.endDate) {
            const newEndDate = new Date(newDate.getTime() + 60 * 60 * 1000); // +1 hour
            onEndDateChange(newEndDate);
        }
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onEndDateChange(new Date(e.target.value));
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const newStartDate = new Date(formData.startDate);
        newStartDate.setHours(hours, minutes, 0, 0);
        onStartDateChange(newStartDate);
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const newEndDate = new Date(formData.endDate);
        newEndDate.setHours(hours, minutes, 0, 0);
        onEndDateChange(newEndDate);
    };

    const formatTimeForInput = (date: Date): string => {
        return date.toTimeString().slice(0, 5);
    };

    const formatDateForInput = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            onTagsChange([...formData.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onTagsChange(formData.tags.filter(tag => tag !== tagToRemove));
    };

    const handleAddReminder = () => {
        const minutes = parseInt(newReminderMinutes);
        if (!isNaN(minutes) && minutes > 0) {
            const newReminder: Reminder = {
                id: `reminder_${Date.now()}`,
                minutesBefore: minutes,
                type: 'notification',
                enabled: true
            };
            onRemindersChange([...formData.reminders, newReminder]);
            setNewReminderMinutes('15');
        }
    };

    const handleRemoveReminder = (reminderId: string) => {
        onRemindersChange(formData.reminders.filter(r => r.id !== reminderId));
    };

    const handleRecurrenceToggle = () => {
        if (recurrenceEnabled) {
            setRecurrenceEnabled(false);
            onRecurrenceChange(undefined);
        } else {
            setRecurrenceEnabled(true);
            onRecurrenceChange({
                id: `recurrence_${Date.now()}`,
                frequency: 'weekly',
                interval: 1
            });
        }
    };

    const handleRecurrenceChange = (field: keyof RecurrenceRule, value: any) => {
        if (formData.recurrence) {
            onRecurrenceChange({
                ...formData.recurrence,
                [field]: value
            });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800">
            <div className="space-y-4">
                {/* Title */}
                <input
                    ref={inputRef || titleInputRef}
                    type="text"
                    value={formData.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Título do evento"
                />

                {/* Description */}
                <textarea
                    value={formData.description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    rows={3}
                    placeholder="Descrição (opcional)"
                />

                {/* Date and Category */}
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="date"
                        value={formatDateForInput(formData.startDate)}
                        onChange={handleStartDateChange}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    <select
                        value={formData.category}
                        onChange={(e) => onCategoryChange(e.target.value as EventCategory)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="event">Evento</option>
                        <option value="meeting">Reunião</option>
                        <option value="task">Tarefa</option>
                        <option value="reminder">Lembrete</option>
                        <option value="personal">Pessoal</option>
                        <option value="work">Trabalho</option>
                    </select>
                </div>

                {/* Time and All Day */}
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <input
                            type="checkbox"
                            checked={formData.isAllDay}
                            onChange={(e) => onIsAllDayChange(e.target.checked)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        Dia inteiro
                    </label>

                    {!formData.isAllDay && (
                        <div className="flex gap-2 flex-1">
                            <input
                                type="time"
                                value={formatTimeForInput(formData.startDate)}
                                onChange={handleStartTimeChange}
                                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <input
                                type="time"
                                value={formatTimeForInput(formData.endDate)}
                                onChange={handleEndTimeChange}
                                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    )}
                </div>

                {/* Priority and Location */}
                <div className="grid grid-cols-2 gap-3">
                    <select
                        value={formData.priority}
                        onChange={(e) => onPriorityChange(e.target.value as Priority)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="low">Baixa prioridade</option>
                        <option value="medium">Média prioridade</option>
                        <option value="high">Alta prioridade</option>
                        <option value="urgent">Urgente</option>
                    </select>

                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => onLocationChange(e.target.value)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Local (opcional)"
                    />
                </div>

                {/* Attendees */}
                <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={formData.attendees}
                        onChange={(e) => onAttendeesChange(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Participantes (separados por vírgula, opcional)"
                    />
                </div>

                {/* Location */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => onLocationChange(e.target.value)}
                        className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Local (opcional)"
                    />
                </div>

                {/* Color */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cor:</span>
                    <div className="flex gap-2">
                        {[
                            'bg-blue-500',
                            'bg-green-500',
                            'bg-red-500',
                            'bg-purple-500',
                            'bg-yellow-500',
                            'bg-pink-500',
                            'bg-indigo-500',
                            'bg-gray-500'
                        ].map(color => (
                            <button
                                key={color}
                                onClick={() => onColorChange(color)}
                                className={`w-6 h-6 rounded-full ${color} ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                {/* Advanced Options Toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                >
                    {showAdvancedOptions ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showAdvancedOptions ? 'Ocultar opções avançadas' : 'Mostrar opções avançadas'}
                </button>

                {/* Advanced Options */}
                {showAdvancedOptions && (
                    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        {/* Tags */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Tag className="w-4 h-4" />
                                Tags
                            </label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="Adicionar tag"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 rounded-full text-sm"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-teal-600 dark:hover:text-teal-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reminders */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Bell className="w-4 h-4" />
                                Lembretes
                            </label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={newReminderMinutes}
                                        onChange={(e) => setNewReminderMinutes(e.target.value)}
                                        min="1"
                                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="Minutos antes"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddReminder}
                                        className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {formData.reminders.map(reminder => (
                                        <div key={reminder.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {reminder.minutesBefore} minutos antes
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveReminder(reminder.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recurrence */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Repeat className="w-4 h-4" />
                                Recorrência
                            </label>
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    checked={recurrenceEnabled}
                                    onChange={handleRecurrenceToggle}
                                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Evento recorrente
                                </span>
                            </div>

                            {recurrenceEnabled && formData.recurrence && (
                                <div className="space-y-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Frequência</label>
                                            <select
                                                value={formData.recurrence.frequency}
                                                onChange={(e) => handleRecurrenceChange('frequency', e.target.value)}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                                            >
                                                <option value="daily">Diariamente</option>
                                                <option value="weekly">Semanalmente</option>
                                                <option value="monthly">Mensalmente</option>
                                                <option value="yearly">Anualmente</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Intervalo</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.recurrence.interval}
                                                onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value) || 1)}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {formData.recurrence.frequency === 'weekly' && (
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Dias da semana</label>
                                            <div className="flex gap-1">
                                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => {
                                                            const days = formData.recurrence?.daysOfWeek || [];
                                                            const newDays = days.includes(index)
                                                                ? days.filter(d => d !== index)
                                                                : [...days, index];
                                                            handleRecurrenceChange('daysOfWeek', newDays);
                                                        }}
                                                        className={`w-8 h-8 text-xs rounded ${formData.recurrence?.daysOfWeek?.includes(index)
                                                                ? 'bg-teal-600 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                            }`}
                                                    >
                                                        {day}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Termina em</label>
                                            <input
                                                type="date"
                                                value={formData.recurrence.endDate ? formatDateForInput(formData.recurrence.endDate) : ''}
                                                onChange={(e) => handleRecurrenceChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Ocorrências</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.recurrence.count || ''}
                                                onChange={(e) => handleRecurrenceChange('count', e.target.value ? parseInt(e.target.value) : undefined)}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                                                placeholder="Número"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>

                        {isEditing && (
                            <>
                                {onDuplicate && (
                                    <button
                                        onClick={onDuplicate}
                                        className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Duplicar
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={onDelete}
                                        className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        Excluir
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <button
                        onClick={onSave}
                        disabled={!formData.title.trim()}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                    >
                        {isEditing ? 'Atualizar Evento' : 'Criar Evento'}
                    </button>
                </div>
            </div>
        </div>
    );
};