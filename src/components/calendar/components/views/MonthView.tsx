import { getDaysInMonth, getWeekDays, isToday } from '../../utils/dateHelpers';
import { getEventsForDate } from '../../utils/eventHelpers';
import type { Event } from '../../../../types/calendar';
import { EventItem } from '../EventItem';

interface MonthViewProps {
    currentDate: Date;
    events: Event[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: Event) => void;
    onEventEdit: (event: Event) => void;
    onEventDelete: (id: string) => void;
}

export const MonthView = ({
    currentDate,
    events,
    onDateClick,
    onEventClick,
    onEventEdit,
    onEventDelete
}: MonthViewProps) => {
    const days = getDaysInMonth(currentDate);
    const weekDays = getWeekDays();

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Week days header */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                {weekDays.map(day => (
                    <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
                {days.map((date, index) => {
                    const dayEvents = date ? getEventsForDate(events, date) : [];
                    const isCurrentDay = date ? isToday(date) : false;

                    return (
                        <div
                            key={index}
                            className={`min-h-[120px] border-b border-r border-gray-100 dark:border-gray-700 p-2 ${!date
                                    ? 'bg-gray-50 dark:bg-gray-800/50'
                                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'
                                } transition-colors`}
                            onClick={() => date && onDateClick(date)}
                        >
                            {date && (
                                <>
                                    <div className={`text-sm font-medium mb-1 ${isCurrentDay
                                            ? 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {date.getDate()}
                                    </div>

                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map(event => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick(event);
                                                }}
                                            >
                                                <EventItem
                                                    event={event}
                                                    compact
                                                    onEdit={onEventEdit}
                                                    onDelete={onEventDelete}
                                                />
                                            </div>
                                        ))}

                                        {dayEvents.length > 3 && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                                +{dayEvents.length - 3} mais
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};