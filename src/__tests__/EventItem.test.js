import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventItem } from '../components/calendar/components/EventItem';

// Mock do utilitário de formatação de data
jest.mock('../components/calendar/utils/dateHelpers', () => ({
    formatTime: (date) => '10:00'
}));

describe('EventItem', () => {
    const mockEvent = {
        id: '1',
        title: 'Reunião de Teste',
        description: 'Descrição da reunião',
        startDate: new Date('2025-01-15T10:00:00'),
        endDate: new Date('2025-01-15T11:00:00'),
        color: 'bg-blue-500',
        isAllDay: false,
        location: 'Sala de Reuniões',
        attendees: [
            { id: '1', name: 'João Silva', email: 'joao@example.com' }
        ],
        tags: ['trabalho', 'importante'],
        recurrence: null,
        reminders: [],
        attachments: []
    };

    const mockProps = {
        event: mockEvent,
        compact: false,
        showActions: true,
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        onClick: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve renderizar o evento não compacto corretamente', () => {
        render(<EventItem {...mockProps} />);

        expect(screen.getByText('Reunião de Teste')).toBeInTheDocument();
        expect(screen.getByText('10:00 - 10:00')).toBeInTheDocument();
        expect(screen.getByText('Sala de Reuniões')).toBeInTheDocument();
        expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    test('deve renderizar o evento compacto corretamente', () => {
        render(<EventItem {...mockProps} compact={true} />);

        expect(screen.getByText('10:00')).toBeInTheDocument();
        expect(screen.getByText('Reunião de Teste')).toBeInTheDocument();
    });

    test('deve chamar onClick quando clicado', () => {
        render(<EventItem {...mockProps} />);

        fireEvent.click(screen.getByText('Reunião de Teste'));
        expect(mockProps.onClick).toHaveBeenCalledWith(mockEvent);
    });

    test('deve exibir tags quando presentes', () => {
        render(<EventItem {...mockProps} />);

        expect(screen.getByText('trabalho')).toBeInTheDocument();
        expect(screen.getByText('importante')).toBeInTheDocument();
    });

    test('deve exibir "Dia inteiro" para eventos de dia inteiro', () => {
        const allDayEvent = {
            ...mockEvent,
            isAllDay: true
        };

        render(<EventItem {...mockProps} event={allDayEvent} />);

        expect(screen.getByText('Dia inteiro')).toBeInTheDocument();
    });

    test('deve exibir múltiplos participantes', () => {
        const eventWithMultipleAttendees = {
            ...mockEvent,
            attendees: [
                { id: '1', name: 'João Silva', email: 'joao@example.com' },
                { id: '2', name: 'Maria Santos', email: 'maria@example.com' }
            ]
        };

        render(<EventItem {...mockProps} event={eventWithMultipleAttendees} />);

        expect(screen.getByText('2 participantes')).toBeInTheDocument();
    });

    test('não deve exibir localização quando não definida', () => {
        const eventWithoutLocation = {
            ...mockEvent,
            location: null
        };

        render(<EventItem {...mockProps} event={eventWithoutLocation} />);

        expect(screen.queryByText('Sala de Reuniões')).not.toBeInTheDocument();
    });

    test('não deve exibir participantes quando não definidos', () => {
        const eventWithoutAttendees = {
            ...mockEvent,
            attendees: []
        };

        render(<EventItem {...mockProps} event={eventWithoutAttendees} />);

        expect(screen.queryByText(/participantes/)).not.toBeInTheDocument();
        expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
    });

    test('deve abrir menu de opções ao clicar no botão de opções', () => {
        render(<EventItem {...mockProps} />);

        const optionsButton = screen.getByRole('button');
        fireEvent.click(optionsButton);

        expect(screen.getByText('Editar')).toBeInTheDocument();
        expect(screen.getByText('Excluir')).toBeInTheDocument();
    });

    test('deve chamar onEdit ao clicar em Editar', () => {
        render(<EventItem {...mockProps} />);

        const optionsButton = screen.getByRole('button');
        fireEvent.click(optionsButton);

        const editButton = screen.getByText('Editar');
        fireEvent.click(editButton);

        expect(mockProps.onEdit).toHaveBeenCalledWith(mockEvent);
    });

    test('deve chamar onDelete ao clicar em Excluir', () => {
        render(<EventItem {...mockProps} />);

        const optionsButton = screen.getByRole('button');
        fireEvent.click(optionsButton);

        const deleteButton = screen.getByText('Excluir');
        fireEvent.click(deleteButton);

        expect(mockProps.onDelete).toHaveBeenCalledWith(mockEvent.id);
    });

    test('não deve exibir botão de opções quando showActions é false', () => {
        render(<EventItem {...mockProps} showActions={false} />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('deve ter cor de fundo correta no modo compacto', () => {
        render(<EventItem {...mockProps} compact={true} />);

        const eventElement = screen.getByText('Reunião de Teste').closest('div');
        expect(eventElement).toHaveClass('bg-blue-500');
    });

    test('deve ter tooltip no modo compacto', () => {
        render(<EventItem {...mockProps} compact={true} />);

        const eventElement = screen.getByText('Reunião de Teste').closest('div');
        expect(eventElement).toHaveAttribute('title', 'Reunião de Teste');
    });

    test('deve fechar menu de opções após clicar em Editar', () => {
        render(<EventItem {...mockProps} />);

        const optionsButton = screen.getByRole('button');
        fireEvent.click(optionsButton);

        const editButton = screen.getByText('Editar');
        fireEvent.click(editButton);

        // Menu deve estar fechado (não deve mais estar no DOM)
        expect(screen.queryByText('Excluir')).not.toBeInTheDocument();
    });

    test('deve fechar menu de opções após clicar em Excluir', () => {
        render(<EventItem {...mockProps} />);

        const optionsButton = screen.getByRole('button');
        fireEvent.click(optionsButton);

        const deleteButton = screen.getByText('Excluir');
        fireEvent.click(deleteButton);

        // Menu deve estar fechado (não deve mais estar no DOM)
        expect(screen.queryByText('Editar')).not.toBeInTheDocument();
    });

    test('deve impedir propagação de evento ao clicar nos botões de ação', () => {
        render(<EventItem {...mockProps} />);

        const optionsButton = screen.getByRole('button');
        fireEvent.click(optionsButton);

        // onClick do evento não deve ser chamado ao clicar no botão de opções
        expect(mockProps.onClick).not.toHaveBeenCalled();
    });
});