import { cn } from '../../../lib/utils';

interface SettingsInputProps {
    label: string;
    description?: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'email' | 'password' | 'tel';
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    maxLength?: number;
}

export const SettingsInput: React.FC<SettingsInputProps> = ({
    label,
    description,
    value,
    onChange,
    type = 'text',
    placeholder,
    disabled = false,
    error,
    className,
    maxLength
}) => {
    return (
        <div className={cn("space-y-1", className)}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>

            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            )}

            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                className={cn(
                    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
                    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                    "placeholder-gray-500 dark:placeholder-gray-400",
                    "focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    error && "border-red-500 focus:ring-red-500 focus:border-red-500"
                )}
            />

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}

            {maxLength && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {value.length}/{maxLength}
                </p>
            )}
        </div>
    );
};