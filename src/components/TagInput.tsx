import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { X, Tag, Plus } from 'lucide-react';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    suggestions?: string[];
    placeholder?: string;
    className?: string;
}

// Algumas cores predefinidas para as tags
const tagColors = [
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800',
    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
];

// Função para obter uma cor consistente para uma tag
const getTagColor = (tag: string): string => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return tagColors[Math.abs(hash) % tagColors.length];
};

export const TagInput = ({
    tags,
    onChange,
    suggestions = [],
    placeholder = 'Adicionar tag...',
    className = '',
}: TagInputProps) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filtrar sugestões baseado no input
    const filteredSuggestions = suggestions.filter(
        (suggestion) =>
            suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
            !tags.includes(suggestion)
    );

    // Fechar sugestões ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            onChange([...tags, trimmedTag]);
        }
        setInputValue('');
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.focus();
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
                addTag(filteredSuggestions[selectedSuggestionIndex]);
            } else if (inputValue.trim()) {
                addTag(inputValue);
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            // Remover última tag quando backspace é pressionado e input está vazio
            removeTag(tags[tags.length - 1]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex((prev) =>
                prev < filteredSuggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
        } else if (e.key === 'Tab' && showSuggestions && filteredSuggestions.length > 0) {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0) {
                addTag(filteredSuggestions[selectedSuggestionIndex]);
            } else if (filteredSuggestions.length > 0) {
                addTag(filteredSuggestions[0]);
            }
        }
    };

    const handleInputChange = (value: string) => {
        // Se o usuário digitar vírgula, adicionar a tag
        if (value.includes(',')) {
            const parts = value.split(',');
            parts.forEach((part, index) => {
                if (index < parts.length - 1 && part.trim()) {
                    addTag(part);
                }
            });
            setInputValue(parts[parts.length - 1]);
        } else {
            setInputValue(value);
        }
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="flex items-center gap-2 flex-wrap p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition-all min-h-[42px]">
                <Tag className="w-4 h-4 text-gray-400 shrink-0" />

                {/* Tags existentes */}
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border transition-all hover:shadow-sm ${getTagColor(tag)}`}
                    >
                        <span className="max-w-[120px] truncate">{tag}</span>
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            aria-label={`Remover tag ${tag}`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}

                {/* Campo de input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400"
                />

                {/* Botão de adicionar (visível quando há texto) */}
                {inputValue.trim() && (
                    <button
                        type="button"
                        onClick={() => addTag(inputValue)}
                        className="p-1 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors"
                        title="Adicionar tag"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown de sugestões */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-auto">
                    <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        Sugestões
                    </div>
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => addTag(suggestion)}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${index === selectedSuggestionIndex
                                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <span
                                className={`inline-block w-2 h-2 rounded-full ${getTagColor(suggestion).split(' ')[0]}`}
                            />
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Dica de uso */}
            {tags.length === 0 && !inputValue && (
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    Pressione <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> ou <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">,</kbd> para adicionar
                </p>
            )}
        </div>
    );
};
