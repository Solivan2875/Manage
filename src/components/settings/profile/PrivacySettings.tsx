import { useState } from 'react';
import { Shield, Eye, EyeOff, Users, Globe, Lock, BarChart, Share2, Check, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SettingsCard, SettingsToggle, SettingsButton, SettingsSelect } from '../shared';
import type { PrivacySettings } from '../../../types/settings';

interface PrivacySettingsProps {
    privacySettings: PrivacySettings;
    onUpdate: (updates: Partial<PrivacySettings>) => Promise<void>;
}

const visibilityOptions = [
    { value: 'public', label: 'Público', description: 'Qualquer pessoa pode ver seu perfil' },
    { value: 'registered', label: 'Usuários Registrados', description: 'Apenas usuários logados podem ver seu perfil' },
    { value: 'private', label: 'Privado', description: 'Apenas você pode ver seu perfil' },
];

export const PrivacySettingsComponent: React.FC<PrivacySettingsProps> = ({
    privacySettings,
    onUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState<PrivacySettings>(privacySettings);

    const handleToggleChange = (field: keyof PrivacySettings, value: boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaveStatus('idle');
    };

    const handleSelectChange = (field: keyof PrivacySettings, value: string) => {
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
        setFormData(privacySettings);
        setIsEditing(false);
        setSaveStatus('idle');
    };

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'public':
                return Globe;
            case 'registered':
                return Users;
            case 'private':
                return Lock;
            default:
                return Eye;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Configurações de Privacidade
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Controle quem pode ver suas informações e como seus dados são usados
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

            {/* Profile Visibility */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Visibilidade do Perfil
                        </h4>
                    </div>

                    <div className="space-y-3">
                        {visibilityOptions.map((option) => {
                            const Icon = getVisibilityIcon(option.value);
                            const isSelected = formData.profileVisibility === option.value;

                            return (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                        isSelected
                                            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    )}
                                    onClick={() => isEditing && handleSelectChange('profileVisibility', option.value)}
                                >
                                    <Icon className={cn(
                                        "w-5 h-5 mt-0.5",
                                        isSelected
                                            ? "text-teal-600 dark:text-teal-400"
                                            : "text-gray-400 dark:text-gray-500"
                                    )} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h5 className="font-medium text-gray-900 dark:text-white">
                                                {option.label}
                                            </h5>
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                            )}
                                        </div>
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

            {/* Contact Information */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Informações de Contato
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <SettingsToggle
                            label="Mostrar Email"
                            description="Permitir que outros usuários vejam seu endereço de email"
                            checked={formData.showEmail}
                            onChange={(checked) => handleToggleChange('showEmail', checked)}
                            disabled={!isEditing}
                        />

                        <SettingsToggle
                            label="Mostrar Telefone"
                            description="Permitir que outros usuários vejam seu número de telefone"
                            checked={formData.showPhone}
                            onChange={(checked) => handleToggleChange('showPhone', checked)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </SettingsCard>

            {/* Data Collection */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <BarChart className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Coleta de Dados
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <SettingsToggle
                            label="Coleta de Dados"
                            description="Permitir coleta de dados anônimos para melhorar o serviço"
                            checked={formData.allowDataCollection}
                            onChange={(checked) => handleToggleChange('allowDataCollection', checked)}
                            disabled={!isEditing}
                        />

                        <SettingsToggle
                            label="Analytics"
                            description="Ajude-nos a entender como você usa o MaxNote"
                            checked={formData.enableAnalytics}
                            onChange={(checked) => handleToggleChange('enableAnalytics', checked)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </SettingsCard>

            {/* Activity Sharing */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Share2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Compartilhamento de Atividades
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <SettingsToggle
                            label="Compartilhar Atividades"
                            description="Permitir que suas atividades públicas sejam visíveis para outros usuários"
                            checked={formData.shareActivity}
                            onChange={(checked) => handleToggleChange('shareActivity', checked)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
};
