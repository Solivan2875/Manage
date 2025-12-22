import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SettingsButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
    children,
    variant = 'primary',
    onClick,
    loading = false,
    disabled = false,
    className,
    type = 'button'
}) => {
    const baseClasses = "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500",
        secondary: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(baseClasses, variantClasses[variant], className)}
        >
            {loading && (
                <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {children}
        </button>
    );
};