import { NavLink } from 'react-router-dom';
import { PenSquare, FileText, CheckCircle2, CalendarDays, Settings, ChevronDown, ListFilter, Plus, Moon, Sun, LogOut, User, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useTag } from '../context/TagContext';
import { useState, useRef, useEffect } from 'react';

const SidebarItem = ({ to, icon: Icon, label, count, onClick }: { to?: string, icon: any, label: string, count?: number, onClick?: () => void }) => {
    if (to) {
        return (
            <NavLink
                to={to}
                className={({ isActive }) =>
                    cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1",
                        isActive
                            ? "bg-teal-50 text-teal-700"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    )
                }
            >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{label}</span>
                {count !== undefined && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full dark:bg-gray-800">{count}</span>
                )}
            </NavLink>
        );
    }

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors mb-1 text-left"
        >
            <Icon className="w-5 h-5" />
            <span className="flex-1">{label}</span>
            {count !== undefined && (
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full dark:bg-gray-800">{count}</span>
            )}
        </button>
    );
};

const UserDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center gap-2 px-2 py-3 mb-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors'
            >
                <div className='w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold'>
                    SX
                </div>
                <div className='flex-1 overflow-hidden'>
                    <p className='text-sm font-medium text-gray-800 dark:text-gray-200 truncate'>Solivan Xavier</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 overflow-hidden">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <User className="w-4 h-4" />
                        Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export const Sidebar = () => {
    const { theme, toggleTheme } = useTheme();
    const { selectedTag, setSelectedTag } = useTag();
    const [shortcuts, setShortcuts] = useState<string[]>([]);
    const [isAddingShortcut, setIsAddingShortcut] = useState(false);
    const [newShortcut, setNewShortcut] = useState('');

    // Mock tag counts - in a real app, this would come from a store or API
    const tagCounts: Record<string, number> = {
        'daily-jots': 5,
        'derneval': 1,
        'detran': 1,
        'gado': 1,
        'habilitacao': 1,
        'pagamento': 1,
    };

    const addShortcut = () => {
        if (newShortcut.trim() && !shortcuts.includes(newShortcut.trim())) {
            setShortcuts([...shortcuts, newShortcut.trim()]);
            setNewShortcut('');
            setIsAddingShortcut(false);
        }
    };

    const removeShortcut = (shortcut: string) => {
        setShortcuts(shortcuts.filter(s => s !== shortcut));
    };

    const handleTagClick = (tag: string) => {
        setSelectedTag(selectedTag === tag ? null : tag);
    };

    return (
        <div className="w-64 h-screen bg-[#fcfcfc] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4 fixed left-0 top-0 overflow-y-auto z-10 transition-colors">

            {/* MaxNote Logo */}
            <div className="mb-6 px-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    MaxNote
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Your intelligent workspace</p>
            </div>

            <UserDropdown />

            <div className="mb-6">
                <SidebarItem to="/jots" icon={PenSquare} label="Jots" />
                <SidebarItem to="/notes" icon={FileText} label="Notes" />
                <SidebarItem to="/tasks" icon={CheckCircle2} label="Tasks" />
                <SidebarItem to="/calendar" icon={CalendarDays} label="Calendar" />
            </div>

            <div className="mb-6">
                <div className='flex items-center justify-between px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
                    <span>Shortcuts</span>
                    {!isAddingShortcut ? (
                        <Plus
                            onClick={() => setIsAddingShortcut(true)}
                            className='w-4 h-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400'
                        />
                    ) : (
                        <X
                            onClick={() => {
                                setIsAddingShortcut(false);
                                setNewShortcut('');
                            }}
                            className='w-4 h-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400'
                        />
                    )}
                </div>

                {isAddingShortcut && (
                    <div className="px-3 py-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newShortcut}
                                onChange={(e) => setNewShortcut(e.target.value)}
                                placeholder="Shortcut name"
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        addShortcut();
                                    } else if (e.key === 'Escape') {
                                        setIsAddingShortcut(false);
                                        setNewShortcut('');
                                    }
                                }}
                            />
                            <button
                                onClick={addShortcut}
                                className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}

                {shortcuts.length === 0 && !isAddingShortcut && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-600 italic">No shortcuts yet</div>
                )}

                {shortcuts.map(shortcut => (
                    <div key={shortcut} className="px-3 py-1.5">
                        <div className="flex items-center justify-between group">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut}</span>
                            <button
                                onClick={() => removeShortcut(shortcut)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1">
                <div className='flex items-center justify-between px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
                    <span>Tags</span>
                    <ListFilter className='w-4 h-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400' />
                </div>
                <div className='space-y-1'>
                    {Object.entries(tagCounts).map(([tag, count]) => (
                        <div
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer group transition-colors ${selectedTag === tag
                                ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-sm ${selectedTag === tag
                                ? 'bg-teal-500'
                                : 'bg-blue-400 dark:bg-blue-500 opacity-50 group-hover:opacity-100'
                                }`}></div>
                            <span>{tag}</span>
                            <span className={`ml-auto text-xs ${selectedTag === tag
                                ? 'text-teal-600 dark:text-teal-400'
                                : 'text-gray-300 dark:text-gray-600'
                                }`}>{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                    {theme === 'light' ? (
                        <>
                            <Moon className="w-5 h-5" />
                            <span>Dark mode</span>
                        </>
                    ) : (
                        <>
                            <Sun className="w-5 h-5" />
                            <span>Light mode</span>
                        </>
                    )}
                </button>
                <SidebarItem icon={Settings} label="Settings" />
            </div>
        </div>
    );
};
