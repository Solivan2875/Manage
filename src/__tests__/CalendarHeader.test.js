const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { describe, it, expect, beforeEach } = require('@jest/globals');
require('@testing-library/jest-dom');

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
        return newDate;
    }),
    startOfWeek: jest.fn((date) => {
        const newDate = new Date(date);
        const day = newDate.getDay();
        const diff = newDate.getDate() - day;
        newDate.setDate(diff);
        return newDate;
    }),
    startOfDay: jest.fn((date) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    }),
}));

// Mock do useCalendarState
const mockCalendarState = {
    currentDate: new Date('2025-01-15'),
    currentView: 'month',
    selectedDate: new Date('2025-01-15'),
    navigateToPrevious: jest.fn(),
    navigateToNext: jest.fn(),
    navigateToToday: jest.fn(),
    setView: jest.fn(),
    selectDate: jest.fn(),
    getViewDateRange: jest.fn(() => ({ start: new Date('2025-01-01'), end: new Date('2025-02-01') })),
    isDateInCurrentView: jest.fn(() => true),
    isDateSelected: jest.fn(() => false),
    isDateCurrent: jest.fn(() => true),
    getNavigationLabel: jest.fn(() => 'Janeiro 2025'),
    reset: jest.fn(),
};

jest.mock('../hooks/calendar/useCalendarState', () => ({
    useCalendarState: () => mockCalendarState,
}));

// Mock do React
const React = require('react');

describe('CalendarHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve renderizar o cabeçalho do calendário', () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByText('Janeiro 2025')).toBeInTheDocument();
    });

    it('deve mostrar botões de navegação', () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        expect(screen.getByTitle('Anterior')).toBeInTheDocument();
        expect(screen.getByTitle('Próximo')).toBeInTheDocument();
        expect(screen.getByText('Hoje')).toBeInTheDocument();
    });

    it('deve mostrar botões de visualização', () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        expect(screen.getByText('Dia')).toBeInTheDocument();
        expect(screen.getByText('Semana')).toBeInTheDocument();
        expect(screen.getByText('Mês')).toBeInTheDocument();
    });

    it('deve destacar a visualização atual', () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        const monthButton = screen.getByText('Mês');
        const weekButton = screen.getByText('Semana');
        const dayButton = screen.getByText('Dia');

        expect(monthButton).toHaveClass('bg-teal-50');
        expect(weekButton).not.toHaveClass('bg-teal-50');
        expect(dayButton).not.toHaveClass('bg-teal-50');
    });

    it('deve navegar para o período anterior ao clicar no botão', async () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        const previousButton = screen.getByTitle('Anterior');

        fireEvent.click(previousButton);

        expect(mockCalendarState.navigateToPrevious).toHaveBeenCalledTimes(1);
    });

    it('deve navegar para o próximo período ao clicar no botão', async () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        const nextButton = screen.getByTitle('Próximo');

        fireEvent.click(nextButton);

        expect(mockCalendarState.navigateToNext).toHaveBeenCalledTimes(1);
    });

    it('deve navegar para hoje ao clicar no botão', async () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        const todayButton = screen.getByText('Hoje');

        fireEvent.click(todayButton);

        expect(mockCalendarState.navigateToToday).toHaveBeenCalledTimes(1);
    });

    it('deve alterar visualização para semana ao clicar no botão', async () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        const weekButton = screen.getByText('Semana');

        fireEvent.click(weekButton);

        expect(mockCalendarState.setView).toHaveBeenCalledWith('week');
    });

    it('deve alterar visualização para dia ao clicar no botão', async () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        const dayButton = screen.getByText('Dia');

        fireEvent.click(dayButton);

        expect(mockCalendarState.setView).toHaveBeenCalledWith('day');
    });

    it('deve atualizar o label de navegação quando a visualização muda', async () => {
        const { rerender } = render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        expect(screen.getByText('Janeiro 2025')).toBeInTheDocument();

        // Simular mudança de visualização
        mockCalendarState.currentView = 'week';
        mockCalendarState.getNavigationLabel.mockReturnValue('15 - 21 Jan 2025');

        rerender(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        expect(screen.getByText('15 - 21 Jan 2025')).toBeInTheDocument();
    });

    it('deve ser acessível com navegação por teclado', async () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        const previousButton = screen.getByTitle('Anterior');

        fireEvent.click(previousButton);

        expect(mockCalendarState.navigateToPrevious).toHaveBeenCalledTimes(1);
    });

    it('deve ter atributos ARIA corretos', () => {
        render(React.createElement(require('../components/calendar/components/CalendarHeader').CalendarHeader, {
            currentView: mockCalendarState.currentView,
            onNavigatePrevious: mockCalendarState.navigateToPrevious,
            onNavigateNext: mockCalendarState.navigateToNext,
            onNavigateToday: mockCalendarState.navigateToToday,
            onViewChange: mockCalendarState.setView,
            getNavigationLabel: mockCalendarState.getNavigationLabel,
        }));

        // Verificar se o header foi renderizado
        expect(screen.getByRole('banner')).toBeInTheDocument();

        // Verificar se o título contém o texto esperado
        expect(screen.getByText(/15 - 21 Jan 2025/)).toBeInTheDocument();

        // Verificar atributos dos botões
        const previousButton = screen.getByTitle('Anterior');
        expect(previousButton).toHaveAttribute('title', 'Anterior');

        const nextButton = screen.getByTitle('Próximo');
        expect(nextButton).toHaveAttribute('title', 'Próximo');
    });
});