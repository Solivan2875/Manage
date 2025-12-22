import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
    variant?: 'simple' | 'full' | 'switch';
    showLabel?: boolean;
    className?: string;
}

export const ThemeToggle = ({ variant = 'simple', showLabel = true, className = '' }: ThemeToggleProps) => {
    const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

    // Simple toggle button (light/dark only)
    if (variant === 'simple') {
        return (
            <button
                onClick={toggleTheme}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors ${className}`}
                title={resolvedTheme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            >
                {resolvedTheme === 'light' ? (
                    <>
                        <Moon className="w-5 h-5" />
                        {showLabel && <span>Modo escuro</span>}
                    </>
                ) : (
                    <>
                        <Sun className="w-5 h-5" />
                        {showLabel && <span>Modo claro</span>}
                    </>
                )}
            </button>
        );
    }

    // Modern switch toggle
    if (variant === 'switch') {
        return (
            <button
                onClick={toggleTheme}
                className={`relative flex items-center gap-2 p-1 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors ${className}`}
                title={resolvedTheme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            >
                <div
                    className={`absolute w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out ${resolvedTheme === 'dark' ? 'translate-x-8' : 'translate-x-0'
                        }`}
                />
                <div className="relative z-10 w-8 h-8 flex items-center justify-center">
                    <Sun className={`w-4 h-4 transition-colors ${resolvedTheme === 'light' ? 'text-amber-500' : 'text-gray-400'}`} />
                </div>
                <div className="relative z-10 w-8 h-8 flex items-center justify-center">
                    <Moon className={`w-4 h-4 transition-colors ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
                </div>
            </button>
        );
    }

    // Full theme selector with system option
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {showLabel && (
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
                    Tema
                </span>
            )}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${theme === 'light'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    title="Modo claro"
                >
                    <Sun className="w-4 h-4" />
                    <span className="hidden sm:inline">Claro</span>
                </button>
                <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${theme === 'dark'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    title="Modo escuro"
                >
                    <Moon className="w-4 h-4" />
                    <span className="hidden sm:inline">Escuro</span>
                </button>
                <button
                    onClick={() => setTheme('system')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${theme === 'system'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    title="Usar tema do sistema"
                >
                    <Monitor className="w-4 h-4" />
                    <span className="hidden sm:inline">Sistema</span>
                </button>
            </div>
        </div>
    );
};

// Compact theme toggle for headers
export const ThemeToggleCompact = ({ className = '' }: { className?: string }) => {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors ${className}`}
            title={resolvedTheme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        >
            {resolvedTheme === 'light' ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5" />
            )}
        </button>
    );
};

// Animated theme toggle icon
export const ThemeToggleAnimated = ({ className = '' }: { className?: string }) => {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors overflow-hidden ${className}`}
            title={resolvedTheme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        >
            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${resolvedTheme === 'light'
                            ? 'opacity-100 rotate-0 scale-100 text-amber-500'
                            : 'opacity-0 rotate-90 scale-0'
                        }`}
                />
                <Moon
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${resolvedTheme === 'dark'
                            ? 'opacity-100 rotate-0 scale-100 text-blue-400'
                            : 'opacity-0 -rotate-90 scale-0'
                        }`}
                />
            </div>
        </button>
    );
};
