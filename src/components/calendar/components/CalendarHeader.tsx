import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { CalendarView } from '../../../types/calendar';

interface CalendarHeaderProps {
    currentView: CalendarView;
    onNavigatePrevious: () => void;
    onNavigateNext: () => void;
    onNavigateToday: () => void;
    onViewChange: (view: CalendarView) => void;
    getNavigationLabel: () => string;
}

export const CalendarHeader = ({
    currentView,
    onNavigatePrevious,
    onNavigateNext,
    onNavigateToday,
    onViewChange,
    getNavigationLabel
}: CalendarHeaderProps) => {
    return (
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-teal-600" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {getNavigationLabel()}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onNavigatePrevious}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <button
                        onClick={onNavigateToday}
                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        Hoje
                    </button>

                    <button
                        onClick={onNavigateNext}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Próximo"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onViewChange('day')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'day'
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    Dia
                </button>

                <button
                    onClick={() => onViewChange('week')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'week'
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    Semana
                </button>

                <button
                    onClick={() => onViewChange('month')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === 'month'
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    Mês
                </button>
            </div>
        </header>
    );
};