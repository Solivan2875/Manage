import { useState, useRef, useEffect, useCallback } from 'react';
import { Circle, CheckCircle2, Calendar as CalendarIcon, Tag, Plus, MoreHorizontal, Edit, Trash2, X, Check, XCircle, Loader2 } from 'lucide-react';
import { useTag } from '../context/TagContext';
import { useAuth } from '../context/AuthContext';
import { tasksService, type Task as SupabaseTask } from '../services/supabaseService';

interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate: Date | null;
    tags: string[];
}

const mapSupabaseTask = (task: SupabaseTask): Task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.status === 'completed',
    priority: task.priority,
    dueDate: task.due_date ? new Date(task.due_date) : null,
    tags: task.tags || [],
});

export const Tasks = () => {
    const { selectedTag, clearTagFilter, refreshTags } = useTag();
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    // Load tasks from Supabase
    const loadTasks = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await tasksService.getAll();
            if (error) {
                setError(error);
            } else if (data) {
                setTasks(data.map(mapSupabaseTask));
            }
        } catch (err) {
            console.error('Error loading tasks:', err);
            setError('Erro ao carregar tarefas');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    useEffect(() => {
        if (isCreatingNew && newTaskRef.current) {
            newTaskRef.current.focus();
        }
    }, [isCreatingNew]);

    const createNewTask = async () => {
        if (!newTaskTitle.trim()) return;

        setIsSaving(true);
        try {
            const { data, error } = await tasksService.create({
                title: newTaskTitle.trim(),
                description: newTaskDescription.trim(),
                status: 'pending',
                priority: newTaskPriority,
                due_date: newTaskDueDate || null,
                tags: newTaskTags.split(',').map(tag => tag.trim()).filter(tag => tag),
            });

            if (error) {
                setError(error);
            } else if (data) {
                setTasks([mapSupabaseTask(data), ...tasks]);
                setNewTaskTitle('');
                setNewTaskDescription('');
                setNewTaskPriority('medium');
                setNewTaskDueDate('');
                setNewTaskTags('');
                setIsCreatingNew(false);
                refreshTags(); // Update tags in sidebar
            }
        } catch (err) {
            console.error('Error creating task:', err);
            setError('Erro ao criar tarefa');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            const { success, error } = await tasksService.delete(taskId);
            if (error) {
                setError(error);
            } else if (success) {
                setTasks(tasks.filter(task => task.id !== taskId));
                refreshTags(); // Update tags in sidebar
            }
        } catch (err) {
            console.error('Error deleting task:', err);
            setError('Erro ao excluir tarefa');
        }
        setShowOptions(null);
    };

    const toggleTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            const newStatus = task.completed ? 'pending' : 'completed';
            const { data, error } = await tasksService.update(taskId, {
                status: newStatus,
            });

            if (error) {
                setError(error);
            } else if (data) {
                setTasks(tasks.map(t =>
                    t.id === taskId ? mapSupabaseTask(data) : t
                ));
            }
        } catch (err) {
            console.error('Error updating task:', err);
            setError('Erro ao atualizar tarefa');
        }
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

    const saveEdit = async () => {
        if (!editingTaskId || !editingTitle.trim()) return;

        setIsSaving(true);
        try {
            const { data, error } = await tasksService.update(editingTaskId, {
                title: editingTitle.trim(),
                description: editingDescription.trim(),
                priority: editingPriority,
                due_date: editingDueDate || null,
                tags: editingTags.split(',').map(tag => tag.trim()).filter(tag => tag),
            });

            if (error) {
                setError(error);
            } else if (data) {
                setTasks(tasks.map(task =>
                    task.id === editingTaskId ? mapSupabaseTask(data) : task
                ));
                setEditingTaskId(null);
                setEditingTitle('');
                setEditingDescription('');
                setEditingPriority('medium');
                setEditingDueDate('');
                setEditingTags('');
            }
        } catch (err) {
            console.error('Error updating task:', err);
            setError('Erro ao atualizar tarefa');
        } finally {
            setIsSaving(false);
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

    const TaskItem = ({ task }: { task: Task }) => {
        const isEditing = editingTaskId === task.id;

        return (
            <div className="group">
                <div className={`flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${task.completed ? 'opacity-60' : ''
                    }`}>
                    <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 shrink-0"
                    >
                        {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-teal-600" />
                        ) : (
                            <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-teal-500 transition-colors" />
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
                                    disabled={isSaving}
                                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
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
                                <h3 className={`text-base font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'
                                    }`}>
                                    {task.title}
                                </h3>
                                {task.priority === 'high' && !task.completed && (
                                    <span className="shrink-0 inline-flex items-center text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                                        Alta
                                    </span>
                                )}
                            </div>

                            {task.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                            )}

                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {task.dueDate && (
                                    <span className={`inline-flex items-center gap-1 text-xs ${new Date(task.dueDate) < new Date() && !task.completed
                                        ? 'text-red-600 dark:text-red-400 font-medium'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {task.dueDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                                    </span>
                                )}

                                {task.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isEditing && (
                        <div className="relative flex items-center gap-1">
                            <button
                                onClick={() => setShowOptions(showOptions === task.id ? null : task.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>

                            {showOptions === task.id && (
                                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-6">
            <header className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Tarefas</h1>
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
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {selectedTag
                        ? `${tagFilteredTasks.length} tarefas com a tag "${selectedTag}" (${activeTasks.length} ativas, ${completedTasks.length} concluídas)`
                        : `${activeTasks.length} ativas, ${completedTasks.length} concluídas`
                    }
                </p>
            </header>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">Fechar</button>
                </div>
            )}

            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    Todas ({tagFilteredTasks.length})
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'active' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    Ativas ({tagFilteredTasks.filter(t => !t.completed).length})
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                                disabled={isSaving || !newTaskTitle.trim()}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                Criar Tarefa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredTasks.map(task => (
                        <TaskItem key={task.id} task={task} />
                    ))}
                </div>

                {filteredTasks.length === 0 && (
                    <div className="p-12 text-center text-gray-400 dark:text-gray-500">
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
                    className="mt-6 w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 dark:text-gray-500 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Adicionar nova tarefa</span>
                </button>
            )}
        </div>
    );
};
