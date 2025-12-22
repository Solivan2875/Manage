import { useState, useEffect } from 'react';
import { Search, Filter, X, Tag, Calendar, User, MapPin, Flag } from 'lucide-react';
import type { Event, EventFilter, EventCategory, Priority } from '../../../types/calendar';

interface SearchFilterProps {
    events: Event[];
    onSearch: (query: string) => void;
    onFilterChange: (filters: EventFilter[]) => void;
    searchQuery: string;
    activeFilters: EventFilter[];
}

export const SearchFilter = ({
    events,
    onSearch,
    onFilterChange,
    searchQuery,
    activeFilters
}: SearchFilterProps) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [tempQuery, setTempQuery] = useState(searchQuery);
    const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
    const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Get all unique tags from events
    const allTags = Array.from(new Set(events.flatMap(event => event.tags))).sort();

    // Get all unique categories from events
    const allCategories = Array.from(new Set(events.map(event => event.category))) as EventCategory[];

    // Get all unique priorities from events
    const allPriorities = Array.from(new Set(events.map(event => event.priority))) as Priority[];

    // Update temp query when searchQuery changes
    useEffect(() => {
        setTempQuery(searchQuery);
    }, [searchQuery]);

    // Update selected filters when activeFilters change
    useEffect(() => {
        const categories = activeFilters
            .filter(f => f.type === 'category')
            .map(f => f.value as EventCategory);

        const priorities = activeFilters
            .filter(f => f.type === 'priority')
            .map(f => f.value as Priority);

        const tags = activeFilters
            .filter(f => f.type === 'tag')
            .map(f => f.value);

        setSelectedCategories(categories);
        setSelectedPriorities(priorities);
        setSelectedTags(tags);
    }, [activeFilters]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(tempQuery);
    };

    const handleCategoryToggle = (category: EventCategory) => {
        const newCategories = selectedCategories.includes(category)
            ? selectedCategories.filter(c => c !== category)
            : [...selectedCategories, category];

        setSelectedCategories(newCategories);
        updateFilters(newCategories, selectedPriorities, selectedTags);
    };

    const handlePriorityToggle = (priority: Priority) => {
        const newPriorities = selectedPriorities.includes(priority)
            ? selectedPriorities.filter(p => p !== priority)
            : [...selectedPriorities, priority];

        setSelectedPriorities(newPriorities);
        updateFilters(selectedCategories, newPriorities, selectedTags);
    };

    const handleTagToggle = (tag: string) => {
        const newTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];

        setSelectedTags(newTags);
        updateFilters(selectedCategories, selectedPriorities, newTags);
    };

    const updateFilters = (
        categories: EventCategory[],
        priorities: Priority[],
        tags: string[]
    ) => {
        const newFilters: EventFilter[] = [
            ...categories.map(cat => ({
                id: `category-${cat}`,
                type: 'category' as const,
                value: cat,
                label: getCategoryLabel(cat)
            })),
            ...priorities.map(pri => ({
                id: `priority-${pri}`,
                type: 'priority' as const,
                value: pri,
                label: getPriorityLabel(pri)
            })),
            ...tags.map(tag => ({
                id: `tag-${tag}`,
                type: 'tag' as const,
                value: tag,
                label: tag
            }))
        ];

        onFilterChange(newFilters);
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedPriorities([]);
        setSelectedTags([]);
        onFilterChange([]);
    };

    const removeFilter = (filterId: string) => {
        const filter = activeFilters.find(f => f.id === filterId);
        if (!filter) return;

        switch (filter.type) {
            case 'category':
                handleCategoryToggle(filter.value as EventCategory);
                break;
            case 'priority':
                handlePriorityToggle(filter.value as Priority);
                break;
            case 'tag':
                handleTagToggle(filter.value);
                break;
        }
    };

    const getCategoryLabel = (category: EventCategory): string => {
        const labels = {
            meeting: 'Reunião',
            task: 'Tarefa',
            reminder: 'Lembrete',
            event: 'Evento',
            personal: 'Pessoal',
            work: 'Trabalho'
        };
        return labels[category] || category;
    };

    const getPriorityLabel = (priority: Priority): string => {
        const labels = {
            low: 'Baixa',
            medium: 'Média',
            high: 'Alta',
            urgent: 'Urgente'
        };
        return labels[priority] || priority;
    };

    const getCategoryColor = (category: EventCategory): string => {
        const colors = {
            meeting: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            task: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            reminder: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            event: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            personal: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
            work: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
        };
        return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    };

    const getPriorityColor = (priority: Priority): string => {
        const colors = {
            low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    };

    return (
        <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={tempQuery}
                        onChange={(e) => setTempQuery(e.target.value)}
                        placeholder="Pesquisar eventos..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                </div>
            </form>

            {/* Filter Controls */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${activeFilters.length > 0
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                    {activeFilters.length > 0 && (
                        <span className="bg-teal-600 text-white text-xs rounded-full px-2 py-0.5">
                            {activeFilters.length}
                        </span>
                    )}
                </button>

                {activeFilters.length > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                        <div
                            key={filter.id}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                        >
                            <span>{filter.label}</span>
                            <button
                                onClick={() => removeFilter(filter.id)}
                                className="hover:text-gray-900 dark:hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter Panel */}
            {isFilterOpen && (
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="space-y-4">
                        {/* Categories */}
                        <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Categorias
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {allCategories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryToggle(category)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedCategories.includes(category)
                                                ? getCategoryColor(category)
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {getCategoryLabel(category)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Priorities */}
                        <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Flag className="w-4 h-4" />
                                Prioridades
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {allPriorities.map((priority) => (
                                    <button
                                        key={priority}
                                        onClick={() => handlePriorityToggle(priority)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedPriorities.includes(priority)
                                                ? getPriorityColor(priority)
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {getPriorityLabel(priority)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        {allTags.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => handleTagToggle(tag)}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag)
                                                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};