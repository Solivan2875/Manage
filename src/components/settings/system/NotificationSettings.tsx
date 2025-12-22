import { useState } from 'react';
import { Bell, Mail, Smartphone, Volume2, Calendar, MessageSquare, Info, Check, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SettingsCard, SettingsToggle, SettingsButton, SettingsSelect } from '../shared';
import type { UserSettings } from '../../../types/settings';

interface NotificationSettingsProps {
    settings: UserSettings;
    onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
}

const notificationFrequencyOptions = [
    { value: 'immediate', label: 'Imediato', description: 'Receba notificações assim que acontecerem' },
    { value: 'hourly', label: 'A cada hora', description: 'Agrupe notificações em resumos horários' },
    { value: 'daily', label: 'Diário', description: 'Receba um resumo diário das notificações' },
    { value: 'weekly', label: 'Semanal', description: 'Receba um resumo semanal das notificações' },
];

const notificationSoundOptions = [
    { value: 'default', label: 'Padrão', description: 'Som de notificação padrão do sistema' },
    { value: 'gentle', label: 'Suave', description: 'Som suave e discreto' },
    { value: 'chime', label: 'Campainha', description: 'Som de campainha clara' },
    { value: 'none', label: 'Silencioso', description: 'Sem som de notificação' },
];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
    settings,
    onUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        notifications: settings.notifications,
        notificationFrequency: 'immediate' as string,
        notificationSound: 'default' as string,
        doNotDisturb: false,
    });

    const handleToggleChange = (field: string, value: boolean) => {
        if (field.startsWith('notifications.')) {
            const notificationField = field.split('.')[1] as keyof typeof settings.notifications;
            setFormData(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [notificationField]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        setSaveStatus('idle');
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaveStatus('idle');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate({
                notifications: formData.notifications,
            });
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
            notifications: settings.notifications,
            notificationFrequency: 'immediate',
            notificationSound: 'default',
            doNotDisturb: false,
        });
        setIsEditing(false);
        setSaveStatus('idle');
    };

    const notificationCategories = [
        {
            id: 'push',
            icon: Smartphone,
            title: 'Notificações Push',
            description: 'Receba notificações no seu dispositivo',
            color: 'blue'
        },
        {
            id: 'email',
            icon: Mail,
            title: 'Notificações por Email',
            description: 'Receba atualizações importantes no seu email',
            color: 'green'
        },
        {
            id: 'inApp',
            icon: Bell,
            title: 'Notificações na Aplicação',
            description: 'Notificações dentro do MaxNote',
            color: 'purple'
        },
        {
            id: 'reminders',
            icon: Calendar,
            title: 'Lembretes',
            description: 'Lembretes de tarefas e eventos',
            color: 'orange'
        },
        {
            id: 'updates',
            icon: Info,
            title: 'Atualizações',
            description: 'Novidades e atualizações do MaxNote',
            color: 'teal'
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Notificações
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configure como e quando deseja receber notificações
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {saveStatus === 'success' && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Salvo</span>
                        </div>
                    )}

                    {saveStatus === 'error' && (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <X className="w-4 h-4" />
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

            {/* Notification Categories */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Tipos de Notificação
                        </h4>
                    </div>

                    <div className="space-y-4">
                        {notificationCategories.map((category) => {
                            const Icon = category.icon;
                            const isChecked = formData.notifications[category.id as keyof typeof formData.notifications];

                            return (
                                <div
                                    key={category.id}
                                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        category.color === 'blue' && "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                                        category.color === 'green' && "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
                                        category.color === 'purple' && "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
                                        category.color === 'orange' && "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
                                        category.color === 'teal' && "bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="font-medium text-gray-900 dark:text-white">
                                                    {category.title}
                                                </h5>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {category.description}
                                                </p>
                                            </div>

                                            <SettingsToggle
                                                label=""
                                                checked={isChecked as boolean}
                                                onChange={(checked) => handleToggleChange(`notifications.${category.id}`, checked)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </SettingsCard>

            {/* Notification Preferences */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Preferências de Notificação
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <SettingsSelect
                            label="Frequência de Notificação"
                            description="Com que frequência você deseja receber notificações agrupadas"
                            value={formData.notificationFrequency}
                            onChange={(value) => handleSelectChange('notificationFrequency', value)}
                            options={notificationFrequencyOptions}
                            disabled={!isEditing}
                        />

                        <SettingsSelect
                            label="Som de Notificação"
                            description="Escolha o som das notificações"
                            value={formData.notificationSound}
                            onChange={(value) => handleSelectChange('notificationSound', value)}
                            options={notificationSoundOptions}
                            disabled={!isEditing}
                        />

                        <SettingsToggle
                            label="Não Perturbar"
                            description="Silenciar todas as notificações temporariamente"
                            checked={formData.doNotDisturb}
                            onChange={(checked) => handleToggleChange('doNotDisturb', checked)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </SettingsCard>

            {/* Notification Schedule */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Horário de Notificações
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Horário Permitido
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Início
                                    </label>
                                    <input
                                        type="time"
                                        defaultValue="08:00"
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Fim
                                    </label>
                                    <input
                                        type="time"
                                        defaultValue="22:00"
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Volume2 className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                                <div>
                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                        Status Atual
                                    </h5>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {formData.doNotDisturb
                                            ? 'Modo "Não Perturbar" está ativo'
                                            : 'Notificações estão ativas'
                                        }
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                        {formData.notificationFrequency === 'immediate'
                                            ? 'Notificações imediatas'
                                            : `Resumo ${formData.notificationFrequency === 'hourly' ? 'horário' : formData.notificationFrequency === 'daily' ? 'diário' : 'semanal'}`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
};