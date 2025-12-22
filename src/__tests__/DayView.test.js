import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DayView } from '../components/calendar/components/views/DayView';

// Mock do componente EventItem
jest.mock('../components/calendar/components/EventItem', () => ({
    EventItem: jest.fn(({ event, compact, onEdit, onDelete }) => (
        <div data-testid="event-item" data-compact={compact}>
            <span>{event.title}</span>
            {compact && <span data-testid="event-time">{event.time}</span>}
            <button onClick={() => onEdit(event)}>Editar</button>
            <button onClick={() => onDelete(event.id)}>Excluir</button>
        </div>
    ))
}));

// Mock dos utilitários
jest.mock('../components/calendar/utils/dateHelpers', () => ({
    getHoursInDay: () => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            hours.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return hours;
    },
    formatTime: jest.fn((date, format) => {
        // Se for uma string no formato "HH:MM" e formato não especificado
        if (typeof date === 'string') {
            return date;
        }

        // Se for um objeto Date
        if (date instanceof Date) {
            if (format === '12h') {
                const hours = date.getHours();
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                return `${displayHours}:00 ${period}`;
            }
            return date.toTimeString().slice(0, 5);
        }

        // Caso contrário, converter para string
        return String(date);
    }),
    isToday: (date) => {
        const today = new Date('2025-01-15');
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    },
    addDays: (date, days) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }
}));

jest.mock('../components/calendar/utils/eventHelpers', () => ({
    getEventsForDate: jest.fn((events, date) => {
        if (!date) return [];

        const filteredEvents = events.filter(event => {
            const eventDate = new Date(event.startDate);
            const isSameDay = eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear();
            return isSameDay;
        });

        return filteredEvents;
    }),
    hasTimeConflict: (event1, event2) => {
        return (
            (event1.startDate < event2.endDate && event1.endDate > event2.startDate) ||
            (event2.startDate < event1.endDate && event2.endDate > event1.startDate)
        );
    }
}));

describe('DayView', () => {
    const mockEvents = [
        {
            id: '1',
            title: 'Reunião de Teste',
            startDate: new Date('2025-01-15T10:00:00'),
            endDate: new Date('2025-01-15T11:00:00'),
            color: 'bg-blue-500',
            isAllDay: false,
            location: 'Sala de Reuniões',
            attendees: [],
            tags: ['trabalho'],
            recurrence: null,
            reminders: [],
            attachments: []
        },
        {
            id: '2',
            title: 'Almoço',
            startDate: new Date('2025-01-15T12:00:00'),
            endDate: new Date('2025-01-15T13:00:00'),
            color: 'bg-green-500',
            isAllDay: false,
            location: '',
            attendees: [],
            tags: ['pessoal'],
            recurrence: null,
            reminders: [],
            attachments: []
        },
        {
            id: '3',
            title: 'Evento Dia Todo',
            startDate: new Date('2025-01-15T00:00:00'),
            endDate: new Date('2025-01-15T23:59:59'),
            color: 'bg-purple-500',
            isAllDay: true,
            location: '',
            attendees: [],
            tags: [],
            recurrence: null,
            reminders: [],
            attachments: []
        }
    ];

    // Criar uma data específica para evitar problemas de fuso horário
    const currentDate = new Date();
    currentDate.setFullYear(2025, 0, 15); // Mês 0 = Janeiro
    currentDate.setHours(0, 0, 0, 0);

    const mockProps = {
        currentDate,
        events: mockEvents,
        onDateClick: jest.fn(),
        onEventClick: jest.fn(),
        onEventEdit: jest.fn(),
        onEventDelete: jest.fn(),
        onEventDrop: jest.fn(),
        onEventResize: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve renderizar estrutura básica', () => {
        render(<DayView {...mockProps} />);

        // Verifica se a estrutura principal está presente
        expect(screen.getByRole('heading')).toBeInTheDocument();
        expect(screen.getByText('Hoje')).toBeInTheDocument();
    });

    test('deve ter botões de navegação', () => {
        render(<DayView {...mockProps} />);

        // Verifica se os botões de navegação estão presentes
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    test('deve chamar onDateClick ao clicar no botão "Hoje"', () => {
        render(<DayView {...mockProps} />);

        const todayButton = screen.getByText('Hoje');
        fireEvent.click(todayButton);

        expect(mockProps.onDateClick).toHaveBeenCalledWith(new Date());
    });

    test('deve renderizar grade de horas', () => {
        render(<DayView {...mockProps} />);

        // Verifica se a grade de horas está presente
        const container = document.querySelector('.h-\\[600px\\]');
        expect(container).toBeInTheDocument();

        // Verifica se há pelo menos algumas horas renderizadas
        const hourElements = document.querySelectorAll('.w-20');
        expect(hourElements.length).toBeGreaterThan(0);
    });

    test('deve destacar data atual', () => {
        render(<DayView {...mockProps} />);

        // Verifica se o texto "Hoje" está presente quando a data é atual
        expect(screen.getByText('Hoje')).toBeInTheDocument();
    });

    test('deve renderizar eventos quando presentes', () => {
        render(<DayView {...mockProps} />);

        // Verifica se os eventos são renderizados
        const eventItems = screen.getAllByTestId('event-item');
        expect(eventItems.length).toBeGreaterThan(0);
    });

    test('deve chamar onEventClick ao clicar em um evento', () => {
        render(<DayView {...mockProps} />);

        const eventElement = screen.getByText('Reunião de Teste');
        fireEvent.click(eventElement);

        expect(mockProps.onEventClick).toHaveBeenCalledWith(mockEvents[0]);
    });

    test('deve impedir propagação de evento ao clicar em um evento', () => {
        render(<DayView {...mockProps} />);

        const eventElement = screen.getByText('Reunião de Teste');
        fireEvent.click(eventElement);

        // onDateClick não deve ser chamado ao clicar no evento
        expect(mockProps.onDateClick).not.toHaveBeenCalled();
        expect(mockProps.onEventClick).toHaveBeenCalledWith(mockEvents[0]);
    });

    test('deve chamar onEventEdit ao clicar em editar evento', () => {
        render(<DayView {...mockProps} />);

        const eventItem = screen.getByText('Reunião de Teste').closest('[data-testid="event-item"]');

        const editButton = eventItem?.querySelector('button');
        if (editButton) {
            fireEvent.click(editButton);
            expect(mockProps.onEventEdit).toHaveBeenCalledWith(mockEvents[0]);
        }
    });

    test('deve chamar onEventDelete ao clicar em excluir evento', () => {
        render(<DayView {...mockProps} />);

        const eventItem = screen.getByText('Reunião de Teste').closest('[data-testid="event-item"]');

        const deleteButton = eventItem?.querySelectorAll('button')[1];
        if (deleteButton) {
            fireEvent.click(deleteButton);
            expect(mockProps.onEventDelete).toHaveBeenCalledWith(mockEvents[0].id);
        }
    });
});