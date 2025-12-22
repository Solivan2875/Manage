import { Home, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface SettingsBreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export const SettingsBreadcrumb: React.FC<SettingsBreadcrumbProps> = ({
    items,
    className
}) => {
    return (
        <nav className={cn("flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400", className)}>
            <Home className="w-4 h-4" />
            <ChevronRight className="w-4 h-4" />

            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                    {item.href ? (
                        <a
                            href={item.href}
                            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            {item.label}
                        </a>
                    ) : (
                        <span className="text-gray-900 dark:text-white font-medium">
                            {item.label}
                        </span>
                    )}

                    {index < items.length - 1 && (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </div>
            ))}
        </nav>
    );
};