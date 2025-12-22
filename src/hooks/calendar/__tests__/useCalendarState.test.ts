import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCalendarState } from '../useCalendarState';
import type { CalendarView } from '../../../types/calendar';

describe('useCalendarState', () => {
    beforeEach(() => {
        // Resetar a data mock para cada teste
        vi.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));
    });

    it('deve inicializar com valores padrão', () => {
        const { result } = renderHook(() => useCalendarState());

        expect(result.current.currentDate).toEqual(new Date('2025-01-15T10:00:00.000Z'));
        expect(result.current.currentView).toBe('month');
        expect(result.current.selectedDate).toBeNull();
    });

    it('deve aceitar visualização inicial customizada', () => {
        const { result } = renderHook(() => useCalendarState('week'));

        expect(result.current.currentView).toBe('week');
    });

    it('deve navegar para o mês anterior na visualização mensal', () => {
        const { result } = renderHook(() => useCalendarState('month'));

        act(() => {
            result.current.navigateToPrevious();
        });

        expect(result.current.currentDate.getMonth()).toBe(11); // Dezembro
        expect(result.current.currentDate.getFullYear()).toBe(2024);
    });

    it('deve navegar para o próximo mês na visualização mensal', () => {
        const { result } = renderHook(() => useCalendarState('month'));

        act(() => {
            result.current.navigateToNext();
        });

        expect(result.current.currentDate.getMonth()).toBe(1); // Fevereiro
        expect(result.current.currentDate.getFullYear()).toBe(2025);
    });

    it('deve navegar para a semana anterior na visualização semanal', () => {
        const { result } = renderHook(() => useCalendarState('week'));

        act(() => {
            result.current.navigateToPrevious();
        });

        expect(result.current.currentDate.getTime()).toBe(
            new Date('2025-01-08T10:00:00.000Z').getTime()
        );
    });

    it('deve navegar para a próxima semana na visualização semanal', () => {
        const { result } = renderHook(() => useCalendarState('week'));

        act(() => {
            result.current.navigateToNext();
        });

        expect(result.current.currentDate.getTime()).toBe(
            new Date('2025-01-22T10:00:00.000Z').getTime()
        );
    });

    it('deve navegar para o dia anterior na visualização diária', () => {
        const { result } = renderHook(() => useCalendarState('day'));

        act(() => {
            result.current.navigateToPrevious();
        });

        expect(result.current.currentDate.getTime()).toBe(
            new Date('2025-01-14T10:00:00.000Z').getTime()
        );
    });

    it('deve navegar para o próximo dia na visualização diária', () => {
        const { result } = renderHook(() => useCalendarState('day'));

        act(() => {
            result.current.navigateToNext();
        });

        expect(result.current.currentDate.getTime()).toBe(
            new Date('2025-01-16T10:00:00.000Z').getTime()
        );
    });

    it('deve navegar para hoje', () => {
        const { result } = renderHook(() => useCalendarState());

        // Primeiro, mudar para uma data diferente
        act(() => {
            result.current.navigateToPrevious();
        });

        expect(result.current.currentDate.getTime()).not.toBe(
            new Date('2025-01-15T10:00:00.000Z').getTime()
        );

        // Navegar para hoje
        act(() => {
            result.current.navigateToToday();
        });

        expect(result.current.currentDate).toEqual(new Date('2025-01-15T10:00:00.000Z'));
        expect(result.current.selectedDate).toEqual(new Date('2025-01-15T10:00:00.000Z'));
    });

    it('deve navegar para uma data específica', () => {
        const { result } = renderHook(() => useCalendarState());

        const targetDate = new Date('2025-02-20T10:00:00.000Z');

        act(() => {
            result.current.navigateToDate(targetDate);
        });

        expect(result.current.currentDate).toEqual(targetDate);
        expect(result.current.selectedDate).toEqual(targetDate);
    });

    it('deve alterar a visualização', () => {
        const { result } = renderHook(() => useCalendarState());

        act(() => {
            result.current.setView('week');
        });

        expect(result.current.currentView).toBe('week');
    });

    it('deve ajustar a data atual ao mudar visualização com data selecionada', () => {
        const { result } = renderHook(() => useCalendarState());

        const selectedDate = new Date('2025-02-20T15:30:00.000Z');

        act(() => {
            result.current.selectDate(selectedDate);
            result.current.setView('week');
        });

        // Deve ajustar para o início da semana da data selecionada
        expect(result.current.currentDate.getTime()).toBeLessThanOrEqual(selectedDate.getTime());
    });

    it('deve selecionar uma data', () => {
        const { result } = renderHook(() => useCalendarState());

        const selectedDate = new Date('2025-02-20T15:30:00.000Z');

        act(() => {
            result.current.selectDate(selectedDate);
        });

        expect(result.current.selectedDate).toEqual(selectedDate);
    });

    it('deve limpar seleção', () => {
        const { result } = renderHook(() => useCalendarState());

        const selectedDate = new Date('2025-02-20T15:30:00.000Z');

        act(() => {
            result.current.selectDate(selectedDate);
        });

        expect(result.current.selectedDate).toEqual(selectedDate);

        act(() => {
            result.current.clearSelection();
        });

        expect(result.current.selectedDate).toBeNull();
    });

    it('deve obter o intervalo de datas da visualização mensal', () => {
        const { result } = renderHook(() => useCalendarState('month'));

        const { start, end } = result.current.getViewDateRange();

        expect(start.getMonth()).toBe(0); // Janeiro
        expect(start.getFullYear()).toBe(2025);
        expect(start.getDate()).toBe(1);
        expect(end.getMonth()).toBe(1); // Fevereiro
        expect(end.getFullYear()).toBe(2025);
    });

    it('deve obter o intervalo de datas da visualização semanal', () => {
        const { result } = renderHook(() => useCalendarState('week'));

        const { start, end } = result.current.getViewDateRange();

        const expectedStart = new Date('2025-01-12T00:00:00.000Z'); // Domingo da semana
        const expectedEnd = new Date('2025-01-19T00:00:00.000Z'); // Próximo domingo

        expect(start.getTime()).toBe(expectedStart.getTime());
        expect(end.getTime()).toBe(expectedEnd.getTime());
    });

    it('deve obter o intervalo de datas da visualização diária', () => {
        const { result } = renderHook(() => useCalendarState('day'));

        const { start, end } = result.current.getViewDateRange();

        const expectedStart = new Date('2025-01-15T00:00:00.000Z');
        const expectedEnd = new Date('2025-01-16T00:00:00.000Z');

        expect(start.getTime()).toBe(expectedStart.getTime());
        expect(end.getTime()).toBe(expectedEnd.getTime());
    });

    it('deve verificar se data está na visualização atual', () => {
        const { result } = renderHook(() => useCalendarState('month'));

        const dateInView = new Date('2025-01-20T10:00:00.000Z');
        const dateOutOfView = new Date('2025-02-20T10:00:00.000Z');

        expect(result.current.isDateInCurrentView(dateInView)).toBe(true);
        expect(result.current.isDateInCurrentView(dateOutOfView)).toBe(false);
    });

    it('deve verificar se data está selecionada', () => {
        const { result } = renderHook(() => useCalendarState());

        const selectedDate = new Date('2025-01-15T10:00:00.000Z');
        const sameDateDifferentTime = new Date('2025-01-15T15:30:00.000Z');
        const differentDate = new Date('2025-01-16T10:00:00.000Z');

        act(() => {
            result.current.selectDate(selectedDate);
        });

        expect(result.current.isDateSelected(selectedDate)).toBe(true);
        expect(result.current.isDateSelected(sameDateDifferentTime)).toBe(true);
        expect(result.current.isDateSelected(differentDate)).toBe(false);
    });

    it('deve verificar se data é atual na visualização mensal', () => {
        const { result } = renderHook(() => useCalendarState('month'));

        const dateInMonth = new Date('2025-01-20T10:00:00.000Z');
        const dateOutOfMonth = new Date('2025-02-20T10:00:00.000Z');

        expect(result.current.isDateCurrent(dateInMonth)).toBe(true);
        expect(result.current.isDateCurrent(dateOutOfMonth)).toBe(false);
    });

    it('deve verificar se data é atual na visualização semanal', () => {
        const { result } = renderHook(() => useCalendarState('week'));

        const dateInWeek = new Date('2025-01-17T10:00:00.000Z');
        const dateOutOfWeek = new Date('2025-01-25T10:00:00.000Z');

        expect(result.current.isDateCurrent(dateInWeek)).toBe(true);
        expect(result.current.isDateCurrent(dateOutOfWeek)).toBe(false);
    });

    it('deve verificar se data é atual na visualização diária', () => {
        const { result } = renderHook(() => useCalendarState('day'));

        const sameDayDifferentTime = new Date('2025-01-15T15:30:00.000Z');
        const differentDay = new Date('2025-01-16T10:00:00.000Z');

        expect(result.current.isDateCurrent(sameDayDifferentTime)).toBe(true);
        expect(result.current.isDateCurrent(differentDay)).toBe(false);
    });

    it('deve obter rótulo de navegação para visualização mensal', () => {
        const { result } = renderHook(() => useCalendarState('month'));

        const label = result.current.getNavigationLabel();

        expect(label).toBe('janeiro de 2025');
    });

    it('deve obter rótulo de navegação para visualização semanal', () => {
        const { result } = renderHook(() => useCalendarState('week'));

        const label = result.current.getNavigationLabel();

        expect(label).toContain('jan');
        expect(label).toContain('15');
        expect(label).toContain('21');
    });

    it('deve obter rótulo de navegação para visualização diária', () => {
        const { result } = renderHook(() => useCalendarState('day'));

        const label = result.current.getNavigationLabel();

        expect(label).toBe('quarta-feira, 15 de janeiro de 2025');
    });

    it('deve resetar para estado inicial', () => {
        const { result } = renderHook(() => useCalendarState('week'));

        // Alterar estado
        act(() => {
            result.current.navigateToPrevious();
            result.current.setView('day');
            result.current.selectDate(new Date('2025-02-20T10:00:00.000Z'));
        });

        // Verificar que estado foi alterado
        expect(result.current.currentView).toBe('day');
        expect(result.current.selectedDate).toEqual(new Date('2025-02-20T10:00:00.000Z'));

        // Resetar
        act(() => {
            result.current.reset();
        });

        // Verificar reset para valores iniciais
        expect(result.current.currentDate).toEqual(new Date('2025-01-15T10:00:00.000Z'));
        expect(result.current.currentView).toBe('week'); // Visualização inicial
        expect(result.current.selectedDate).toBeNull();
    });
});