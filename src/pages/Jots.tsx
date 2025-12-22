import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, Plus, MoreHorizontal, Trash2, Edit, Check, X, XCircle, Loader2 } from 'lucide-react';
import { useTag } from '../context/TagContext';
import { useAuth } from '../context/AuthContext';
import { jotsService, type Jot as SupabaseJot } from '../services/supabaseService';

interface Jot {
    id: string;
    content: string;
    date: Date;
    tags: string[];
}

const mapSupabaseJot = (jot: SupabaseJot): Jot => ({
    id: jot.id,
    content: jot.content,
    date: new Date(jot.created_at),
    tags: jot.tags || [],
});

export const Jots = () => {
    const { selectedTag, clearTagFilter, refreshTags } = useTag();
    const { user } = useAuth();
    const [jots, setJots] = useState<Jot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newJotContent, setNewJotContent] = useState('');
    const [editingJotId, setEditingJotId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [showOptions, setShowOptions] = useState<string | null>(null);
    const newJotRef = useRef<HTMLTextAreaElement>(null);

    // Load jots from Supabase
    const loadJots = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await jotsService.getAll();
            if (error) {
                setError(error);
            } else if (data) {
                setJots(data.map(mapSupabaseJot));
            }
        } catch (err) {
            console.error('Error loading jots:', err);
            setError('Erro ao carregar anotações');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadJots();
    }, [loadJots]);

    useEffect(() => {
        if (isCreatingNew && newJotRef.current) {
            newJotRef.current.focus();
        }
    }, [isCreatingNew]);

    const createNewJot = async () => {
        if (!newJotContent.trim()) return;

        setIsSaving(true);
        try {
            const { data, error } = await jotsService.create({
                content: newJotContent.trim(),
                tags: [],
            });

            if (error) {
                setError(error);
            } else if (data) {
                setJots([mapSupabaseJot(data), ...jots]);
                setNewJotContent('');
                setIsCreatingNew(false);
                refreshTags(); // Update tags in sidebar
            }
        } catch (err) {
            console.error('Error creating jot:', err);
            setError('Erro ao criar anotação');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteJot = async (id: string) => {
        setShowOptions(null);

        try {
            const { success, error } = await jotsService.delete(id);
            if (error) {
                setError(error);
            } else if (success) {
                setJots(jots.filter(jot => jot.id !== id));
                refreshTags(); // Update tags in sidebar
            }
        } catch (err) {
            console.error('Error deleting jot:', err);
            setError('Erro ao excluir anotação');
        }
    };

    const startEditing = (jot: Jot) => {
        setEditingJotId(jot.id);
        setEditingContent(jot.content);
        setShowOptions(null);
    };

    const saveEdit = async () => {
        if (!editingJotId || !editingContent.trim()) return;

        setIsSaving(true);
        try {
            const { data, error } = await jotsService.update(editingJotId, {
                content: editingContent.trim(),
            });

            if (error) {
                setError(error);
            } else if (data) {
                setJots(jots.map(jot =>
                    jot.id === editingJotId
                        ? mapSupabaseJot(data)
                        : jot
                ));
                setEditingJotId(null);
                setEditingContent('');
            }
        } catch (err) {
            console.error('Error updating jot:', err);
            setError('Erro ao atualizar anotação');
        } finally {
            setIsSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditingJotId(null);
        setEditingContent('');
    };

    const groupJotsByDate = (jotsToGroup: Jot[]) => {
        const grouped: Record<string, Jot[]> = {};

        jotsToGroup.forEach(jot => {
            const dateKey = jot.date.toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(jot);
        });

        return grouped;
    };

    // Filter jots based on selected tag
    const filteredJots = selectedTag
        ? jots.filter(jot => jot.tags.includes(selectedTag))
        : jots;

    const groupedJots = groupJotsByDate(filteredJots);

    const JotItem = ({ jot }: { jot: Jot }) => {
        const isEditing = editingJotId === jot.id;

        return (
            <div className="group hover:pl-2 transition-all">
                <div className="flex items-start gap-1">
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-full">
                        {isEditing ? (
                            <div className="mb-3">
                                <textarea
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    rows={4}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={saveEdit}
                                        disabled={isSaving}
                                        className="p-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50"
                                        title="Salvar"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="p-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                        title="Cancelar"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                {jot.content && (
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 text-[15px] whitespace-pre-line">
                                        {jot.content}
                                    </p>
                                )}

                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setShowOptions(showOptions === jot.id ? null : jot.id)}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                        title="Mais opções"
                                    >
                                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                    </button>

                                    {showOptions === jot.id && (
                                        <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                                            <button
                                                onClick={() => startEditing(jot)}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => deleteJot(jot.id)}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {jot.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {jot.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-6 dark:bg-gray-900">
            <header className="flex items-center justify-between mb-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        {selectedTag ? `Filtrado por: ${selectedTag}` : 'Todas as notas'}
                    </h1>
                    {selectedTag && (
                        <button
                            onClick={clearTagFilter}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                            Limpar filtro
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setIsCreatingNew(true)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nova anotação
                </button>
            </header>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">Fechar</button>
                </div>
            )}

            <div className="space-y-16 animate-slide-up">
                {isCreatingNew && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
                        <textarea
                            ref={newJotRef}
                            value={newJotContent}
                            onChange={(e) => setNewJotContent(e.target.value)}
                            placeholder="O que está pensando?"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                            rows={4}
                        />
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                onClick={() => {
                                    setIsCreatingNew(false);
                                    setNewJotContent('');
                                }}
                                className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={createNewJot}
                                disabled={isSaving || !newJotContent.trim()}
                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Salvar
                            </button>
                        </div>
                    </div>
                )}

                {Object.entries(groupedJots).length > 0 ? (
                    Object.entries(groupedJots).map(([date, dateJots]) => (
                        <div key={date}>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm py-2">{date}</h2>
                            <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-700 transition-colors space-y-8">
                                {dateJots.map(jot => (
                                    <JotItem key={jot.id} jot={jot} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-500">
                            <ChevronRight className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">
                                {selectedTag ? `Nenhuma anotação encontrada com a tag "${selectedTag}"` : 'Nenhuma anotação ainda'}
                            </p>
                            <p className="text-sm mt-2">
                                {selectedTag ? 'Tente selecionar uma tag diferente ou limpar o filtro.' : 'Crie sua primeira anotação para começar.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
