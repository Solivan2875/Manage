import { useState, useRef, useEffect } from 'react';
import { Circle, CheckCircle2, Calendar as CalendarIcon, Tag, Plus, MoreHorizontal, Edit, Trash2, X, Check, XCircle } from 'lucide-react';
import { useTag } from '../context/TagContext';

interface Task {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    tags: string[];
    subtasks?: Task[];
}

const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Concluir o design do painel MaxNote',
        description: 'Finalizar o layout do dashboard com todos os componentes e interações',
        completed: false,
        priority: 'high',
        dueDate: new Date('2025-12-18'),
        tags: ['design', 'urgent'],
        subtasks: [
            { id: '1-1', title: 'Criar wireframes', completed: true, priority: 'medium', tags: [] },
            { id: '1-2', title: 'Design de mockups', completed: true, priority: 'medium', tags: [] },
            { id: '1-3', title: 'Obter feedback', completed: false, priority: 'medium', tags: [] },
        ],
    },
    {
        id: '2',
        title: 'Revisar pull requests',
        completed: false,
        priority: 'medium',
        dueDate: new Date('2025-12-17'),
        tags: ['development', 'code-review'],
    },
    {
        id: '3',
        title: 'Atualizar documentação',
        description: 'Adicionar novos recursos ao guia do usuário e documentação da API',
        completed: false,
        priority: 'low',
        tags: ['documentation'],
    },
    {
        id: '4',
        title: 'Preparação para reunião de equipe',
        completed: true,
        priority: 'medium',
        dueDate: new Date('2025-12-15'),
        tags: ['meetings'],
    },
    {
        id: '5',
        title: 'Fazer exames para renovar a habilitação',
        completed: false,
        priority: 'high',
        dueDate: new Date('2025-12-20'),
        tags: ['personal', 'important'],
    },
];

export const Tasks = () => {
    const { selectedTag, clearTagFilter } = useTag();
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskTags, setNewTaskTags] = useState('');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingDescription, setEditingDescription] = useState('');
    const [editingPriority, setEditingPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [editingDueDate, setEditingDueDate] = useState('');
    const [editingTags, setEditingTags] = useState('');
    const [showOptions, setShowOptions] = useState<string | null>(null);
    const newTaskRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isCreatingNew && newTaskRef.current) {
            newTaskRef.current.focus();
        }
    }, [isCreatingNew]);

    const createNewTask = () => {
        if (newTaskTitle.trim()) {
            const newTask: Task = {
                id: Date.now().toString(),
                title: newTaskTitle.trim(),
                description: newTaskDescription.trim(),
                completed: false,
                priority: newTaskPriority,
                dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
                tags: newTaskTags.split(',').map(tag => tag.trim()).filter(tag => tag),
            };
            setTasks([newTask, ...tasks]);
            setNewTaskTitle('');
            setNewTaskDescription('');
            setNewTaskPriority('medium');
            setNewTaskDueDate('');
            setNewTaskTags('');
            setIsCreatingNew(false);
        }
    };

    const deleteTask = (taskId: string) => {
        setTasks(tasks.filter(task => task.id !== taskId));
        setShowOptions(null);
    };

    const toggleTask = (taskId: string) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditingTitle(task.title);
        setEditingDescription(task.description || '');
        setEditingPriority(task.priority);
        setEditingDueDate(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
        setEditingTags(task.tags.join(', '));
        setShowOptions(null);
    };

    const saveEdit = () => {
        if (editingTaskId && editingTitle.trim()) {
            setTasks(tasks.map(task =>
                task.id === editingTaskId
                    ? {
                        ...task,
                        title: editingTitle.trim(),
                        description: editingDescription.trim(),
                        priority: editingPriority,
                        dueDate: editingDueDate ? new Date(editingDueDate) : undefined,
                        tags: editingTags.split(',').map(tag => tag.trim()).filter(tag => tag)
                    }
                    : task
            ));
            setEditingTaskId(null);
            setEditingTitle('');
            setEditingDescription('');
            setEditingPriority('medium');
            setEditingDueDate('');
            setEditingTags('');
        }
    };

    const cancelEdit = () => {
        setEditingTaskId(null);
        setEditingTitle('');
        setEditingDescription('');
        setEditingPriority('medium');
        setEditingDueDate('');
        setEditingTags('');
    };

    // Filter tasks based on selected tag and completion status
    const tagFilteredTasks = selectedTag
        ? tasks.filter(task => task.tags.includes(selectedTag))
        : tasks;

    const filteredTasks = tagFilteredTasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    const activeTasks = filteredTasks.filter(t => !t.completed);
    const completedTasks = filteredTasks.filter(t => t.completed);


    const TaskItem = ({ task, level = 0 }: { task: Task; level?: number }) => {
        const isEditing = editingTaskId === task.id;

        return (
            <div className={`group ${level > 0 ? 'ml-8' : ''}`}>
                <div className={`flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors ${task.completed ? 'opacity-60' : ''
                    }`}>
                    <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 shrink-0"
                    >
                        {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-teal-600" />
                        ) : (
                            <Circle className="w-5 h-5 text-gray-300 hover:text-teal-500 transition-colors" />
                        )}
                    </button>

                    {isEditing ? (
                        <div className="flex-1 min-w-0 space-y-3">
                            <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Título da tarefa"
                            />
                            <textarea
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                                rows={2}
                                placeholder="Descrição da tarefa"
                            />
                            <div className="flex gap-2 flex-wrap">
                                <select
                                    value={editingPriority}
                                    onChange={(e) => setEditingPriority(e.target.value as 'low' | 'medium' | 'high')}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="low">Baixa Prioridade</option>
                                    <option value="medium">Média Prioridade</option>
                                    <option value="high">Alta Prioridade</option>
                                </select>
                                <input
                                    type="date"
                                    value={editingDueDate}
                                    onChange={(e) => setEditingDueDate(e.target.value)}
                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <input
                                    type="text"
                                    value={editingTags}
                                    onChange={(e) => setEditingTags(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Tags (separadas por vírgula)"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={saveEdit}
                                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="px-3 py-1.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                                <h3 className={`text-base font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                    }`}>
                                    {task.title}
                                </h3>
                                {task.priority === 'high' && !task.completed && (
                                    <span className="shrink-0 inline-flex items-center text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                                        Alta
                                    </span>
                                )}
                            </div>

                            {task.description && (
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}

                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {task.dueDate && (
                                    <span className={`inline-flex items-center gap-1 text-xs ${new Date(task.dueDate) < new Date() && !task.completed
                                        ? 'text-red-600 font-medium'
                                        : 'text-gray-500'
                                        }`}>
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {task.dueDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                                    </span>
                                )}

                                {task.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {task.subtasks && task.subtasks.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    {task.subtasks.map(subtask => (
                                        <TaskItem key={subtask.id} task={subtask} level={level + 1} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!isEditing && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setShowOptions(showOptions === task.id ? null : task.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-md"
                            >
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>

                            {showOptions === task.id && (
                                <div className="absolute right-4 top-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                                    <button
                                        onClick={() => startEditing(task)}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Excluir
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-6">
            <header className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Tarefas</h1>
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
                </div>
                <p className="text-gray-500 text-sm">
                    {selectedTag
                        ? `${tagFilteredTasks.length} tarefas com a tag "${selectedTag}" (${activeTasks.length} ativas, ${completedTasks.length} concluídas)`
                        : `${activeTasks.length} ativas, ${completedTasks.length} concluídas`
                    }
                </p>
            </header>

            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Todas ({tagFilteredTasks.length})
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'active' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Ativas ({tagFilteredTasks.filter(t => !t.completed).length})
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Concluídas ({tagFilteredTasks.filter(t => t.completed).length})
                </button>
            </div>

            {isCreatingNew && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
                    <div className="space-y-4">
                        <input
                            ref={newTaskRef}
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Título da tarefa"
                        />
                        <textarea
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                            rows={3}
                            placeholder="Descrição da tarefa"
                        />
                        <div className="flex gap-2 flex-wrap">
                            <select
                                value={newTaskPriority}
                                onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                                className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="low">Baixa Prioridade</option>
                                <option value="medium">Média Prioridade</option>
                                <option value="high">Alta Prioridade</option>
                            </select>
                            <input
                                type="date"
                                value={newTaskDueDate}
                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                                className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <input
                                type="text"
                                value={newTaskTags}
                                onChange={(e) => setNewTaskTags(e.target.value)}
                                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Tags (separadas por vírgula)"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsCreatingNew(false);
                                    setNewTaskTitle('');
                                    setNewTaskDescription('');
                                    setNewTaskPriority('medium');
                                    setNewTaskDueDate('');
                                    setNewTaskTags('');
                                }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={createNewTask}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                            >
                                Criar Tarefa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {filteredTasks.map(task => (
                        <TaskItem key={task.id} task={task} />
                    ))}
                </div>

                {filteredTasks.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        <Circle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">
                            {selectedTag
                                ? `Nenhuma tarefa encontrada com a tag "${selectedTag}"`
                                : filter === 'active'
                                    ? 'Nenhuma tarefa ativa'
                                    : filter === 'completed'
                                        ? 'Nenhuma tarefa concluída'
                                        : 'Nenhuma tarefa encontrada'
                            }
                        </p>
                        <p className="text-xs mt-1">
                            {selectedTag
                                ? 'Tente selecionar uma tag diferente ou limpar o filtro.'
                                : 'Crie sua primeira tarefa para começar.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {!isCreatingNew && (
                <button
                    onClick={() => setIsCreatingNew(true)}
                    className="mt-6 w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-teal-300 hover:text-teal-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Adicionar nova tarefa</span>
                </button>
            )}
        </div>
    );
};
