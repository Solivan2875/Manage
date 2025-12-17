import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Plus, MoreHorizontal, Trash2, Edit, Check, X, XCircle } from 'lucide-react';
import { useTag } from '../context/TagContext';

interface Jot {
    id: string;
    content: string;
    title?: string;
    date: Date;
    tags: string[];
    tasks?: { id: string; text: string; completed: boolean }[];
}

const initialJots: Jot[] = [
    {
        id: '1',
        content: 'Your mistake was a hidden intention',
        date: new Date('2025-12-16'),
        tags: ['philosophy'],
    },
    {
        id: '2',
        title: 'untitled note',
        content: '',
        date: new Date('2025-12-16'),
        tags: [],
    },
    {
        id: '3',
        title: 'Renovação de Habilitação',
        content: 'Hoje dei entrada no detran para a renovação da habilitação, tinha realizado o exame toxicológico em 14/11/2025 e fico liberado para que eu possa dar continuidade no processo hoje, porem o doutor vicente esta de atestado e provavelmente so retorna quinta feira dia 18/12/2025.',
        date: new Date('2025-12-16'),
        tags: ['detran', 'habilitacao'],
        tasks: [
            { id: '3-1', text: 'Fazer exames para renovar a habilitação', completed: false }
        ]
    },
    {
        id: '4',
        title: 'Calendario',
        content: '',
        date: new Date('2025-12-16'),
        tags: [],
    },
    {
        id: '5',
        title: 'Pagamento do Sr. Derneval',
        content: 'No dia 14/11/2025 efetuei o pagamento ao senhor Derneval no valor total de R$ 249.900,00, conforme comprovantes anexados.\n\nDetalhamento dos componentes:\n• Renda anual de bezerros\n  ◦ Quantidade: 30 bezerros\n  ◦ Valor unitário: R$ 2.480,00\n  ◦ Subtotal: R$ 74.400,00\n\n• Parceria de gado\n  ◦ Base: 650 arrobas\n\nTotal pago:\nA soma dos dois componentes (R$ 175.500,00) resulta no montante total de R$ 249.900,00, que já foi integralmente quitado.\n\nObs.: Anexar os comprovantes correspondentes a cada linha de pagamento para referência futura.',
        date: new Date('2025-12-16'),
        tags: ['derneval', 'pagamento', 'gado'],
    },
];

export const Jots = () => {
    const { selectedTag, clearTagFilter } = useTag();
    const [jots, setJots] = useState<Jot[]>(initialJots);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newJotContent, setNewJotContent] = useState('');
    const [editingJotId, setEditingJotId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [showOptions, setShowOptions] = useState<string | null>(null);
    const newJotRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isCreatingNew && newJotRef.current) {
            newJotRef.current.focus();
        }
    }, [isCreatingNew]);

    const createNewJot = () => {
        if (newJotContent.trim()) {
            const newJot: Jot = {
                id: Date.now().toString(),
                content: newJotContent,
                date: new Date(),
                tags: [],
            };
            setJots([newJot, ...jots]);
            setNewJotContent('');
            setIsCreatingNew(false);
        }
    };

    const deleteJot = (id: string) => {
        setJots(jots.filter(jot => jot.id !== id));
        setShowOptions(null);
    };

    const startEditing = (jot: Jot) => {
        setEditingJotId(jot.id);
        setEditingContent(jot.content);
        setShowOptions(null);
    };

    const saveEdit = () => {
        if (editingJotId && editingContent.trim()) {
            setJots(jots.map(jot =>
                jot.id === editingJotId
                    ? { ...jot, content: editingContent }
                    : jot
            ));
            setEditingJotId(null);
            setEditingContent('');
        }
    };

    const cancelEdit = () => {
        setEditingJotId(null);
        setEditingContent('');
    };

    const toggleTask = (jotId: string, taskId: string) => {
        setJots(jots.map(jot => {
            if (jot.id === jotId && jot.tasks) {
                return {
                    ...jot,
                    tasks: jot.tasks.map(task =>
                        task.id === taskId
                            ? { ...task, completed: !task.completed }
                            : task
                    )
                };
            }
            return jot;
        }));
    };

    const groupJotsByDate = (jotsToGroup: Jot[]) => {
        const grouped: Record<string, Jot[]> = {};

        jotsToGroup.forEach(jot => {
            const dateKey = jot.date.toLocaleDateString('en-US', {
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
                        {jot.title && (
                            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">{jot.title}</h3>
                        )}

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
                                        className="p-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                                        title="Save"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="p-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                        title="Cancel"
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
                                        title="More options"
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
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteJot(jot.id)}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {jot.tasks && jot.tasks.length > 0 && (
                            <div className="space-y-2 mt-4">
                                {jot.tasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 p-3 flex items-center justify-between group/task cursor-pointer hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-600 transition-all"
                                        onClick={() => toggleTask(jot.id, task.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${task.completed
                                                ? 'bg-teal-600 border-teal-600'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-teal-500 dark:hover:border-teal-400'
                                                }`}>
                                                {task.completed && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-gray-700 dark:text-gray-300 font-medium text-sm ${task.completed ? 'line-through opacity-60' : ''
                                                }`}>
                                                {task.text}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-6 dark:bg-gray-900">
            <header className="flex items-center justify-between mb-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        {selectedTag ? `Filtered by: ${selectedTag}` : 'All notes'}
                    </h1>
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
                <button
                    onClick={() => setIsCreatingNew(true)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New jot
                </button>
            </header>

            <div className="space-y-16 animate-slide-up">
                {isCreatingNew && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
                        <textarea
                            ref={newJotRef}
                            value={newJotContent}
                            onChange={(e) => setNewJotContent(e.target.value)}
                            placeholder="What's on your mind?"
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
                                Cancel
                            </button>
                            <button
                                onClick={createNewJot}
                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                            >
                                Save
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
                                {selectedTag ? `No jots found with tag "${selectedTag}"` : 'No jots yet'}
                            </p>
                            <p className="text-sm mt-2">
                                {selectedTag ? 'Try selecting a different tag or clear the filter.' : 'Create your first jot to get started.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
