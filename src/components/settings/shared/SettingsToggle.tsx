import { cn } from '../../../lib/utils';

interface SettingsToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
    label,
    description,
    checked,
    onChange,
    disabled = false,
    className
}) => {
    return (
        <div className={cn("flex items-center justify-between", className)}>
            <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    {label}
                </label>
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {description}
                    </p>
                )}
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
                    checked
                        ? "bg-teal-600 hover:bg-teal-700"
                        : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <span
                    className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        checked ? "translate-x-6" : "translate-x-1"
                    )}
                />
            </button>
        </div>
    );
};