import { useState } from 'react';
import { Globe, Clock, MapPin, Languages } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SettingsCard, SettingsSelect, SettingsButton } from '../shared';
import type { UserSettings } from '../../../types/settings';

interface LanguageRegionSettingsProps {
    settings: UserSettings;
    onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
}

const languageOptions = [
    { value: 'pt-BR', label: 'Português (Brasil)', description: 'Português brasileiro' },
    { value: 'pt-PT', label: 'Português (Portugal)', description: 'Português europeu' },
    { value: 'en-US', label: 'English (US)', description: 'American English' },
    { value: 'en-GB', label: 'English (UK)', description: 'British English' },
    { value: 'es-ES', label: 'Español', description: 'Spanish' },
    { value: 'fr-FR', label: 'Français', description: 'French' },
    { value: 'de-DE', label: 'Deutsch', description: 'German' },
    { value: 'it-IT', label: 'Italiano', description: 'Italian' },
    { value: 'ja-JP', label: '日本語', description: 'Japanese' },
    { value: 'zh-CN', label: '中文', description: 'Chinese (Simplified)' },
];

const commonTimezones = [
    { value: 'America/Sao_Paulo', label: 'Brasília (BRT)', description: 'UTC-3' },
    { value: 'America/New_York', label: 'Nova York (EST/EDT)', description: 'UTC-5/-4' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', description: 'UTC-8/-7' },
    { value: 'Europe/London', label: 'Londres (GMT/BST)', description: 'UTC+0/+1' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)', description: 'UTC+1/+2' },
    { value: 'Asia/Tokyo', label: 'Tóquio (JST)', description: 'UTC+9' },
    { value: 'Asia/Shanghai', label: 'Xangai (CST)', description: 'UTC+8' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', description: 'UTC+10/+11' },
];

const allTimezones = [
    ...commonTimezones,
    { value: 'America/Mexico_City', label: 'Cidade do México (CST/CDT)', description: 'UTC-6/-5' },
    { value: 'America/Chicago', label: 'Chicago (CST/CDT)', description: 'UTC-6/-5' },
    { value: 'America/Denver', label: 'Denver (MST/MDT)', description: 'UTC-7/-6' },
    { value: 'America/Phoenix', label: 'Phoenix (MST)', description: 'UTC-7' },
    { value: 'America/Anchorage', label: 'Anchorage (AKST/AKDT)', description: 'UTC-9/-8' },
    { value: 'Pacific/Honolulu', label: 'Honolulu (HST)', description: 'UTC-10' },
    { value: 'Europe/Berlin', label: 'Berlim (CET/CEST)', description: 'UTC+1/+2' },
    { value: 'Europe/Moscow', label: 'Moscou (MSK)', description: 'UTC+3' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)', description: 'UTC+4' },
    { value: 'Asia/Kolkata', label: 'Nova Delhi (IST)', description: 'UTC+5:30' },
    { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', description: 'UTC+7' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', description: 'UTC+8' },
    { value: 'Asia/Singapore', label: 'Singapura (SGT)', description: 'UTC+8' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', description: 'UTC+12/+13' },
];

export const LanguageRegionSettings: React.FC<LanguageRegionSettingsProps> = ({
    settings,
    onUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        language: settings.language,
        timezone: settings.timezone,
    });

    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            language: settings.language,
            timezone: settings.timezone,
        });
        setIsEditing(false);
        setSaveStatus('idle');
    };

    const getCurrentTime = (timezone: string) => {
        try {
            return new Intl.DateTimeFormat('pt-BR', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(new Date());
        } catch {
            return 'Fuso horário inválido';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Idioma e Região
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configure seu idioma preferido e fuso horário
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

            {/* Language Settings */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Languages className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Idioma
                        </h4>
                    </div>

                    <SettingsSelect
                        label="Idioma da Interface"
                        description="Selecione o idioma para a interface do MaxNote"
                        value={formData.language}
                        onChange={(value) => handleSelectChange('language', value)}
                        options={languageOptions}
                        disabled={!isEditing}
                    />
                </div>
            </SettingsCard>

            {/* Timezone Settings */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Fuso Horário
                        </h4>
                    </div>

                    <SettingsSelect
                        label="Fuso Horário Principal"
                        description="Selecione seu fuso horário para datas e horários corretos"
                        value={formData.timezone}
                        onChange={(value) => handleSelectChange('timezone', value)}
                        options={allTimezones}
                        disabled={!isEditing}
                    />

                    {/* Current Time Display */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                    Hora Atual
                                </h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {getCurrentTime(formData.timezone)}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    Fuso: {formData.timezone}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Regional Settings */}
            <SettingsCard>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            Configurações Regionais
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                Formato de Data
                            </h5>
                            <div className="space-y-2">
                                {[
                                    { value: 'DD/MM/YYYY', label: '31/12/2023' },
                                    { value: 'MM/DD/YYYY', label: '12/31/2023' },
                                    { value: 'YYYY-MM-DD', label: '2023-12-31' },
                                ].map((format) => (
                                    <div
                                        key={format.value}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border",
                                            "border-gray-200 dark:border-gray-700"
                                        )}
                                    >
                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                        <span className="text-gray-900 dark:text-white">
                                            {format.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                Formato de Número
                            </h5>
                            <div className="space-y-2">
                                {[
                                    { value: '1.234,56', label: 'Brasileiro (1.234,56)' },
                                    { value: '1,234.56', label: 'Americano (1,234.56)' },
                                    { value: '1 234,56', label: 'Europeu (1 234,56)' },
                                ].map((format) => (
                                    <div
                                        key={format.value}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border",
                                            "border-gray-200 dark:border-gray-700"
                                        )}
                                    >
                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                        <span className="text-gray-900 dark:text-white">
                                            {format.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* Preview Notice */}
            {isEditing && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                            <h5 className="font-medium text-blue-900 dark:text-blue-100">
                                Reinicialização Necessária
                            </h5>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Algumas alterações de idioma podem exigir a reinicialização da aplicação
                                para serem aplicadas completamente.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};