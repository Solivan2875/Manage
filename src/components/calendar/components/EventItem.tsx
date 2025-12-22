import { Clock, MapPin, Users, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { Event } from '../../../types/calendar';
import { formatTime } from '../utils/dateHelpers';

interface EventItemProps {
    event: Event;
    compact?: boolean;
    showActions?: boolean;
    onEdit?: (event: Event) => void;
    onDelete?: (id: string) => void;
    onClick?: (event: Event) => void;
}

export const EventItem = ({
    event,
    compact = false,
    showActions = true,
    onEdit,
    onDelete,
    onClick
}: EventItemProps) => {
    const [showOptions, setShowOptions] = useState(false);

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowOptions(false);
        onEdit?.(event);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowOptions(false);
        onDelete?.(event.id);
    };

    const handleToggleOptions = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowOptions(!showOptions);
    };

    const handleClick = () => {
        onClick?.(event);
    };

    if (compact) {
        return (
            <div
                className={`text-xs ${event.color} text-white px-2 py-1 rounded truncate cursor-pointer hover:opacity-90 transition-opacity relative`}
                title={event.title}
                onClick={handleClick}
            >
                {!event.isAllDay && (
                    <span className="font-medium">{formatTime(event.startDate)} </span>
                )}
                {event.title}

                {showActions && (
                    <button
                        onClick={handleToggleOptions}
                        className="absolute right-1 top-1 opacity-0 hover:opacity-100 transition-opacity"
                    >
                        <MoreHorizontal className="w-3 h-3 text-white" />
                    </button>
                )}

                {showActions && showOptions && (
                    <div className="absolute z-10 right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Editar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Excluir
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative"
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                <div className={`w-1 h-full ${event.color} rounded-full`} />

                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        {event.title}
                    </h3>

                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {event.isAllDay ? (
                                <span>Dia inteiro</span>
                            ) : (
                                <span>
                                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                </span>
                            )}
                        </div>

                        {event.location && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{event.location}</span>
                            </div>
                        )}

                        {event.attendees.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" />
                                <span>
                                    {event.attendees.length > 1
                                        ? `${event.attendees.length} participantes`
                                        : event.attendees[0].name
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    {event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {event.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showActions && (
                <button
                    onClick={handleToggleOptions}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
            )}

            {showActions && showOptions && (
                <div className="absolute z-10 right-2 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Editar
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Excluir
                    </button>
                </div>
            )}
        </div>
    );
};