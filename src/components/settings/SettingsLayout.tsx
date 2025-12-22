import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, Home, User, Settings as SettingsIcon, Database, Accessibility, Info, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SettingsBreadcrumb } from './shared';
import type { TabItem } from '../../types/settings';

interface SettingsLayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabs: TabItem[];
}

const getTabIcon = (tabId: string) => {
    switch (tabId) {
        case 'profile':
            return User;
        case 'system':
            return SettingsIcon;
        case 'data':
            return Database;
        case 'accessibility':
            return Accessibility;
        case 'about':
            return Info;
        default:
            return SettingsIcon;
    }
};

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    tabs
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Filter tabs based on search
    const filteredTabs = tabs.filter(tab =>
        tab.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Search shortcut (Ctrl/Cmd + K)
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                setIsSearchOpen(true);
                return;
            }

            // Escape to close search
            if (event.key === 'Escape' && isSearchOpen) {
                setIsSearchOpen(false);
                setSearchQuery('');
                return;
            }

            // Tab navigation with arrow keys
            if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && !isSearchOpen) {
                event.preventDefault();
                const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                let newIndex;

                if (event.key === 'ArrowRight') {
                    newIndex = (currentIndex + 1) % tabs.length;
                } else {
                    newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
                }

                onTabChange(tabs[newIndex].id);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeTab, onTabChange, tabs, isSearchOpen]);

    const currentTab = tabs.find(t => t.id === activeTab);

    const breadcrumbItems = [
        { label: 'Configurações', href: '/settings' },
        { label: currentTab?.label || '' }
    ];

    const handleSearchSelect = (tabId: string) => {
        onTabChange(tabId);
        setSearchQuery('');
        setIsSearchOpen(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Configurações</h2>
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    aria-label="Buscar configurações"
                >
                    <Search className="w-5 h-5" />
                </button>
            </div>

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsSearchOpen(false)}
                    />
                    <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar configurações..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                    aria-label="Fechar busca"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Navigation */}
            <aside className="lg:w-64 flex-shrink-0 lg:block hidden">
                {/* Search Bar for Desktop */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar configurações... (Ctrl+K)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchOpen(true)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {(searchQuery ? filteredTabs : tabs).map((tab) => {
                        const Icon = getTabIcon(tab.id);
                        return (
                            <button
                                key={tab.id}
                                onClick={() => searchQuery ? handleSearchSelect(tab.id) : onTabChange(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    activeTab === tab.id
                                        ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-l-4 border-teal-600"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Breadcrumb */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <SettingsBreadcrumb items={breadcrumbItems} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 lg:ml-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    {children}
                </div>
            </main>
        </div>
    );
};