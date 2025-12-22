import type { DateRange } from '../../../types/calendar';

export const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add null placeholders for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    return days;
};

export const getWeeksInMonth = (date: Date): Date[][] => {
    const days = getDaysInMonth(date);
    const weeks: Date[][] = [];

    for (let i = 0; i < days.length; i += 7) {
        const week = days.slice(i, i + 7).filter(Boolean) as Date[];
        if (week.length > 0) {
            weeks.push(week);
        }
    }

    return weeks;
};

export const getDaysInWeek = (date: Date, weekStartsOn: number = 0): Date[] => {
    const day = date.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(sunday);
        day.setDate(sunday.getDate() + i);
        days.push(day);
    }

    return days;
};

export const getHoursInDay = (): string[] => {
    const hours: string[] = [];
    for (let i = 0; i < 24; i++) {
        hours.push(i.toString().padStart(2, '0') + ':00');
    }
    return hours;
};

export const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
};

export const isSameMonth = (date1: Date, date2: Date): boolean => {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
};

export const isDateInRange = (date: Date, range: DateRange): boolean => {
    return date >= range.start && date <= range.end;
};

export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const addWeeks = (date: Date, weeks: number): Date => {
    return addDays(date, weeks * 7);
};

export const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

export const startOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

export const endOfDay = (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

export const startOfWeek = (date: Date, weekStartsOn: number = 0): Date => {
    const day = date.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    return addDays(date, -diff);
};

export const endOfWeek = (date: Date, weekStartsOn: number = 0): Date => {
    return addDays(startOfWeek(date, weekStartsOn), 6);
};

export const startOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const endOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const formatTime = (date: Date, format: '12h' | '24h' = '12h'): string => {
    if (format === '24h') {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } else {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
};

export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    };

    return date.toLocaleDateString('pt-BR', options || defaultOptions);
};

export const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

export const getWeekDays = (weekStartsOn: number = 0): string[] => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const adjustedDays = [...weekDays.slice(weekStartsOn), ...weekDays.slice(0, weekStartsOn)];
    return adjustedDays;
};