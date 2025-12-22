import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { EventFormData, EventCategory, Priority } from '../../../types/calendar';
import { EventForm } from './EventForm';

interface EventModalProps {
    isOpen: boolean;
    isEditing: boolean;
    formData: EventFormData;
    titleInputRef?: React.RefObject<HTMLInputElement>;
    onClose: () => void;
    onSave: () => void;
    onDelete?: () => void;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
    onIsAllDayChange: (isAllDay: boolean) => void;
    onCategoryChange: (category: EventCategory) => void;
    onPriorityChange: (priority: Priority) => void;
    onLocationChange: (value: string) => void;
    onAttendeesChange: (value: string) => void;
    onColorChange: (value: string) => void;
    onTagsChange: (tags: string[]) => void;
    onRemindersChange: (reminders: any[]) => void;
    onRecurrenceChange: (recurrence?: any) => void;
    onDuplicate?: () => void;
}

export const EventModal = ({
    isOpen,
    isEditing,
    formData,
    titleInputRef,
    onClose,
    onSave,
    onDelete,
    onTitleChange,
    onDescriptionChange,
    onStartDateChange,
    onEndDateChange,
    onIsAllDayChange,
    onCategoryChange,
    onPriorityChange,
    onLocationChange,
    onAttendeesChange,
    onColorChange,
    onTagsChange,
    onRemindersChange,
    onRecurrenceChange,
    onDuplicate
}: EventModalProps) => {
    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {isEditing ? 'Editar Evento' : 'Novo Evento'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Fechar"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6">
                    <EventForm
                        formData={formData}
                        isEditing={isEditing}
                        inputRef={titleInputRef}
                        onTitleChange={onTitleChange}
                        onDescriptionChange={onDescriptionChange}
                        onStartDateChange={onStartDateChange}
                        onEndDateChange={onEndDateChange}
                        onIsAllDayChange={onIsAllDayChange}
                        onCategoryChange={onCategoryChange}
                        onPriorityChange={onPriorityChange}
                        onLocationChange={onLocationChange}
                        onAttendeesChange={onAttendeesChange}
                        onColorChange={onColorChange}
                        onTagsChange={onTagsChange}
                        onRemindersChange={onRemindersChange}
                        onRecurrenceChange={onRecurrenceChange}
                        onCancel={onClose}
                        onSave={onSave}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                    />
                </div>
            </div>
        </div>
    );
};