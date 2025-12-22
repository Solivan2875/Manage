import { getDaysInWeek, getWeekDays, getHoursInDay, isToday, formatTime } from '../../utils/dateHelpers';
import { getEventsForWeek, hasTimeConflict, getCategoryColor } from '../../utils/eventHelpers';
import type { Event } from '../../../../types/calendar';
import { EventItem } from '../EventItem';
import { useState } from 'react';

interface WeekViewProps {
    currentDate: Date;
    events: Event[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: Event) => void;
    onEventEdit: (event: Event) => void;
    onEventDelete: (id: string) => void;
    onEventDrop?: (eventId: string, newDate: Date, newTime?: string) => void;
    onEventResize?: (eventId: string, newEndDate: Date) => void;
}

export const WeekView = ({
    currentDate,
    events,
    onDateClick,
    onEventClick,
    onEventEdit,
    onEventDelete,
    onEventDrop,
    onEventResize
}: WeekViewProps) => {
    const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
    const [dragOverTime, setDragOverTime] = useState<string | null>(null);
    const [dragOverDay, setDragOverDay] = useState<number | null>(null);

    const weekDays = getDaysInWeek(currentDate);
    const weekDaysNames = getWeekDays();
    const hours = getHoursInDay();
    const weekEvents = getEventsForWeek(events, weekDays[0]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, event: Event) => {
        setDraggedEvent(event);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', event.id);
    };

    const handleDragEnd = () => {
        setDraggedEvent(null);
        setDragOverTime(null);
        setDragOverDay(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, hour: string, dayIndex: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverTime(hour);
        setDragOverDay(dayIndex);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, hour: string, dayIndex: number) => {
        e.preventDefault();
        if (draggedEvent && onEventDrop) {
            const targetDate = new Date(weekDays[dayIndex]);
            const [hours, minutes] = hour.split(':').map(Number);
            targetDate.setHours(hours, minutes, 0, 0);

            onEventDrop(draggedEvent.id, targetDate, hour);
        }
        handleDragEnd();
    };

    const getEventsForTimeSlot = (day: Date, hour: string) => {
        const [h] = hour.split(':').map(Number);
        const slotStart = new Date(day);
        slotStart.setHours(h, 0, 0, 0);
        const slotEnd = new Date(day);
        slotEnd.setHours(h + 1, 0, 0, 0);

        return weekEvents.filter(event => {
            return (
                (event.startDate >= slotStart && event.startDate < slotEnd) ||
                (event.startDate < slotStart && event.endDate > slotStart)
            );
        });
    };

    const getEventPosition = (event: Event, day: Date) => {
        const startHour = event.startDate.getHours();
        const startMinute = event.startDate.getMinutes();
        const endHour = event.endDate.getHours();
        const endMinute = event.endDate.getMinutes();

        const top = (startHour + startMinute / 60) * 60; // 60px per hour
        const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 60;

        return { top, height };
    };

    const getConflictingEvents = (day: Date, hour: string) => {
        const eventsInSlot = getEventsForTimeSlot(day, hour);
        return eventsInSlot.filter(event =>
            eventsInSlot.some(other => other.id !== event.id && hasTimeConflict(event, other))
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Header with days */}
            <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                    Hora
                </div>
                {weekDays.map((day, index) => (
                    <div
                        key={index}
                        className={`p-3 text-center border-l border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${isToday(day)
                            ? 'bg-teal-50 dark:bg-teal-900/20'
                            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        onClick={() => onDateClick(day)}
                    >
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            {weekDaysNames[index]}
                        </div>
                        <div className={`text-lg font-bold ${isToday(day)
                            ? 'text-teal-600 dark:text-teal-400'
                            : 'text-gray-800 dark:text-gray-200'
                            }`}>
                            {day.getDate()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Time grid */}
            <div className="h-[600px] overflow-y-auto">
                {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700">
                        {/* Time column */}
                        <div className="p-2 text-right text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            {formatTime(new Date(`2023-01-01T${hour}`), '12h')}
                        </div>

                        {/* Day columns */}
                        {weekDays.map((day, dayIndex) => {
                            const eventsInSlot = getEventsForTimeSlot(day, hour);
                            const isDragOver = dragOverTime === hour && dragOverDay === dayIndex;
                            const hasConflicts = getConflictingEvents(day, hour).length > 0;

                            return (
                                <div
                                    key={`${hour}-${dayIndex}`}
                                    className={`relative border-l border-gray-100 dark:border-gray-700 min-h-[60px] cursor-pointer transition-colors ${isDragOver
                                        ? 'bg-teal-50 dark:bg-teal-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        } ${hasConflicts ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                                    onDragOver={(e) => handleDragOver(e, hour, dayIndex)}
                                    onDrop={(e) => handleDrop(e, hour, dayIndex)}
                                    onClick={() => onDateClick(day)}
                                >
                                    {/* All-day events spanning multiple hours */}
                                    {eventsInSlot
                                        .filter(event => event.isAllDay)
                                        .map((event) => (
                                            <div
                                                key={event.id}
                                                className="absolute inset-x-1 top-0 bottom-0 z-10"
                                                draggable={!!onEventDrop}
                                                onDragStart={(e) => handleDragStart(e, event)}
                                                onDragEnd={handleDragEnd}
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

                                    {/* Time-specific events */}
                                    {eventsInSlot
                                        .filter(event => !event.isAllDay && isToday(event.startDate))
                                        .map((event) => {
                                            const position = getEventPosition(event, day);
                                            return (
                                                <div
                                                    key={event.id}
                                                    className="absolute inset-x-1 z-20"
                                                    draggable={!!onEventDrop}
                                                    onDragStart={(e) => handleDragStart(e, event)}
                                                    onDragEnd={handleDragEnd}
                                                    style={{
                                                        top: `${position.top}px`,
                                                        height: `${position.height}px`,
                                                        minHeight: '30px'
                                                    }}
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
                                            );
                                        })}

                                    {/* Conflict indicator */}
                                    {hasConflicts && (
                                        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" title="Conflito de horário" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};