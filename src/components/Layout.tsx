import { Sidebar } from './Sidebar';
import { Search, PenLine, ArrowLeftRight, LayoutTemplate, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Mock data for search - in a real app, this would come from a store or API
    const mockData = {
        jots: [
            { id: '1', title: 'Your mistake was a hidden intention', content: 'Philosophical thought about intentions', type: 'jot' },
            { id: '2', title: 'Renovação de Habilitação', content: 'Document renewal process at detran', type: 'jot' },
        ],
        notes: [
            { id: '1', title: 'MaxNote Features Roadmap', content: 'Planning the future of MaxNote with advanced AI integration', type: 'note' },
            { id: '2', title: 'Meeting Notes - Q1 Planning', content: 'Discussed quarterly goals, team expansion', type: 'note' },
        ],
        tasks: [
            { id: '1', title: 'Complete MaxNote dashboard design', content: 'Finalize the dashboard layout with all components', type: 'task' },
            { id: '2', title: 'Review pull requests', content: 'Code review for pending PRs', type: 'task' },
        ],
        events: [
            { id: '1', title: 'Team standup', content: 'Daily team meeting', type: 'event' },
            { id: '2', title: 'Product demo', content: 'Demo for potential clients', type: 'event' },
        ],
    };

    const searchItems = () => {
        if (!searchQuery.trim()) return [];

        const allItems = [
            ...mockData.jots,
            ...mockData.notes,
            ...mockData.tasks,
            ...mockData.events,
        ];

        return allItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5);
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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                                placeholder="Search notes"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => {
                                    setIsSearchFocused(true);
                                    if (searchQuery.trim()) setShowSearchResults(true);
                                }}
                                onBlur={() => {
                                    setIsSearchFocused(false);
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
                        {showSearchResults && searchItems().length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                                {searchItems().map((item) => (
                                    <div
                                        key={`${item.type}-${item.id}`}
                                        onClick={() => handleItemClick(item)}
                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-800 dark:text-gray-200">{item.title}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.content}</p>
                                            </div>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                        <button className="p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" title="Change View">
                            <LayoutTemplate className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNewNote}
                            className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                        >
                            <PenLine className="w-4 h-4" />
                            New note
                        </button>
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
