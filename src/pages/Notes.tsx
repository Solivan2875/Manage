import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Star, Tag, Clock, MoreHorizontal, Trash2, Archive, Share2, Plus, Edit, Check, X, XCircle } from 'lucide-react';
import { useTag } from '../context/TagContext';
import { useNavigate } from 'react-router-dom';

interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    isPinned: boolean;
}

const mockNotes: Note[] = [
    {
        id: '1',
        title: 'MaxNote Features Roadmap',
        content: 'Planning the future of MaxNote with advanced AI integration, collaborative features, and cross-platform sync...',
        tags: ['planning', 'roadmap', 'development'],
        createdAt: new Date('2025-12-15'),
        updatedAt: new Date('2025-12-16'),
        isPinned: true,
    },
    {
        id: '2',
        title: 'Meeting Notes - Q1 Planning',
        content: 'Discussed quarterly goals, team expansion, and new product initiatives. Key decisions made on budget allocation...',
        tags: ['meetings', 'planning', 'business'],
        createdAt: new Date('2025-12-14'),
        updatedAt: new Date('2025-12-15'),
        isPinned: false,
    },
    {
        id: '3',
        title: 'Book Summary: Deep Work',
        content: 'Key insights from Cal Newport\'s Deep Work. The ability to focus without distraction is becoming increasingly valuable...',
        tags: ['books', 'productivity', 'learning'],
        createdAt: new Date('2025-12-10'),
        updatedAt: new Date('2025-12-12'),
        isPinned: false,
    },
    {
        id: '4',
        title: 'Recipe: Pasta Carbonara',
        content: 'Ingredients: spaghetti, eggs, pecorino romano, guanciale, black pepper. The secret is in the technique...',
        tags: ['recipes', 'cooking', 'italian'],
        createdAt: new Date('2025-12-08'),
        updatedAt: new Date('2025-12-08'),
        isPinned: false,
    },
];

export const Notes = () => {
    const { selectedTag, clearTagFilter } = useTag();
    const navigate = useNavigate();
    const [notes, setNotes] = useState<Note[]>(mockNotes);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showOptions, setShowOptions] = useState<string | null>(null);

    const openNewNoteEditor = () => {
        navigate('/notes/new');
    };

    const openNoteEditor = (noteId: string) => {
        navigate(`/notes/${noteId}`);
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(note => note.id !== id));
        setShowOptions(null);
    };

    const togglePin = (id: string) => {
        setNotes(notes.map(note =>
            note.id === id ? { ...note, isPinned: !note.isPinned } : note
        ));
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
                className="group relative bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer"
                onClick={() => openNoteEditor(note.id)}
            >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePin(note.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-md"
                        title="Pin note"
                    >
                        <Star className={`w-4 h-4 ${note.isPinned ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowOptions(showOptions === note.id ? null : note.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-md"
                        title="More options"
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
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.id);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2 pr-16 line-clamp-1">{note.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.content}</p>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                    {note.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                            <Tag className="w-3 h-3" />
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Updated {note.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
        );
    };

    const NoteListItem = ({ note }: { note: Note }) => {
        return (
            <div
                className="group flex items-start gap-4 bg-white border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openNoteEditor(note.id)}
            >
                <ChevronRight className="w-4 h-4 text-gray-300 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">{note.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{note.content}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                        {note.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                <Tag className="w-3 h-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {note.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                                Edit
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.id);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-6">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-4 mb-1">
                        <h1 className="text-3xl font-bold text-gray-800">Notes</h1>
                        {selectedTag && (
                            <button
                                onClick={clearTagFilter}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                                Clear filter
                            </button>
                        )}
                    </div>
                    <p className="text-gray-500 text-sm">
                        {selectedTag
                            ? `${filteredNotes.length} notes with tag "${selectedTag}"`
                            : `${notes.length} notes in total`
                        }
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openNewNoteEditor}
                        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New note
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Grid
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        List
                    </button>
                </div>
            </header>


            {pinnedNotes.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        Pinned Notes
                    </h2>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pinnedNotes.map(note => <NoteCard key={note.id} note={note} />)}
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {pinnedNotes.map(note => <NoteListItem key={note.id} note={note} />)}
                        </div>
                    )}
                </section>
            )}

            <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    {selectedTag ? `Notes with "${selectedTag}"` : 'All Notes'}
                </h2>
                {regularNotes.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {regularNotes.map(note => <NoteCard key={note.id} note={note} />)}
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {regularNotes.map(note => <NoteListItem key={note.id} note={note} />)}
                        </div>
                    )
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-500">
                            <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">
                                {selectedTag ? `No notes found with tag "${selectedTag}"` : 'No notes yet'}
                            </p>
                            <p className="text-sm mt-2">
                                {selectedTag ? 'Try selecting a different tag or clear the filter.' : 'Create your first note to get started.'}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};
