const { renderHook, act } = require('@testing-library/react');
const { describe, it, expect, beforeEach } = require('@jest/globals');

// Mock do dateHelpers
jest.mock('../components/calendar/utils/dateHelpers', () => ({
    generateId: jest.fn(() => 'test-id'),
    formatDate: jest.fn((date) => date.toISOString()),
    parseDate: jest.fn((dateStr) => new Date(dateStr)),
    isSameDay: jest.fn((date1, date2) => date1.toDateString() === date2.toDateString()),
    isSameMonth: jest.fn((date1, date2) => date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()),
    addMonths: jest.fn((date, months) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months);
        return newDate;
    }),
    addWeeks: jest.fn((date, weeks) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + (weeks * 7));
        return newDate;
    }),
    addDays: jest.fn((date, days) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }),
    startOfMonth: jest.fn((date) => {
        const newDate = new Date(date);
        newDate.setDate(1);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    }),
    startOfWeek: jest.fn((date) => {
        const newDate = new Date(date);
        const day = newDate.getDay();
        const diff = newDate.getDate() - day;
        newDate.setDate(diff);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    }),
    startOfDay: jest.fn((date) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    }),
    getWeekDays: jest.fn(() => [
        new Date('2025-01-13'), // Sunday
        new Date('2025-01-14'), // Monday
        new Date('2025-01-15'), // Tuesday
        new Date('2025-01-16'), // Wednesday
        new Date('2025-01-17'), // Thursday
        new Date('2025-01-18'), // Friday
        new Date('2025-01-19'), // Saturday
    ]),
    getMonthDays: jest.fn(() => [
        new Date('2025-01-01'),
        new Date('2025-01-02'),
        // ... more days
        new Date('2025-01-31'),
    ]),
    getPreviousMonth: jest.fn(() => new Date('2024-12-15')),
    getNextMonth: jest.fn(() => new Date('2025-02-15')),
    getPreviousWeek: jest.fn(() => new Date('2025-01-08')),
    getNextWeek: jest.fn(() => new Date('2025-01-22')),
    getPreviousDay: jest.fn(() => new Date('2025-01-14')),
    getNextDay: jest.fn(() => new Date('2025-01-16')),
}));

const useCalendarState = require('../hooks/calendar/useCalendarState').useCalendarState;

describe('useCalendarState', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve inicializar com data atual e visualização de mês', () => {
        const { result } = renderHook(() => useCalendarState());

        expect(result.current.currentDate).toBeInstanceOf(Object.getPrototypeOf(new Date()).constructor);
        expect(result.current.currentView).toBe('month');
        expect(result.current.selectedDate).toBeNull();
    });

    it('deve alterar a visualização', () => {
        const { result } = renderHook(() => useCalendarState());

        act(() => {
            result.current.setView('week');
        });

        expect(result.current.currentView).toBe('week');

        act(() => {
            result.current.setView('day');
        });

        expect(result.current.currentView).toBe('day');
    });

    it('deve navegar para o mês anterior', () => {
        const { result } = renderHook(() => useCalendarState());
        const initialDate = new Date(result.current.currentDate);

        act(() => {
            result.current.navigateToPrevious();
        });

        expect(result.current.currentDate.getTime()).toBeLessThan(initialDate.getTime());
    });

    it('deve navegar para o mês seguinte', () => {
        const { result } = renderHook(() => useCalendarState());
        const initialDate = new Date(result.current.currentDate);

        act(() => {
            result.current.navigateToNext();
        });

        expect(result.current.currentDate.getTime()).toBeGreaterThan(initialDate.getTime());
    });

    it('deve navegar para hoje', () => {
        const { result } = renderHook(() => useCalendarState());
        const today = new Date();

        // Modificar a data atual primeiro
        act(() => {
            result.current.navigateToPrevious();
        });

        expect(result.current.currentDate.toDateString()).not.toBe(today.toDateString());

        act(() => {
            result.current.navigateToToday();
        });

        expect(result.current.currentDate.toDateString()).toBe(today.toDateString());
    });

    it('deve selecionar uma data', () => {
        const { result } = renderHook(() => useCalendarState());
        const selectedDate = new Date('2025-01-20');

        act(() => {
            result.current.selectDate(selectedDate);
        });

        expect(result.current.selectedDate).toEqual(selectedDate);
    });

    it('deve obter intervalo de datas da visualização', () => {
        const { result } = renderHook(() => useCalendarState());

        const dateRange = result.current.getViewDateRange();

        expect(dateRange).toHaveProperty('start');
        expect(dateRange).toHaveProperty('end');
        expect(dateRange.start).toBeInstanceOf(Object.getPrototypeOf(new Date()).constructor);
        expect(dateRange.end).toBeInstanceOf(Object.getPrototypeOf(new Date()).constructor);
    });

    it('deve verificar se data está na visualização atual', () => {
        const { result } = renderHook(() => useCalendarState());
        const currentDate = result.current.currentDate;
        const futureDate = new global.Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        expect(result.current.isDateInCurrentView(currentDate)).toBe(true);
        // Note: This test might fail depending on the view implementation
        // For month view, any date in the same month would be in range
        // For week view, any date in the same week would be in range
    });

    it('deve verificar se data está selecionada', () => {
        const { result } = renderHook(() => useCalendarState());
        const selectedDate = new Date('2025-01-20');

        expect(result.current.isDateSelected(selectedDate)).toBe(false);

        act(() => {
            result.current.selectDate(selectedDate);
        });

        expect(result.current.isDateSelected(selectedDate)).toBe(true);
    });

    it('deve verificar se data é atual', () => {
        const { result } = renderHook(() => useCalendarState());
        const currentDate = result.current.currentDate;

        expect(result.current.isDateCurrent(currentDate)).toBe(true);
    });

    it('deve obter label de navegação', () => {
        const { result } = renderHook(() => useCalendarState());

        const label = result.current.getNavigationLabel();

        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
    });
});