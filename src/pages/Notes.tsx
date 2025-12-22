import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Star, Tag, Clock, MoreHorizontal, Trash2, Plus, Edit, XCircle, Loader2, Filter, X, ChevronDown, CheckSquare, Calendar } from 'lucide-react';
import { useTag } from '../context/TagContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notesService, tasksService, eventsService, type Note as SupabaseNote, type Task as SupabaseTask, type CalendarEvent } from '../services/supabaseService';

interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    isPinned: boolean;
}

const mapSupabaseNote = (note: SupabaseNote): Note => ({
    id: note.id,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    createdAt: new Date(note.created_at),
    updatedAt: new Date(note.updated_at),
    isPinned: note.is_pinned,
});

export const Notes = () => {
    const { selectedTag, setSelectedTag, clearTagFilter, refreshTags, tags } = useTag();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<SupabaseTask[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showOptions, setShowOptions] = useState<string | null>(null);
    const [showTagFilter, setShowTagFilter] = useState(false);

    // Load notes from Supabase
    const loadNotes = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await notesService.getAll();
            if (error) {
                setError(error);
            } else if (data) {
                setNotes(data.map(mapSupabaseNote));
            }
        } catch (err) {
            console.error('Error loading notes:', err);
            setError('Erro ao carregar notas');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    // Fetch related tasks and events when tag changes
    useEffect(() => {
        const fetchRelatedItems = async () => {
            if (!selectedTag || !user) {
                setFilteredTasks([]);
                setFilteredEvents([]);
                return;
            }

            try {
                // Fetch tasks
                const { data: tasksData } = await tasksService.getAll();
                if (tasksData) {
                    setFilteredTasks(tasksData.filter(t => t.tags?.includes(selectedTag)));
                }

                // Fetch events
                const { data: eventsData } = await eventsService.getAll();
                if (eventsData) {
                    setFilteredEvents(eventsData.filter(e => e.tags?.includes(selectedTag)));
                }
            } catch (err) {
                console.error('Error loading related items:', err);
            }
        };

        fetchRelatedItems();
    }, [selectedTag, user]);

    const openNewNoteEditor = () => {
        navigate('/notes/new');
    };

    const openNoteEditor = (noteId: string) => {
        navigate(`/notes/${noteId}`);
    };

    const deleteNote = async (id: string) => {
        try {
            const { success, error } = await notesService.delete(id);
            if (error) {
                setError(error);
            } else if (success) {
                setNotes(notes.filter(note => note.id !== id));
                refreshTags(); // Update tags in sidebar
            }
        } catch (err) {
            console.error('Error deleting note:', err);
            setError('Erro ao excluir nota');
        }
        setShowOptions(null);
    };

    const togglePin = async (id: string) => {
        const note = notes.find(n => n.id === id);
        if (!note) return;

        try {
            const { data, error } = await notesService.update(id, {
                is_pinned: !note.isPinned,
            });
            if (error) {
                setError(error);
            } else if (data) {
                setNotes(notes.map(n =>
                    n.id === id ? mapSupabaseNote(data) : n
                ));
            }
        } catch (err) {
            console.error('Error updating note:', err);
            setError('Erro ao atualizar nota');
        }
        setShowOptions(null);
    };

    // Filter notes based on selected tag
    const filteredNotes = selectedTag
        ? notes.filter(note => note.tags.includes(selectedTag))
        : notes;

    const pinnedNotes = filteredNotes.filter(note => note.isPinned);
    const regularNotes = filteredNotes.filter(note => !note.isPinned);

    const NoteCard = ({ note }: { note: Note }) => {
        return (
            <div
                className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-pointer"
                onClick={() => openNoteEditor(note.id)}
            >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePin(note.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        title="Fixar nota"
                    >
                        <Star className={`w-4 h-4 ${note.isPinned ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowOptions(showOptions === note.id ? null : note.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        title="Mais opções"
                    >
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>

                    {showOptions === note.id && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openNoteEditor(note.id);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.id);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                            </button>
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 pr-16 line-clamp-1">{note.title || 'Sem título'}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{note.content}</p>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                    {note.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                            <Tag className="w-3 h-3" />
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Atualizado em {note.updatedAt.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
        );
    };

    const NoteListItem = ({ note }: { note: Note }) => {
        return (
            <div
                className="group relative flex items-start gap-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => openNoteEditor(note.id)}
            >
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1">{note.title || 'Sem título'}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{note.content}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                        {note.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                <Tag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {note.updatedAt.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePin(note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Star className={`w-4 h-4 ${note.isPinned ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowOptions(showOptions === note.id ? null : note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreHorizontal className="w-4 h-4 text-gray-300" />
                    </button>

                    {showOptions === note.id && (
                        <div className="absolute right-4 top-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openNoteEditor(note.id);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.id);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                            </button>
                        </div>
                    )}
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
        <div className="max-w-7xl mx-auto py-8 px-6">
            {/* Header Section */}
            <header className="mb-8">
                {/* Top Row - Title and Actions */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Notas</h1>
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium rounded-full">
                            {notes.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'grid'
                                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Grade
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Lista
                            </button>
                        </div>

                        <button
                            onClick={openNewNoteEditor}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Nova nota
                        </button>
                    </div>
                </div>

                {/* Bottom Row - Filter and Status */}
                <div className="flex items-center gap-4">
                    {/* Tag Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTagFilter(!showTagFilter)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedTag
                                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {selectedTag ? (
                                <>
                                    <span>{selectedTag}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearTagFilter();
                                            setShowTagFilter(false);
                                        }}
                                        className="ml-1 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span>Filtrar por tag</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showTagFilter ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </button>

                        {/* Tag Dropdown */}
                        {showTagFilter && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Tags disponíveis
                                    </p>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-2">
                                    {tags.length === 0 ? (
                                        <div className="text-center py-6">
                                            <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Nenhuma tag encontrada
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                Adicione tags às suas notas
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {tags.map(({ name, count }) => (
                                                <button
                                                    key={name}
                                                    onClick={() => {
                                                        setSelectedTag(name);
                                                        setShowTagFilter(false);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${selectedTag === name
                                                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-2.5">
                                                        <Tag className="w-4 h-4" />
                                                        {name}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedTag === name
                                                        ? 'bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-300'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                                        }`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedTag && (
                                    <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                        <button
                                            onClick={() => {
                                                clearTagFilter();
                                                setShowTagFilter(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Limpar filtro
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

                    {/* Status Text */}
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {selectedTag
                            ? `${filteredNotes.length} notas com a tag "${selectedTag}"`
                            : `${notes.length} notas no total`
                        }
                    </p>
                </div>
            </header>

            {/* Click outside to close dropdown */}
            {showTagFilter && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowTagFilter(false)}
                />
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">Fechar</button>
                </div>
            )}

            {/* Related Tasks and Events */}
            {(filteredTasks.length > 0 || filteredEvents.length > 0) && selectedTag && (
                <section className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-teal-600" />
                        Itens Relacionados
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map(task => (
                            <div key={task.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start gap-3 hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
                                <CheckSquare className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">{task.title}</h3>
                                    {task.description && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{task.description}</p>}
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full font-medium">Tarefa</span>
                                        {task.status === 'completed' && (
                                            <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full font-medium">Concluída</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredEvents.map(event => (
                            <div key={event.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start gap-3 hover:border-red-300 dark:hover:border-red-700 transition-colors">
                                <Calendar className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">{event.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(event.start_date).toLocaleDateString()}
                                        {' '}
                                        {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <span className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full mt-2 inline-block font-medium">Evento</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {pinnedNotes.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        Notas Fixadas
                    </h2>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pinnedNotes.map(note => <NoteCard key={note.id} note={note} />)}
                        </div>
                    ) : (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            {pinnedNotes.map(note => <NoteListItem key={note.id} note={note} />)}
                        </div>
                    )}
                </section>
            )}

            <section>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    {selectedTag ? `Notas com "${selectedTag}"` : 'Todas as Notas'}
                </h2>
                {regularNotes.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {regularNotes.map(note => <NoteCard key={note.id} note={note} />)}
                        </div>
                    ) : (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            {regularNotes.map(note => <NoteListItem key={note.id} note={note} />)}
                        </div>
                    )
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-500">
                            <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">
                                {selectedTag ? `Nenhuma nota encontrada com a tag "${selectedTag}"` : 'Nenhuma nota ainda'}
                            </p>
                            <p className="text-sm mt-2">
                                {selectedTag ? 'Tente selecionar uma tag diferente ou limpar o filtro.' : 'Crie sua primeira nota para começar.'}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};
