import { useState, useCallback } from 'react';
import { Keyboard, Plus, Edit2, Trash2, RotateCcw, Search, Save, Copy, Download, Upload } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsInput } from '../shared/SettingsInput';
import { SettingsToggle } from '../shared/SettingsToggle';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { cn } from '../../../lib/utils';

interface Shortcut {
    id: string;
    action: string;
    keys: string;
    category: 'navigation' | 'editing' | 'file' | 'general';
    customizable: boolean;
    description: string;
}

interface CustomShortcut {
    id: string;
    action: string;
    keys: string;
}

export const KeyboardShortcuts: React.FC = () => {
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([
        {
            id: 'search',
            action: 'Buscar',
            keys: 'Ctrl + K',
            category: 'navigation',
            customizable: true,
            description: 'Abrir busca global'
        },
        {
            id: 'save',
            action: 'Salvar',
            keys: 'Ctrl + S',
            category: 'editing',
            customizable: true,
            description: 'Salvar nota ou tarefa atual'
        },
        {
            id: 'copy',
            action: 'Copiar',
            keys: 'Ctrl + C',
            category: 'editing',
            customizable: false,
            description: 'Copiar texto selecionado'
        },
        {
            id: 'new-note',
            action: 'Nova Nota',
            keys: 'Ctrl + N',
            category: 'file',
            customizable: true,
            description: 'Criar nova nota'
        },
        {
            id: 'new-task',
            action: 'Nova Tarefa',
            keys: 'Ctrl + T',
            category: 'file',
            customizable: true,
            description: 'Criar nova tarefa'
        },
        {
            id: 'settings',
            action: 'Configurações',
            keys: 'Ctrl + ,',
            category: 'general',
            customizable: false,
            description: 'Abrir configurações'
        },
        {
            id: 'export',
            action: 'Exportar',
            keys: 'Ctrl + E',
            category: 'file',
            customizable: true,
            description: 'Exportar dados'
        },
        {
            id: 'import',
            action: 'Importar',
            keys: 'Ctrl + I',
            category: 'file',
            customizable: true,
            description: 'Importar dados'
        }
    ]);

    const [customShortcuts, setCustomShortcuts] = useState<CustomShortcut[]>([]);
    const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
    const [newKeys, setNewKeys] = useState('');
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [enableShortcuts, setEnableShortcuts] = useState(true);

    const categoryIcons = {
        navigation: Search,
        editing: Edit2,
        file: Save,
        general: Keyboard
    };

    const categoryLabels = {
        navigation: 'Navegação',
        editing: 'Edição',
        file: 'Arquivo',
        general: 'Geral'
    };

    const handleEditShortcut = useCallback((shortcutId: string, currentKeys: string) => {
        setEditingShortcut(shortcutId);
        setNewKeys(currentKeys);
    }, []);

    const handleSaveShortcut = useCallback((shortcutId: string) => {
        if (newKeys.trim()) {
            setShortcuts(prev => prev.map(shortcut =>
                shortcut.id === shortcutId
                    ? { ...shortcut, keys: newKeys.trim() }
                    : shortcut
            ));
        }
        setEditingShortcut(null);
        setNewKeys('');
    }, [newKeys]);

    const handleCancelEdit = useCallback(() => {
        setEditingShortcut(null);
        setNewKeys('');
    }, []);

    const handleResetShortcuts = useCallback(() => {
        // Reset to default shortcuts
        setShortcuts(prev => prev.map(shortcut => {
            const defaults: Record<string, string> = {
                'search': 'Ctrl + K',
                'save': 'Ctrl + S',
                'new-note': 'Ctrl + N',
                'new-task': 'Ctrl + T',
                'export': 'Ctrl + E',
                'import': 'Ctrl + I'
            };
            return defaults[shortcut.id]
                ? { ...shortcut, keys: defaults[shortcut.id] }
                : shortcut;
        }));
        setShowResetDialog(false);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent, shortcutId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const keys = [];
        if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
        if (e.altKey) keys.push('Alt');
        if (e.shiftKey) keys.push('Shift');

        if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
            keys.push(e.key.toUpperCase());
        }

        setNewKeys(keys.join(' + '));
    }, []);

    const formatKeys = (keys: string) => {
        return keys.split(' + ').map(key => {
            switch (key) {
                case 'CTRL':
                    return 'Ctrl';
                case 'META':
                    return 'Cmd';
                default:
                    return key;
            }
        }).join(' + ');
    };

    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, Shortcut[]>);

    return (
        <div className="space-y-6">
            {/* Global Settings */}
            <SettingsCard
                title="Configurações Gerais"
                description="Ative ou desative atalhos de teclado"
            >
                <div className="space-y-4">
                    <SettingsToggle
                        label="Ativar Atalhos de Teclado"
                        description="Permite usar atalhos para navegação rápida"
                        checked={enableShortcuts}
                        onChange={setEnableShortcuts}
                    />

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                            Dica Rápida
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            Pressione "?" a qualquer momento para ver todos os atalhos disponíveis.
                        </p>
                    </div>
                </div>
            </SettingsCard>

            {/* Shortcuts by Category */}
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                return (
                    <SettingsCard
                        key={category}
                        title={categoryLabels[category as keyof typeof categoryLabels]}
                        description={`Atalhos para ${categoryLabels[category as keyof typeof categoryLabels].toLowerCase()}`}
                    >
                        <div className="space-y-3">
                            {categoryShortcuts.map((shortcut) => (
                                <div
                                    key={shortcut.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {shortcut.action}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {shortcut.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {editingShortcut === shortcut.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={newKeys}
                                                    onChange={(e) => setNewKeys(e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, shortcut.id)}
                                                    placeholder="Pressione as teclas"
                                                    className="w-32 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                />
                                                <SettingsButton
                                                    variant="primary"
                                                    onClick={() => handleSaveShortcut(shortcut.id)}
                                                    className="text-xs px-3 py-1"
                                                >
                                                    Salvar
                                                </SettingsButton>
                                                <SettingsButton
                                                    variant="secondary"
                                                    onClick={handleCancelEdit}
                                                    className="text-xs px-3 py-1"
                                                >
                                                    Cancelar
                                                </SettingsButton>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                                                    {formatKeys(shortcut.keys)}
                                                </kbd>
                                                {shortcut.customizable && (
                                                    <SettingsButton
                                                        variant="secondary"
                                                        onClick={() => handleEditShortcut(shortcut.id, shortcut.keys)}
                                                        className="text-xs px-3 py-1"
                                                    >
                                                        <Edit2 className="w-3 h-3 mr-1" />
                                                        Editar
                                                    </SettingsButton>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SettingsCard>
                );
            })}

            {/* Custom Shortcuts */}
            <SettingsCard
                title="Atalhos Personalizados"
                description="Crie seus próprios atalhos personalizados"
            >
                <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Keyboard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Em desenvolvimento</p>
                        <p className="text-sm mt-2">
                            Em breve você poderá criar atalhos completamente personalizados
                        </p>
                    </div>
                </div>
            </SettingsCard>

            {/* Reset Actions */}
            <SettingsCard
                title="Redefinir Configurações"
                description="Restaure os atalhos para as configurações padrão"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                            Redefinir Atalhos
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                            Esta ação redefinirá todos os atalhos personalizados para as configurações padrão.
                            Esta ação não pode ser desfeita.
                        </p>
                        <SettingsButton
                            variant="danger"
                            onClick={() => setShowResetDialog(true)}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Redefinir Todos os Atalhos
                        </SettingsButton>
                    </div>
                </div>
            </SettingsCard>

            {/* Reset Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showResetDialog}
                onClose={() => setShowResetDialog(false)}
                onConfirm={handleResetShortcuts}
                title="Redefinir Atalhos"
                message="Tem certeza que deseja redefinir todos os atalhos para as configurações padrão? Seus atalhos personalizados serão perdidos."
                confirmText="Redefinir"
                cancelText="Cancelar"
                variant="warning"
            />
        </div>
    );
};