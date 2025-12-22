import { NavLink, useNavigate } from 'react-router-dom';
import { PenSquare, FileText, CheckCircle2, CalendarDays, Settings, ListFilter, Plus, X, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTag } from '../context/TagContext';

const SidebarItem = ({ to, icon: Icon, label, count, onClick }: { to?: string, icon: any, label: string, count?: number, onClick?: () => void }) => {
    if (to) {
        return (
            <NavLink
                to={to}
                className={({ isActive }) =>
                    cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1",
                        isActive
                            ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    )
                }
            >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{label}</span>
                {count !== undefined && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full dark:bg-gray-800">{count}</span>
                )}
            </NavLink>
        );
    }

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors mb-1 text-left"
        >
            <Icon className="w-5 h-5" />
            <span className="flex-1">{label}</span>
            {count !== undefined && (
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full dark:bg-gray-800">{count}</span>
            )}
        </button>
    );
};


export const Sidebar = () => {
    const navigate = useNavigate();
    const { selectedTag, setSelectedTag, clearTagFilter, tags, isLoadingTags, refreshTags } = useTag();

    const handleTagClick = (tag: string) => {
        if (selectedTag === tag) {
            clearTagFilter();
        } else {
            setSelectedTag(tag);
            // Navigate to notes page when a tag is selected
            navigate('/notes');
        }
    };

    // Get color for tag based on its sources
    // Get color for tag based on its sources
    const getTagColor = (sources: ('notes' | 'jots' | 'tasks' | 'events')[]) => {
        if (sources.length > 1) {
            return 'bg-purple-400 dark:bg-purple-500';
        }
        if (sources.includes('notes')) {
            return 'bg-blue-400 dark:bg-blue-500';
        }
        if (sources.includes('jots')) {
            return 'bg-green-400 dark:bg-green-500';
        }
        if (sources.includes('tasks')) {
            return 'bg-orange-400 dark:bg-orange-500';
        }
        if (sources.includes('events')) {
            return 'bg-red-400 dark:bg-red-500';
        }
        return 'bg-gray-400 dark:bg-gray-500';
    };

    return (
        <div className="w-64 h-screen bg-[#fcfcfc] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4 fixed left-0 top-0 overflow-y-auto z-10 transition-colors">

            {/* MaxNote Logo */}
            <div className="mb-6 px-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    MaxNote
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Seu espaço de trabalho inteligente</p>
            </div>

            <div className="mb-6">
                <SidebarItem to="/jots" icon={PenSquare} label="Rascunhos" />
                <SidebarItem to="/notes" icon={FileText} label="Notas" />
                <SidebarItem to="/tasks" icon={CheckCircle2} label="Tarefas" />
                <SidebarItem to="/calendar" icon={CalendarDays} label="Calendário" />
            </div>

            <div className="mb-6">
                <div className='flex items-center justify-between px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
                    <span>Ações Rápidas</span>
                </div>

                {/* Quick Action Buttons */}
                <div className="space-y-1 px-2">
                    <button
                        onClick={() => navigate('/notes')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all hover:shadow-sm group"
                        title="Criar nova nota"
                    >
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="flex-1 text-left font-medium">Nova Nota</span>
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button
                        onClick={() => navigate('/tasks')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all hover:shadow-sm group"
                        title="Criar nova tarefa"
                    >
                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                            <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="flex-1 text-left font-medium">Nova Tarefa</span>
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button
                        onClick={() => navigate('/calendar')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all hover:shadow-sm group"
                        title="Criar novo evento"
                    >
                        <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-md group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                            <CalendarDays className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="flex-1 text-left font-medium">Novo Evento</span>
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <button
                        onClick={() => navigate('/jots')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-all hover:shadow-sm group"
                        title="Criar novo rascunho"
                    >
                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                            <PenSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="flex-1 text-left font-medium">Novo Rascunho</span>
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>

            <div className="flex-1">
                <div className='flex items-center justify-between px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
                    <span>Tags</span>
                    <div className="flex items-center gap-2">
                        {selectedTag && (
                            <button
                                onClick={clearTagFilter}
                                className="text-teal-500 hover:text-teal-600 transition-colors"
                                title="Limpar filtro"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={refreshTags}
                            disabled={isLoadingTags}
                            className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors disabled:opacity-50"
                            title="Atualizar tags"
                        >
                            {isLoadingTags ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                        </button>
                        <ListFilter className='w-4 h-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400' />
                    </div>
                </div>

                {/* Loading state */}
                {isLoadingTags && tags.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-600 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando tags...
                    </div>
                )}

                {/* Empty state */}
                {!isLoadingTags && tags.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-600 italic">
                        Nenhuma tag encontrada
                    </div>
                )}

                {/* Tags list */}
                <div className='space-y-1'>
                    {tags.map(({ name, count, sources }) => (
                        <div
                            key={name}
                            onClick={() => handleTagClick(name)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer group transition-colors ${selectedTag === name
                                ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-sm ${selectedTag === name
                                ? 'bg-teal-500'
                                : `${getTagColor(sources)} opacity-50 group-hover:opacity-100`
                                }`}></div>
                            <span className="flex-1 truncate" title={name}>{name}</span>
                            <span className={`ml-auto text-xs ${selectedTag === name
                                ? 'text-teal-600 dark:text-teal-400'
                                : 'text-gray-300 dark:text-gray-600'
                                }`}>{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                <SidebarItem to="/settings/profile" icon={Settings} label="Configurações" />
            </div>
        </div>
    );
};
