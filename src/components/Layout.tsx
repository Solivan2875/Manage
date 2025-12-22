import { Sidebar } from './Sidebar';
import { Search, PenLine, ArrowLeftRight, X, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggleAnimated } from './ThemeToggle';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [searchResults, setSearchResults] = useState<{ id: string; title: string; content: string; type: 'jot' | 'note' | 'task' | 'event' }[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Search across all data sources
    useEffect(() => {
        const searchData = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const query = searchQuery.toLowerCase();
                const results: { id: string; title: string; content: string; type: 'jot' | 'note' | 'task' | 'event' }[] = [];

                // Import services dynamically to avoid circular dependencies
                const { notesService, jotsService, tasksService, eventsService } = await import('../services/supabaseService');

                // Fetch all data in parallel
                const [notesResult, jotsResult, tasksResult, eventsResult] = await Promise.all([
                    notesService.getAll(),
                    jotsService.getAll(),
                    tasksService.getAll(),
                    eventsService.getAll(),
                ]);

                // Filter notes
                if (notesResult.data) {
                    notesResult.data.forEach(note => {
                        if (note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)) {
                            results.push({ id: note.id, title: note.title || 'Sem título', content: note.content.slice(0, 100), type: 'note' });
                        }
                    });
                }

                // Filter jots
                if (jotsResult.data) {
                    jotsResult.data.forEach(jot => {
                        if (jot.content.toLowerCase().includes(query)) {
                            results.push({ id: jot.id, title: jot.content.slice(0, 50), content: jot.content.slice(0, 100), type: 'jot' });
                        }
                    });
                }

                // Filter tasks
                if (tasksResult.data) {
                    tasksResult.data.forEach(task => {
                        if (task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)) {
                            results.push({ id: task.id, title: task.title, content: task.description.slice(0, 100), type: 'task' });
                        }
                    });
                }

                // Filter events
                if (eventsResult.data) {
                    eventsResult.data.forEach(event => {
                        if (event.title.toLowerCase().includes(query) || event.description.toLowerCase().includes(query)) {
                            results.push({ id: event.id, title: event.title, content: event.description.slice(0, 100), type: 'event' });
                        }
                    });
                }

                setSearchResults(results.slice(0, 10)); // Limit to 10 results
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce search
        const timer = setTimeout(searchData, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const searchItems = () => {
        return searchResults;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // In a real app, this would navigate to a search results page
            console.log('Searching for:', searchQuery);
            setShowSearchResults(false);
            searchInputRef.current?.blur();
        }
    };

    const handleItemClick = (item: any) => {
        // Navigate to the appropriate page based on item type
        switch (item.type) {
            case 'jot':
                navigate('/jots');
                break;
            case 'note':
                navigate('/notes');
                break;
            case 'task':
                navigate('/tasks');
                break;
            case 'event':
                navigate('/calendar');
                break;
        }
        setShowSearchResults(false);
        setSearchQuery('');
    };

    const handleNewNote = () => {
        navigate('/notes');
        // In a real app, this might open a modal or set a state to show the new note form
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64 transition-all duration-300 ease-in-out">
                {/* Header */}
                <header className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center px-6 justify-between bg-white dark:bg-gray-900 shrink-0 z-20">
                    <div className="flex items-center gap-4 flex-1 max-w-2xl relative">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-4 py-2 w-full transition-all focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:bg-white dark:focus-within:bg-gray-800 border border-transparent focus-within:border-teal-100 dark:focus-within:border-teal-900">
                            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Pesquisar notas"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => {
                                    if (searchQuery.trim()) setShowSearchResults(true);
                                }}
                                onBlur={() => {
                                    // Delay hiding results to allow click on result
                                    setTimeout(() => setShowSearchResults(false), 200);
                                }}
                                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-700 dark:text-gray-200"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setShowSearchResults(false);
                                    }}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <ArrowLeftRight className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
                        </form>

                        {/* Search Results Dropdown */}
                        {showSearchResults && (searchItems().length > 0 || isSearching) && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                                {isSearching ? (
                                    <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                                        <span className="animate-pulse">Pesquisando...</span>
                                    </div>
                                ) : searchItems().length === 0 ? (
                                    <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                                        Nenhum resultado encontrado
                                    </div>
                                ) : (
                                    searchItems().map((item) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            onClick={() => handleItemClick(item)}
                                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.title}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.content}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded ml-2 ${item.type === 'note' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' :
                                                    item.type === 'jot' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' :
                                                        item.type === 'task' ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300' :
                                                            'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
                                                    }`}>
                                                    {item.type === 'note' ? 'Nota' :
                                                        item.type === 'jot' ? 'Rascunho' :
                                                            item.type === 'task' ? 'Tarefa' : 'Evento'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        <ThemeToggleAnimated />
                        <button
                            onClick={handleNewNote}
                            className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                        >
                            <PenLine className="w-4 h-4" />
                            Nova nota
                        </button>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                                    {user?.name ? getInitials(user.name) : <User className="w-4 h-4" />}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                    {/* User Info */}
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                                                {user?.name ? getInitials(user.name) : <User className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                                    {user?.name || 'Usuário'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {user?.email || ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate('/settings/profile');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Configurações</span>
                                        </button>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sair</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-white dark:bg-gray-900 relative">
                    {children}
                </main>
            </div>
        </div>
    );
};
