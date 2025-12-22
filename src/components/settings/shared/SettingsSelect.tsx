import { useState, Fragment } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SettingsSelectProps {
    label: string;
    description?: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({
    label,
    description,
    value,
    options,
    onChange,
    disabled = false,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(option => option.value === value);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

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

            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={cn(
                        "relative w-full cursor-default rounded-lg border border-gray-300 dark:border-gray-600",
                        "bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left",
                        "text-gray-900 dark:text-white shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    <span className="block truncate">
                        {selectedOption?.label || 'Selecione uma opção'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown className={cn("h-5 w-5 text-gray-400 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                    "relative cursor-default select-none py-2 pl-3 pr-9",
                                    value === option.value
                                        ? "bg-teal-100 dark:bg-teal-900/30 text-teal-900 dark:text-teal-400"
                                        : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                                )}
                            >
                                <span className={cn(
                                    "block truncate",
                                    value === option.value ? "font-medium" : "font-normal"
                                )}>
                                    {option.label}
                                </span>

                                {value === option.value && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-teal-600 dark:text-teal-400">
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};