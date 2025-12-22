import { useState, useCallback } from 'react';
import type { CalendarView } from '../../types/calendar';
import {
    addMonths,
    addWeeks,
    addDays,
    startOfMonth,
    startOfWeek,
    startOfDay,
    isSameMonth,
    isSameDay
} from '../../components/calendar/utils/dateHelpers';

export const useCalendarState = (initialView: CalendarView = 'month') => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [currentView, setCurrentView] = useState<CalendarView>(initialView);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const navigateToPrevious = useCallback(() => {
        switch (currentView) {
            case 'month':
                setCurrentDate((prev: Date) => addMonths(prev, -1));
                break;
            case 'week':
                setCurrentDate((prev: Date) => addWeeks(prev, -1));
                break;
            case 'day':
                setCurrentDate((prev: Date) => addDays(prev, -1));
                break;
        }
    }, [currentView]);

    const navigateToNext = useCallback(() => {
        switch (currentView) {
            case 'month':
                setCurrentDate((prev: Date) => addMonths(prev, 1));
                break;
            case 'week':
                setCurrentDate((prev: Date) => addWeeks(prev, 1));
                break;
            case 'day':
                setCurrentDate((prev: Date) => addDays(prev, 1));
                break;
        }
    }, [currentView]);

    const navigateToToday = useCallback(() => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    }, []);

    const navigateToDate = useCallback((date: Date) => {
        setCurrentDate(date);
        setSelectedDate(date);
    }, []);

    const setView = useCallback((view: CalendarView) => {
        setCurrentView(view);
        // Adjust the current date to show the selected date in the new view
        if (selectedDate) {
            switch (view) {
                case 'month':
                    setCurrentDate(startOfMonth(selectedDate));
                    break;
                case 'week':
                    setCurrentDate(startOfWeek(selectedDate));
                    break;
                case 'day':
                    setCurrentDate(startOfDay(selectedDate));
                    break;
            }
        }
    }, [selectedDate]);

    const selectDate = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedDate(null);
    }, []);

    const getViewDateRange = useCallback(() => {
        switch (currentView) {
            case 'month': {
                const start = startOfMonth(currentDate);
                const end = addMonths(start, 1);
                return { start, end };
            }
            case 'week': {
                const start = startOfWeek(currentDate);
                const end = addWeeks(start, 1);
                return { start, end };
            }
            case 'day': {
                const start = startOfDay(currentDate);
                const end = addDays(start, 1);
                return { start, end };
            }
            default:
                return { start: new Date(), end: new Date() };
        }
    }, [currentDate, currentView]);

    const isDateInCurrentView = useCallback((date: Date): boolean => {
        const { start, end } = getViewDateRange();
        return date >= start && date < end;
    }, [getViewDateRange]);

    const isDateSelected = useCallback((date: Date): boolean => {
        return selectedDate ? isSameDay(date, selectedDate) : false;
    }, [selectedDate]);

    const isDateCurrent = useCallback((date: Date): boolean => {
        switch (currentView) {
            case 'month':
                return isSameMonth(date, currentDate);
            case 'week':
                const weekStart = startOfWeek(currentDate);
                const weekEnd = addWeeks(weekStart, 1);
                return date >= weekStart && date < weekEnd;
            case 'day':
                return isSameDay(date, currentDate);
            default:
                return false;
        }
    }, [currentDate, currentView]);

    const getNavigationLabel = useCallback((): string => {
        switch (currentView) {
            case 'month':
                return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            case 'week':
                const weekStart = startOfWeek(currentDate);
                const weekEnd = addDays(weekStart, 6);
                const startFormat = weekStart.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
                const endFormat = weekEnd.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' });
                return `${startFormat} - ${endFormat}`;
            case 'day':
                return currentDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            default:
                return '';
        }
    }, [currentDate, currentView]);

    const reset = useCallback(() => {
        const today = new Date();
        setCurrentDate(today);
        setCurrentView(initialView);
        setSelectedDate(null);
    }, [initialView]);

    return {
        // State
        currentDate,
        currentView,
        selectedDate,

        // Navigation actions
        navigateToPrevious,
        navigateToNext,
        navigateToToday,
        navigateToDate,

        // View management
        setView,
        selectDate,
        clearSelection,

        // Utility methods
        getViewDateRange,
        isDateInCurrentView,
        isDateSelected,
        isDateCurrent,
        getNavigationLabel,
        reset
    };
};