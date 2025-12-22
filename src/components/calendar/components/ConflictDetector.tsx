import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import type { Event } from '../../../types/calendar';
import { hasTimeConflict, getTimeConflicts } from '../utils/eventHelpers';
import { isSameDay, formatTime } from '../utils/dateHelpers';

interface ConflictDetectorProps {
    events: Event[];
    onEventClick?: (event: Event) => void;
}

export const ConflictDetector = ({ events, onEventClick }: ConflictDetectorProps) => {
    const conflicts = getTimeConflicts(events);

    if (conflicts.length === 0) {
        return null;
    }

    const handleEventClick = (event: Event) => {
        onEventClick?.(event);
    };

    const getSuggestion = (conflictEvents: Event[]): string => {
        // Find the earliest available time slot after the conflict
        const latestEndTime = Math.max(...conflictEvents.map(e => e.endDate.getTime()));
        const suggestedTime = new Date(latestEndTime + 30 * 60 * 1000); // 30 minutes after

        return `Sugerido: ${formatTime(suggestedTime)}`;
    };

    return (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                        {conflicts.length} {conflicts.length === 1 ? 'conflito' : 'conflitos'} de horário encontrado{conflicts.length > 1 ? 's' : ''}
                    </h3>

                    <div className="space-y-3">
                        {conflicts.map((conflictGroup, groupIndex) => (
                            <div key={groupIndex} className="bg-white dark:bg-gray-800 p-3 rounded border border-red-200 dark:border-red-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                                        {isSameDay(conflictGroup[0].startDate, conflictGroup[0].endDate)
                                            ? conflictGroup[0].startDate.toLocaleDateString('pt-BR', {
                                                weekday: 'long',
                                                month: 'short',
                                                day: 'numeric'
                                            })
                                            : `${conflictGroup[0].startDate.toLocaleDateString('pt-BR')} - ${conflictGroup[0].endDate.toLocaleDateString('pt-BR')}`
                                        }
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {conflictGroup.map((event, eventIndex) => (
                                        <div
                                            key={event.id}
                                            className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            onClick={() => handleEventClick(event)}
                                        >
                                            <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                    {event.title}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                                    {event.location && ` • ${event.location}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
                                    <div className="text-xs text-red-700 dark:text-red-300">
                                        {getSuggestion(conflictGroup)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 text-sm text-red-700 dark:text-red-300">
                        Clique em um evento para editá-lo e resolver o conflito.
                    </div>
                </div>
            </div>
        </div>
    );
};