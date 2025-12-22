import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface SettingsCardProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
    title,
    description,
    children,
    className
}) => {
    return (
        <div className={cn(
            "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
            "shadow-sm hover:shadow-md transition-shadow",
            className
        )}>
            {(title || description) && (
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    {title && (
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            )}

            <div className={cn(
                "p-6",
                !title && !description && "pt-6"
            )}>
                {children}
            </div>
        </div>
    );
};