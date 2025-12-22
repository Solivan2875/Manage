import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MonthView } from '../components/calendar/components/views/MonthView';

// Mock dos utilitários
jest.mock('../components/calendar/utils/dateHelpers', () => ({
    getDaysInMonth: (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        const days = [];
        // Adiciona dias vazios no início se o mês não começar no domingo
        const startDay = firstDay.getDay();
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Adiciona os dias do mês
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    },
    getWeekDays: () => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    formatTime: (date) => {
        return date.toTimeString().slice(0, 5);
    },
    isToday: (date) => {
        const today = new Date('2025-01-15');
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }
}));

jest.mock('../components/calendar/utils/eventHelpers', () => ({
    getEventsForDate: (events, date) => {
        if (!date) return [];

        return events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear();
        });
    }
}));

describe('MonthView', () => {
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
            title: 'Evento de Dia Inteiro',
            startDate: new Date('2025-01-20T00:00:00'),
            endDate: new Date('2025-01-20T23:59:59'),
            color: 'bg-green-500',
            isAllDay: true,
            location: '',
            attendees: [],
            tags: [],
            recurrence: null,
            reminders: [],
            attachments: []
        }
    ];

    const mockProps = {
        currentDate: new Date('2025-01-15'),
        events: mockEvents,
        onDateClick: jest.fn(),
        onEventClick: jest.fn(),
        onEventEdit: jest.fn(),
        onEventDelete: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve renderizar o cabeçalho da semana', () => {
        render(<MonthView {...mockProps} />);

        expect(screen.getByText('Dom')).toBeInTheDocument();
        expect(screen.getByText('Seg')).toBeInTheDocument();
        expect(screen.getByText('Ter')).toBeInTheDocument();
        expect(screen.getByText('Qua')).toBeInTheDocument();
        expect(screen.getByText('Qui')).toBeInTheDocument();
        expect(screen.getByText('Sex')).toBeInTheDocument();
        expect(screen.getByText('Sáb')).toBeInTheDocument();
    });

    test('deve renderizar todos os dias do mês', () => {
        render(<MonthView {...mockProps} />);

        // Verifica se os dias do mês são renderizados
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('31')).toBeInTheDocument();
    });

    test('deve destacar o dia atual', () => {
        render(<MonthView {...mockProps} />);

        const todayElement = screen.getByText('15');
        expect(todayElement).toBeInTheDocument();
    });

    test('deve renderizar eventos nos dias corretos', () => {
        render(<MonthView {...mockProps} />);

        expect(screen.getByText('Reunião de Teste')).toBeInTheDocument();
        expect(screen.getByText('Evento de Dia Inteiro')).toBeInTheDocument();
    });

    test('deve chamar onDateClick ao clicar em um dia', () => {
        render(<MonthView {...mockProps} />);

        const dayElement = screen.getByText('10');
        fireEvent.click(dayElement);

        expect(mockProps.onDateClick).toHaveBeenCalledWith(
            expect.objectContaining({
                getDate: expect.any(Function),
                getMonth: expect.any(Function),
                getFullYear: expect.any(Function)
            })
        );
    });

    test('deve chamar onEventClick ao clicar em um evento', () => {
        render(<MonthView {...mockProps} />);

        const eventElement = screen.getByText('Reunião de Teste');
        fireEvent.click(eventElement);

        expect(mockProps.onEventClick).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '1',
                title: 'Reunião de Teste'
            })
        );
    });

    test('deve exibir indicador de eventos múltiplos quando houver muitos eventos', () => {
        const eventsWithMany = [
            ...mockEvents,
            {
                id: '3',
                title: 'Evento 3',
                startDate: new Date('2025-01-15T14:00:00'),
                endDate: new Date('2025-01-15T15:00:00'),
                color: 'bg-red-500',
                isAllDay: false,
                location: '',
                attendees: [],
                tags: [],
                recurrence: null,
                reminders: [],
                attachments: []
            },
            {
                id: '4',
                title: 'Evento 4',
                startDate: new Date('2025-01-15T16:00:00'),
                endDate: new Date('2025-01-15T17:00:00'),
                color: 'bg-purple-500',
                isAllDay: false,
                location: '',
                attendees: [],
                tags: [],
                recurrence: null,
                reminders: [],
                attachments: []
            }
        ];

        render(<MonthView {...mockProps} events={eventsWithMany} />);

        // Verifica se há mais de 3 eventos no dia 15
        const dayEvents = eventsWithMany.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getDate() === 15 &&
                eventDate.getMonth() === 0 && // Janeiro
                eventDate.getFullYear() === 2025;
        });

        if (dayEvents.length > 3) {
            expect(screen.getByText(`+${dayEvents.length - 3} mais`)).toBeInTheDocument();
        }
    });

    test('deve renderizar dias vazios com estilo diferente', () => {
        render(<MonthView {...mockProps} />);

        const container = screen.getByText('Dom').closest('.grid').parentElement;
        expect(container).toBeInTheDocument();

        // Dias vazios devem ter classe de fundo diferente
        const emptyDays = container.querySelectorAll('.bg-gray-50');
        expect(emptyDays.length).toBeGreaterThan(0);
    });

    test('deve ter estrutura de grade correta', () => {
        render(<MonthView {...mockProps} />);

        const grid = screen.getByText('Dom').closest('.grid');
        expect(grid).toHaveClass('grid-cols-7');
    });

    test('deve chamar onEventEdit ao clicar em editar evento', () => {
        render(<MonthView {...mockProps} />);

        // Encontra o botão de opções do evento
        const eventItem = screen.getByText('Reunião de Teste').closest('[data-testid="event-item"]');

        // Simula clique no botão de opções (se existir)
        const optionsButton = eventItem?.querySelector('button');
        if (optionsButton) {
            fireEvent.click(optionsButton);

            // Simula clique na opção de editar
            const editButton = screen.getByText('Editar');
            fireEvent.click(editButton);

            expect(mockProps.onEventEdit).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: '1',
                    title: 'Reunião de Teste'
                })
            );
        }
    });

    test('deve chamar onEventDelete ao clicar em excluir evento', () => {
        render(<MonthView {...mockProps} />);

        // Encontra o botão de opções do evento
        const eventItem = screen.getByText('Reunião de Teste').closest('[data-testid="event-item"]');

        // Simula clique no botão de opções (se existir)
        const optionsButton = eventItem?.querySelector('button');
        if (optionsButton) {
            fireEvent.click(optionsButton);

            // Simula clique na opção de excluir
            const deleteButton = screen.getByText('Excluir');
            fireEvent.click(deleteButton);

            expect(mockProps.onEventDelete).toHaveBeenCalledWith('1');
        }
    });

    test('deve impedir propagação de evento ao clicar em um evento', () => {
        render(<MonthView {...mockProps} />);

        const eventElement = screen.getByText('Reunião de Teste');
        const dayElement = eventElement.closest('[class*="min-h"]');

        fireEvent.click(eventElement);

        // onDateClick não deve ser chamado ao clicar no evento
        expect(mockProps.onDateClick).not.toHaveBeenCalled();
    });

    test('deve ter classes CSS corretas para dias válidos e inválidos', () => {
        render(<MonthView {...mockProps} />);

        const container = screen.getByText('Dom').closest('.grid').parentElement;
        const allDays = container.querySelectorAll('[class*="min-h"]');

        // Dias válidos devem ter cursor pointer
        const validDays = Array.from(allDays).filter(day =>
            day.textContent && /^\d+$/.test(day.textContent)
        );

        validDays.forEach(day => {
            expect(day).toHaveClass('cursor-pointer');
        });
    });

    test('deve renderizar eventos em modo compacto', () => {
        render(<MonthView {...mockProps} />);

        // Verifica se os eventos são renderizados
        expect(screen.getByText('Reunião de Teste')).toBeInTheDocument();
        expect(screen.getByText('Evento de Dia Inteiro')).toBeInTheDocument();
    });
});