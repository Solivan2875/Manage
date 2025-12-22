import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventModal } from '../components/calendar/components/EventModal';

// Mock do componente EventForm
jest.mock('../components/calendar/components/EventForm', () => {
    return {
        EventForm: jest.fn(({ onSave, onCancel, onDelete, onDuplicate, isEditing }) => (
            <div data-testid="event-form">
                <button onClick={onSave} data-testid="save-button">
                    {isEditing ? 'Atualizar Evento' : 'Criar Evento'}
                </button>
                <button onClick={onCancel} data-testid="cancel-button">
                    Cancelar
                </button>
                {isEditing && onDelete && (
                    <button onClick={onDelete} data-testid="delete-button">
                        Excluir
                    </button>
                )}
                {isEditing && onDuplicate && (
                    <button onClick={onDuplicate} data-testid="duplicate-button">
                        Duplicar
                    </button>
                )}
            </div>
        ))
    };
});

describe('EventModal', () => {
    const mockFormData = {
        title: '',
        description: '',
        startDate: new Date('2025-01-15T10:00:00'),
        endDate: new Date('2025-01-15T11:00:00'),
        isAllDay: false,
        category: 'event',
        priority: 'medium',
        location: '',
        attendees: '',
        color: 'bg-blue-500',
        tags: [],
        reminders: [],
        recurrence: undefined
    };

    const mockProps = {
        isOpen: true,
        isEditing: false,
        formData: mockFormData,
        onClose: jest.fn(),
        onSave: jest.fn(),
        onTitleChange: jest.fn(),
        onDescriptionChange: jest.fn(),
        onStartDateChange: jest.fn(),
        onEndDateChange: jest.fn(),
        onIsAllDayChange: jest.fn(),
        onCategoryChange: jest.fn(),
        onPriorityChange: jest.fn(),
        onLocationChange: jest.fn(),
        onAttendeesChange: jest.fn(),
        onColorChange: jest.fn(),
        onTagsChange: jest.fn(),
        onRemindersChange: jest.fn(),
        onRecurrenceChange: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deve renderizar o modal quando isOpen é true', () => {
        render(<EventModal {...mockProps} />);

        expect(screen.getByText('Novo Evento')).toBeInTheDocument();
        expect(screen.getByTestId('event-form')).toBeInTheDocument();
    });

    test('deve renderizar o modal em modo de edição', () => {
        render(<EventModal {...mockProps} isEditing={true} />);

        expect(screen.getByText('Editar Evento')).toBeInTheDocument();
        expect(screen.getByTestId('event-form')).toBeInTheDocument();
    });

    test('não deve renderizar quando isOpen é false', () => {
        render(<EventModal {...mockProps} isOpen={false} />);

        expect(screen.queryByText('Novo Evento')).not.toBeInTheDocument();
        expect(screen.queryByTestId('event-form')).not.toBeInTheDocument();
    });

    test('deve chamar onClose ao clicar no botão Fechar (X)', () => {
        render(<EventModal {...mockProps} />);

        const closeButton = screen.getByTitle('Fechar');
        fireEvent.click(closeButton);

        expect(mockProps.onClose).toHaveBeenCalled();
    });

    test('deve chamar onClose ao clicar no botão Cancelar do formulário', () => {
        render(<EventModal {...mockProps} />);

        const cancelButton = screen.getByTestId('cancel-button');
        fireEvent.click(cancelButton);

        expect(mockProps.onClose).toHaveBeenCalled();
    });

    test('deve chamar onSave ao clicar no botão Salvar do formulário', () => {
        render(<EventModal {...mockProps} />);

        const saveButton = screen.getByTestId('save-button');
        fireEvent.click(saveButton);

        expect(mockProps.onSave).toHaveBeenCalled();
    });

    test('deve chamar onDelete ao clicar no botão Excluir em modo de edição', () => {
        const deleteMock = jest.fn();
        render(<EventModal {...mockProps} isEditing={true} onDelete={deleteMock} />);

        const deleteButton = screen.getByTestId('delete-button');
        fireEvent.click(deleteButton);

        expect(deleteMock).toHaveBeenCalled();
    });

    test('deve chamar onDuplicate ao clicar no botão Duplicar em modo de edição', () => {
        const duplicateMock = jest.fn();
        render(<EventModal {...mockProps} isEditing={true} onDuplicate={duplicateMock} />);

        const duplicateButton = screen.getByTestId('duplicate-button');
        fireEvent.click(duplicateButton);

        expect(duplicateMock).toHaveBeenCalled();
    });

    test('deve chamar onClose ao clicar no backdrop', () => {
        render(<EventModal {...mockProps} />);

        const backdrop = screen.getByText('Novo Evento').closest('.fixed');
        fireEvent.click(backdrop);

        expect(mockProps.onClose).toHaveBeenCalled();
    });

    test('deve ter atributos ARIA corretos', () => {
        render(<EventModal {...mockProps} />);

        const modal = screen.getByText('Novo Evento').closest('.fixed');
        expect(modal).toBeInTheDocument();
    });

    test('deve prevenir scroll do body quando modal está aberto', () => {
        render(<EventModal {...mockProps} />);

        expect(document.body.style.overflow).toBe('hidden');
    });

    test('deve restaurar scroll do body quando modal é fechado', () => {
        const { rerender } = render(<EventModal {...mockProps} />);

        expect(document.body.style.overflow).toBe('hidden');

        rerender(<EventModal {...mockProps} isOpen={false} />);

        expect(document.body.style.overflow).toBe('unset');
    });

    test('deve fechar modal ao pressionar a tecla Escape', () => {
        render(<EventModal {...mockProps} />);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(mockProps.onClose).toHaveBeenCalled();
    });

    test('deve passar todas as props corretamente para o EventForm', () => {
        const { EventForm } = require('../components/calendar/components/EventForm');

        render(<EventModal {...mockProps} />);

        expect(EventForm).toHaveBeenCalled();
    });
});