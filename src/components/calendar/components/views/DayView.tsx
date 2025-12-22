import { getHoursInDay, isToday, formatTime, addDays } from '../../utils/dateHelpers';
import { getEventsForDate, hasTimeConflict } from '../../utils/eventHelpers';
import type { Event } from '../../../../types/calendar';
import { EventItem } from '../EventItem';
import { useState } from 'react';

interface DayViewProps {
    currentDate: Date;
    events: Event[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: Event) => void;
    onEventEdit: (event: Event) => void;
    onEventDelete: (id: string) => void;
    onEventDrop?: (eventId: string, newDate: Date, newTime?: string) => void;
    onEventResize?: (eventId: string, newEndDate: Date) => void;
}

export const DayView = ({
    currentDate,
    events,
    onDateClick,
    onEventClick,
    onEventEdit,
    onEventDelete,
    onEventDrop,
    onEventResize
}: DayViewProps) => {
    const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
    const [dragOverTime, setDragOverTime] = useState<string | null>(null);
    const [resizingEvent, setResizingEvent] = useState<Event | null>(null);
    const [resizeStartY, setResizeStartY] = useState<number>(0);

    const hours = getHoursInDay();
    const dayEvents = getEventsForDate(events, currentDate);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, event: Event) => {
        setDraggedEvent(event);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', event.id);
    };

    const handleDragEnd = () => {
        setDraggedEvent(null);
        setDragOverTime(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, hour: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverTime(hour);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, hour: string) => {
        e.preventDefault();
        if (draggedEvent && onEventDrop) {
            const targetDate = new Date(currentDate);
            const [hours, minutes] = hour.split(':').map(Number);
            targetDate.setHours(hours, minutes, 0, 0);

            onEventDrop(draggedEvent.id, targetDate, hour);
        }
        handleDragEnd();
    };

    const handleResizeStart = (e: React.MouseEvent, event: Event) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingEvent(event);
        setResizeStartY(e.clientY);
    };

    const handleResizeMove = (e: MouseEvent) => {
        if (!resizingEvent || !onEventResize) return;

        const deltaY = e.clientY - resizeStartY;
        const hoursDelta = Math.round(deltaY / 60); // 60px per hour

        const newEndDate = new Date(resizingEvent.endDate);
        newEndDate.setHours(newEndDate.getHours() + hoursDelta);

        // Ensure minimum duration of 30 minutes
        const minEndDate = new Date(resizingEvent.startDate);
        minEndDate.setMinutes(minEndDate.getMinutes() + 30);

        if (newEndDate >= minEndDate) {
            onEventResize(resizingEvent.id, newEndDate);
        }
    };

    const handleResizeEnd = () => {
        setResizingEvent(null);
        setResizeStartY(0);
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };

    // Add resize event listeners when resizing starts
    if (resizingEvent) {
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    }

    const getEventsForTimeSlot = (hour: string) => {
        const [h] = hour.split(':').map(Number);
        const slotStart = new Date(currentDate);
        slotStart.setHours(h, 0, 0, 0);
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(h + 1, 0, 0, 0);

        return dayEvents.filter(event => {
            return (
                (event.startDate >= slotStart && event.startDate < slotEnd) ||
                (event.startDate < slotStart && event.endDate > slotStart)
            );
        });
    };

    const getEventPosition = (event: Event) => {
        const startHour = event.startDate.getHours();
        const startMinute = event.startDate.getMinutes();
        const endHour = event.endDate.getHours();
        const endMinute = event.endDate.getMinutes();

        const top = (startHour + startMinute / 60) * 60; // 60px per hour
        const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 60;

        return { top, height };
    };

    const getConflictingEvents = (hour: string) => {
        const eventsInSlot = getEventsForTimeSlot(hour);
        return eventsInSlot.filter(event =>
            eventsInSlot.some(other => other.id !== event.id && hasTimeConflict(event, other))
        );
    };

    const getOverlappingEvents = (event: Event) => {
        return dayEvents.filter(other =>
            other.id !== event.id && hasTimeConflict(event, other)
        );
    };

    const calculateEventWidth = (event: Event) => {
        const overlapping = getOverlappingEvents(event);
        const totalOverlapping = overlapping.length + 1;
        const eventIndex = overlapping
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
            .findIndex(e => e.id === event.id) + 1;

        const width = 100 / totalOverlapping;
        const left = ((eventIndex - 1) * width);

        return { width: `${width}%`, left: `${left}%` };
    };

    const navigateToNextDay = () => {
        onDateClick(addDays(currentDate, 1));
    };

    const navigateToPreviousDay = () => {
        onDateClick(addDays(currentDate, -1));
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Header with date and navigation */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={navigateToPreviousDay}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                        title="Dia anterior"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="text-center">
                        <h2 className={`text-xl font-bold ${isToday(currentDate)
                                ? 'text-teal-600 dark:text-teal-400'
                                : 'text-gray-800 dark:text-gray-200'
                            }`}>
                            {currentDate.toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </h2>
                        {isToday(currentDate) && (
                            <span className="text-sm text-teal-600 dark:text-teal-400">Hoje</span>
                        )}
                    </div>

                    <button
                        onClick={navigateToNextDay}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                        title="Próximo dia"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDateClick(new Date())}
                        className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                        Hoje
                    </button>
                </div>
            </div>

            {/* Time grid */}
            <div className="h-[600px] overflow-y-auto">
                {hours.map((hour) => {
                    const eventsInSlot = getEventsForTimeSlot(hour);
                    const isDragOver = dragOverTime === hour;
                    const hasConflicts = getConflictingEvents(hour).length > 0;

                    return (
                        <div key={hour} className="flex border-b border-gray-100 dark:border-gray-700">
                            {/* Time column */}
                            <div className="w-20 p-2 text-right text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                {formatTime(new Date(`2023-01-01T${hour}`), '12h')}
                            </div>

                            {/* Day column */}
                            <div
                                className={`relative flex-1 min-h-[60px] cursor-pointer transition-colors ${isDragOver
                                        ? 'bg-teal-50 dark:bg-teal-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    } ${hasConflicts ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                                onDragOver={(e) => handleDragOver(e, hour)}
                                onDrop={(e) => handleDrop(e, hour)}
                                onClick={() => {
                                    const targetDate = new Date(currentDate);
                                    const [hours, minutes] = hour.split(':').map(Number);
                                    targetDate.setHours(hours, minutes, 0, 0);
                                    onDateClick(targetDate);
                                }}
                            >
                                {/* All-day events */}
                                {eventsInSlot
                                    .filter(event => event.isAllDay)
                                    .map((event) => (
                                        <div
                                            key={event.id}
                                            className="absolute inset-x-2 top-1 bottom-1 z-10"
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
                                    .filter(event => !event.isAllDay)
                                    .map((event) => {
                                        const position = getEventPosition(event);
                                        const { width, left } = calculateEventWidth(event);

                                        return (
                                            <div
                                                key={event.id}
                                                className="absolute z-20"
                                                style={{
                                                    top: `${position.top}px`,
                                                    height: `${position.height}px`,
                                                    minHeight: '30px',
                                                    width,
                                                    left,
                                                    right: 'auto'
                                                }}
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

                                                {/* Resize handle */}
                                                {onEventResize && (
                                                    <div
                                                        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-teal-500 hover:bg-opacity-30"
                                                        onMouseDown={(e) => handleResizeStart(e, event)}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}

                                {/* Conflict indicator */}
                                {hasConflicts && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" title="Conflito de horário" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};