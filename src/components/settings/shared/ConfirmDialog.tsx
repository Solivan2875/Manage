import { useEffect, useRef } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SettingsButton } from './SettingsButton';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'info',
    loading = false,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Focus the dialog when it opens
            if (dialogRef.current) {
                dialogRef.current.focus();
            }
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, loading, onClose]);

    // Prevent body scroll when dialog is open
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

    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return AlertTriangle;
            case 'warning':
                return AlertTriangle;
            case 'success':
                return CheckCircle;
            case 'info':
            default:
                return Info;
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'danger':
                return 'text-red-600 dark:text-red-400';
            case 'warning':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'success':
                return 'text-green-600 dark:text-green-400';
            case 'info':
            default:
                return 'text-blue-600 dark:text-blue-400';
        }
    };

    const getButtonVariant = () => {
        switch (variant) {
            case 'danger':
                return 'danger' as const;
            case 'warning':
                return 'secondary' as const;
            case 'success':
                return 'primary' as const;
            case 'info':
            default:
                return 'primary' as const;
        }
    };

    const Icon = getIcon();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={loading ? undefined : onClose}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                className={cn(
                    "relative bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4",
                    "transform transition-all duration-200 scale-100 opacity-100"
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-message"
                tabIndex={-1}
            >
                {/* Close Button */}
                {!loading && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label="Fechar diálogo"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Content */}
                <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            variant === 'danger' && "bg-red-100 dark:bg-red-900/20",
                            variant === 'warning' && "bg-yellow-100 dark:bg-yellow-900/20",
                            variant === 'success' && "bg-green-100 dark:bg-green-900/20",
                            variant === 'info' && "bg-blue-100 dark:bg-blue-900/20"
                        )}>
                            <Icon className={cn("w-6 h-6", getIconColor())} />
                        </div>

                        <div className="flex-1">
                            <h3
                                id="dialog-title"
                                className="text-lg font-semibold text-gray-900 dark:text-white"
                            >
                                {title}
                            </h3>
                        </div>
                    </div>

                    {/* Message */}
                    <p
                        id="dialog-message"
                        className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed"
                    >
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <SettingsButton
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                            className="w-full sm:w-auto order-2 sm:order-1"
                        >
                            {cancelText}
                        </SettingsButton>

                        <SettingsButton
                            variant={getButtonVariant()}
                            onClick={onConfirm}
                            loading={loading}
                            disabled={loading}
                            className={cn(
                                "w-full sm:w-auto order-1 sm:order-2",
                                variant === 'danger' && "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            )}
                        >
                            {confirmText}
                        </SettingsButton>
                    </div>
                </div>
            </div>
        </div>
    );
};