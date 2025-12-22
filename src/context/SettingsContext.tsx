import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { UserSettings, SettingsValidationErrors } from '../types/settings';

interface SettingsContextType {
    settings: UserSettings;
    loading: boolean;
    error: string | null;
    updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
    resetSettings: () => Promise<void>;
    exportSettings: () => Promise<void>;
    importSettings: (data: any) => Promise<void>;
    validateSettings: (data: Partial<UserSettings>) => SettingsValidationErrors;
}

const defaultSettings: UserSettings = {
    // Profile settings
    displayName: '',
    bio: '',
    phone: '',
    avatarUrl: undefined,

    // System settings
    theme: 'system',
    language: 'pt-BR',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: {
        push: true,
        email: true,
        inApp: true,
        reminders: true,
        updates: false,
    },
    autoSync: true,
    autoBackup: false,

    // Accessibility settings
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,

    // Data settings
    exportFormat: 'json',
    retentionDays: 365,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'maxnote-settings';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load settings from localStorage on mount
    useEffect(() => {
        const loadSettings = () => {
            try {
                const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
                if (storedSettings) {
                    const parsedSettings = JSON.parse(storedSettings);
                    setSettings({ ...defaultSettings, ...parsedSettings });
                }
            } catch (err) {
                console.error('Error loading settings:', err);
                setError('Erro ao carregar configurações');
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        if (!loading) {
            try {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            } catch (err) {
                console.error('Error saving settings:', err);
                setError('Erro ao salvar configurações');
            }
        }
    }, [settings, loading]);

    const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
        setLoading(true);
        setError(null);

        try {
            const validationErrors = validateSettings(updates);
            if (Object.keys(validationErrors).length > 0) {
                setError('Existem erros de validação');
                setLoading(false);
                return;
            }

            setSettings(prev => ({ ...prev, ...updates }));

            // In a real implementation, this would also sync with Supabase
            // await syncSettingsWithDatabase(user?.id, updates);

        } catch (err) {
            console.error('Error updating settings:', err);
            setError('Erro ao atualizar configurações');
        } finally {
            setLoading(false);
        }
    }, []);

    const resetSettings = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            setSettings(defaultSettings);
            localStorage.removeItem(SETTINGS_STORAGE_KEY);

            // In a real implementation, this would also reset in the database
            // await resetSettingsInDatabase(user?.id);

        } catch (err) {
            console.error('Error resetting settings:', err);
            setError('Erro ao redefinir configurações');
        } finally {
            setLoading(false);
        }
    }, []);

    const exportSettings = useCallback(async () => {
        try {
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `maxnote-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting settings:', err);
            setError('Erro ao exportar configurações');
        }
    }, [settings]);

    const importSettings = useCallback(async (data: any) => {
        setLoading(true);
        setError(null);

        try {
            const validationErrors = validateSettings(data);
            if (Object.keys(validationErrors).length > 0) {
                setError('Existem erros de validação nos dados importados');
                setLoading(false);
                return;
            }

            setSettings({ ...defaultSettings, ...data });
        } catch (err) {
            console.error('Error importing settings:', err);
            setError('Erro ao importar configurações');
        } finally {
            setLoading(false);
        }
    }, []);

    const validateSettings = useCallback((data: Partial<UserSettings>): SettingsValidationErrors => {
        const errors: SettingsValidationErrors = {};

        // Validate display name
        if (data.displayName !== undefined) {
            if (!data.displayName.trim()) {
                errors.displayName = 'Nome é obrigatório';
            } else if (data.displayName.length < 2) {
                errors.displayName = 'Nome deve ter pelo menos 2 caracteres';
            } else if (data.displayName.length > 50) {
                errors.displayName = 'Nome deve ter no máximo 50 caracteres';
            }
        }

        // Validate phone
        if (data.phone !== undefined) {
            const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
            if (data.phone && !phoneRegex.test(data.phone)) {
                errors.phone = 'Formato de telefone inválido';
            }
        }

        // Validate bio
        if (data.bio !== undefined) {
            if (data.bio && data.bio.length > 500) {
                errors.bio = 'Biografia deve ter no máximo 500 caracteres';
            }
        }

        return errors;
    }, []);

    const value: SettingsContextType = {
        settings,
        loading,
        error,
        updateSettings,
        resetSettings,
        exportSettings,
        importSettings,
        validateSettings,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};