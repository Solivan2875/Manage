import { useState, useEffect } from 'react';
import { Save, Check, X, Loader2 } from 'lucide-react';
import type { AuthUser } from '../../../context/AuthContext';
import type { UserSettings } from '../../../types/settings';
import { SettingsInput, SettingsButton } from '../shared';
import { useSettings } from '../../../context/SettingsContext';
import { cn } from '../../../lib/utils';

interface PersonalInfoFormProps {
    user: AuthUser | null;
    settings: UserSettings;
    onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
    user,
    settings,
    onUpdate
}) => {
    const [formData, setFormData] = useState({
        displayName: settings.displayName || user?.name || '',
        bio: settings.bio || '',
        phone: settings.phone || '',
        email: user?.email || '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const { validateSettings } = useSettings();

    // Reset form when user data changes
    useEffect(() => {
        setFormData({
            displayName: settings.displayName || user?.name || '',
            bio: settings.bio || '',
            phone: settings.phone || '',
            email: user?.email || '',
        });
    }, [user, settings]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaveStatus('idle');
    };

    const handleSave = async () => {
        const validationErrors = validateSettings({
            displayName: formData.displayName,
            phone: formData.phone,
            bio: formData.bio,
        });

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setIsSaving(true);
        try {
            await onUpdate({
                displayName: formData.displayName,
                bio: formData.bio,
                phone: formData.phone,
            });

            setSaveStatus('success');
            setIsEditing(false);

            // Reset status after 3 seconds
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
            displayName: settings.displayName || user?.name || '',
            bio: settings.bio || '',
            phone: settings.phone || '',
            email: user?.email || '',
        });
        setIsEditing(false);
        setSaveStatus('idle');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Informações Pessoais
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Atualize suas informações pessoais e de contato
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
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Salvar
                            </SettingsButton>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsInput
                    label="Nome Completo"
                    value={formData.displayName}
                    onChange={(value) => handleInputChange('displayName', value)}
                    disabled={!isEditing}
                    placeholder="Seu nome completo"
                />

                <SettingsInput
                    label="Email"
                    value={formData.email}
                    onChange={() => { }} // Email is read-only
                    disabled={true}
                    type="email"
                    description="Email não pode ser alterado aqui"
                />

                <SettingsInput
                    label="Telefone"
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    disabled={!isEditing}
                    type="tel"
                    placeholder="+55 (00) 00000-0000"
                    description="Formato: +55 (00) 00000-0000"
                />

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Biografia
                    </label>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        className={cn(
                            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
                            "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                            "focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "resize-none"
                        )}
                        placeholder="Conte um pouco sobre você..."
                        maxLength={500}
                    />
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {formData.bio.length}/500 caracteres
                    </div>
                </div>
            </div>
        </div>
    );
};