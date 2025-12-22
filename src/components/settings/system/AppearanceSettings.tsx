import { useState, useEffect } from 'react';
import { Palette, Type, Monitor, Sun, Moon, MonitorIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SettingsCard, SettingsToggle, SettingsSelect, SettingsButton } from '../shared';
import type { UserSettings } from '../../../types/settings';

interface AppearanceSettingsProps {
    settings: UserSettings;
    onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
}

const themeOptions = [
    { value: 'light', label: 'Claro', description: 'Tema claro para uso durante o dia' },
    { value: 'dark', label: 'Escuro', description: 'Tema escuro para uso noturno' },
    { value: 'system', label: 'Sistema', description: 'Seguir as preferências do sistema' },
];

const fontSizeOptions = [
    { value: 'small', label: 'Pequeno', description: 'Texto menor para mais conteúdo na tela' },
    { value: 'medium', label: 'Médio', description: 'Tamanho padrão de texto' },
    { value: 'large', label: 'Grande', description: 'Texto maior para melhor legibilidade' },
];

const getThemeIcon = (theme: string) => {
    switch (theme) {
        case 'light':
            return Sun;
        case 'dark':
            return Moon;
        case 'system':
            return MonitorIcon;
        default:
            return Monitor;
    }
};

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
    settings,
    onUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        theme: settings.theme,
        fontSize: settings.fontSize,
        highContrast: settings.highContrast,
        reduceMotion: settings.reduceMotion,
    });

    const handleToggleChange = (field: string, value: boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaveStatus('idle');
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value as any }));
        setSaveStatus('idle');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(formData);
            setSaveStatus('success');
            setIsEditing(false);
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            theme: settings.theme,
            fontSize: settings.fontSize,
            highContrast: settings.highContrast,
            reduceMotion: settings.reduceMotion,
        });
        setIsEditing(false);
        setSaveStatus('idle');
    };

    // Apply theme changes immediately for preview
    useEffect(() => {
        if (isEditing) {
            const root = document.documentElement;

            // Apply theme
            if (formData.theme === 'dark') {
                root.classList.add('dark');
            } else if (formData.theme === 'light') {
                root.classList.remove('dark');
            } else {
                // System theme
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }

            // Apply font size
            root.style.fontSize =
                formData.fontSize === 'small' ? '14px' :
                    formData.fontSize === 'large' ? '18px' : '16px';

            // Apply high contrast
            if (formData.highContrast) {
                root.classList.add('high-contrast');
            } else {
                root.classList.remove('high-contrast');
            }

            // Apply reduced motion
            if (formData.reduceMotion) {
                root.classList.add('reduce-motion');
            } else {
                root.classList.remove('reduce-motion');
            }
        }
    }, [formData, isEditing]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Aparência
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Personalize o visual e a aparência do MaxNote
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {saveStatus === 'success' && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <span className="text-sm">Salvo</span>
                        </div>
                    )}

                    {saveStatus === 'error' && (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <span className="text-sm">Erro</span>
                        </div>
                    )}

                    {!isEditing ? (
                        <SettingsButton onClick={() => setIsEditing(true)}>
                            Editar
                        </SettingsButton>
                    ) : (
                        <div className="flex items-center gap-2">
                            <SettingsButton
                                variant="secondary"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                Cancelar
                            </SettingsButton>
                            <SettingsButton
                                onClick={handleSave}
                                loading={isSaving}
                            >
                                Salvar
                            </SettingsButton>
                        </div>
                    )}
                </div>
            </div>

            {/* Theme Selection */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Palette className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Tema
                        </h4>
                    </div>

                    <div className="space-y-3">
                        {themeOptions.map((option) => {
                            const Icon = getThemeIcon(option.value);
                            const isSelected = formData.theme === option.value;

                            return (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                        isSelected
                                            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    )}
                                    onClick={() => isEditing && handleSelectChange('theme', option.value)}
                                >
                                    <Icon className={cn(
                                        "w-5 h-5 mt-0.5",
                                        isSelected
                                            ? "text-teal-600 dark:text-teal-400"
                                            : "text-gray-400 dark:text-gray-500"
                                    )} />
                                    <div className="flex-1">
                                        <h5 className="font-medium text-gray-900 dark:text-white">
                                            {option.label}
                                        </h5>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {option.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </SettingsCard>

            {/* Font Settings */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Type className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Fonte
                        </h4>
                    </div>

                    <SettingsSelect
                        label="Tamanho da Fonte"
                        value={formData.fontSize}
                        onChange={(value) => handleSelectChange('fontSize', value)}
                        options={fontSizeOptions}
                        disabled={!isEditing}
                    />
                </div>
            </SettingsCard>

            {/* Accessibility Options */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Acessibilidade Visual
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <SettingsToggle
                            label="Alto Contraste"
                            description="Aumenta o contraste para melhor legibilidade"
                            checked={formData.highContrast}
                            onChange={(checked) => handleToggleChange('highContrast', checked)}
                            disabled={!isEditing}
                        />

                        <SettingsToggle
                            label="Reduzir Movimento"
                            description="Reduz animações e efeitos visuais"
                            checked={formData.reduceMotion}
                            onChange={(checked) => handleToggleChange('reduceMotion', checked)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </SettingsCard>

            {/* Preview Notice */}
            {isEditing && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                            <h5 className="font-medium text-blue-900 dark:text-blue-100">
                                Visualização Prévia
                            </h5>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                As alterações estão sendo aplicadas temporariamente para visualização.
                                Clique em "Salvar" para aplicar permanentemente.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};