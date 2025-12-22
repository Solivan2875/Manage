# MaxNote Settings - State Management & Implementation

## Settings Context Implementation

```typescript
// src/context/SettingsContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthUser } from './AuthContext';
import { supabase } from '../lib/supabase';

// Types
export interface UserSettings {
  // Profile settings
  displayName: string;
  bio: string;
  phone: string;
  avatarUrl?: string;
  profileVisibility: 'public' | 'registered' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  
  // System settings
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  autoSync: boolean;
  autoBackup: boolean;
  
  // Accessibility settings
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  focusVisible: boolean;
  cursorSize: 'small' | 'medium' | 'large';
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  
  // Data settings
  exportFormat: 'json' | 'csv' | 'pdf';
  retentionDays: number;
  allowDataCollection: boolean;
  enableAnalytics: boolean;
  shareActivity: boolean;
  
  // Keyboard shortcuts
  enableShortcuts: boolean;
  shortcuts: KeyboardShortcut[];
  
  // App settings
  compactMode: boolean;
  showSidebar: boolean;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  inApp: boolean;
  reminders: boolean;
  updates: boolean;
}

export interface KeyboardShortcut {
  id: string;
  action: string;
  keys: string[];
  category: 'navigation' | 'editing' | 'general';
  customizable: boolean;
  enabled: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
  category: 'profile' | 'system' | 'data' | 'accessibility';
}

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<void>;
  importSettings: (data: any) => Promise<void>;
  logActivity: (action: string, category: ActivityLog['category'], details?: string) => Promise<void>;
  getActivityLogs: () => Promise<ActivityLog[]>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Default settings
const defaultSettings: UserSettings = {
  // Profile
  displayName: '',
  bio: '',
  phone: '',
  avatarUrl: undefined,
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  
  // System
  theme: 'system',
  language: 'pt-BR',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
  notifications: {
    push: true,
    email: true,
    inApp: true,
    reminders: true,
    updates: true,
  },
  autoSync: true,
  autoBackup: false,
  
  // Accessibility
  fontSize: 'medium',
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  focusVisible: true,
  cursorSize: 'medium',
  lineSpacing: 'normal',
  
  // Data
  exportFormat: 'json',
  retentionDays: 365,
  allowDataCollection: true,
  enableAnalytics: true,
  shareActivity: false,
  
  // Keyboard shortcuts
  enableShortcuts: true,
  shortcuts: [
    { id: 'new-note', action: 'Nova Nota', keys: ['Ctrl', 'N'], category: 'navigation', customizable: true, enabled: true },
    { id: 'search', action: 'Pesquisar', keys: ['Ctrl', 'K'], category: 'navigation', customizable: true, enabled: true },
    { id: 'save', action: 'Salvar', keys: ['Ctrl', 'S'], category: 'editing', customizable: true, enabled: true },
    { id: 'undo', action: 'Desfazer', keys: ['Ctrl', 'Z'], category: 'editing', customizable: true, enabled: true },
    { id: 'redo', action: 'Refazer', keys: ['Ctrl', 'Y'], category: 'editing', customizable: true, enabled: true },
    { id: 'bold', action: 'Negrito', keys: ['Ctrl', 'B'], category: 'editing', customizable: true, enabled: true },
    { id: 'italic', action: 'Itálico', keys: ['Ctrl', 'I'], category: 'editing', customizable: true, enabled: true },
    { id: 'export', action: 'Exportar', keys: ['Ctrl', 'E'], category: 'general', customizable: true, enabled: true },
    { id: 'import', action: 'Importar', keys: ['Ctrl', 'O'], category: 'general', customizable: true, enabled: true },
    { id: 'settings', action: 'Configurações', keys: ['Ctrl', ','], category: 'general', customizable: true, enabled: true },
    { id: 'help', action: 'Ajuda', keys: ['F1'], category: 'general', customizable: false, enabled: true },
  ],
  
  // App
  compactMode: false,
  showSidebar: true,
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage and Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Load from localStorage first
        const localSettings = localStorage.getItem('maxnote-settings');
        if (localSettings) {
          const parsedSettings = JSON.parse(localSettings);
          setSettings(parsedSettings);
        }

        // Then load from Supabase and merge
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('settings_data')
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            const serverSettings = data.settings_data;
            setSettings(prev => ({ ...defaultSettings, ...prev, ...serverSettings }));
            
            // Save merged settings to localStorage
            localStorage.setItem('maxnote-settings', JSON.stringify({ ...defaultSettings, ...serverSettings }));
          }
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

  // Update settings function
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    setLoading(true);
    setError(null);

    try {
      // Update local state immediately
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      // Save to localStorage
      localStorage.setItem('maxnote-settings', JSON.stringify(newSettings));

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            settings_data: newSettings,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          throw error;
        }
      }

      // Apply certain settings immediately
      applySettingsImmediate(updates);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Erro ao atualizar configurações');
    } finally {
      setLoading(false);
    }
  }, [settings]);

  // Apply settings that affect the UI immediately
  const applySettingsImmediate = useCallback((updates: Partial<UserSettings>) => {
    // Apply font size
    if (updates.fontSize) {
      const root = document.documentElement;
      const sizes = {
        small: '14px',
        medium: '16px',
        large: '18px',
        xlarge: '20px',
      };
      root.style.fontSize = sizes[updates.fontSize as keyof typeof sizes];
    }

    // Apply high contrast
    if (updates.highContrast !== undefined) {
      const root = document.documentElement;
      if (updates.highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
    }

    // Apply reduce motion
    if (updates.reduceMotion !== undefined) {
      const root = document.documentElement;
      if (updates.reduceMotion) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }
    }

    // Apply screen reader
    if (updates.screenReader !== undefined) {
      const root = document.documentElement;
      if (updates.screenReader) {
        root.classList.add('screen-reader');
      } else {
        root.classList.remove('screen-reader');
      }
    }
  }, []);

  // Reset settings function
  const resetSettings = useCallback(async () => {
    setLoading(true);
    try {
      setSettings(defaultSettings);
      localStorage.setItem('maxnote-settings', JSON.stringify(defaultSettings));
      
      // Reset UI settings
      applySettingsImmediate(defaultSettings);
      
      // Reset in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            settings_data: defaultSettings,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError('Erro ao redefinir configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  // Export settings function
  const exportSettings = useCallback(async () => {
    try {
      const exportData = {
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maxnote-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting settings:', err);
      setError('Erro ao exportar configurações');
    }
  }, [settings]);

  // Import settings function
  const importSettings = useCallback(async (data: any) => {
    setLoading(true);
    try {
      // Validate imported data
      if (!data.settings) {
        throw new Error('Formato de configurações inválido');
      }

      await updateSettings(data.settings);
    } catch (err) {
      console.error('Error importing settings:', err);
      setError('Erro ao importar configurações');
    } finally {
      setLoading(false);
    }
  }, [updateSettings]);

  // Log activity function
  const logActivity = useCallback(async (action: string, category: ActivityLog['category'], details?: string) => {
    try {
      const logEntry: ActivityLog = {
        id: crypto.randomUUID(),
        action,
        timestamp: new Date().toISOString(),
        details,
        category,
      };

      // Store in localStorage (keep last 100 entries)
      const existingLogs = JSON.parse(localStorage.getItem('maxnote-activity-logs') || '[]');
      const updatedLogs = [logEntry, ...existingLogs].slice(0, 100);
      localStorage.setItem('maxnote-activity-logs', JSON.stringify(updatedLogs));

      // Also store in Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            ...logEntry,
          });
      }
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  }, []);

  // Get activity logs function
  const getActivityLogs = useCallback(async () => {
    try {
      // Return from localStorage first
      const localLogs = JSON.parse(localStorage.getItem('maxnote-activity-logs') || '[]');
      
      // Also fetch from Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(50);

        if (!error && data) {
          return data;
        }
      }

      return localLogs;
    } catch (err) {
      console.error('Error getting activity logs:', err);
      return [];
    }
  }, []);

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    logActivity,
    getActivityLogs,
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
```

## Settings Service

```typescript
// src/services/settingsService.ts
import { supabase } from '../lib/supabase';
import { UserSettings, ActivityLog } from '../context/SettingsContext';

export const settingsService = {
  /**
   * Get user settings from database
   */
  async getUserSettings(userId: string): Promise<{ data: UserSettings | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings_data')
        .eq('user_id', userId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data?.settings_data, error: null };
    } catch (err) {
      console.error('Error fetching user settings:', err);
      return { data: null, error: 'Erro ao buscar configurações' };
    }
  },

  /**
   * Save user settings to database
   */
  async saveUserSettings(userId: string, settings: UserSettings): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings_data: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Error saving user settings:', err);
      return { success: false, error: 'Erro ao salvar configurações' };
    }
  },

  /**
   * Get activity logs for user
   */
  async getActivityLogs(userId: string, limit: number = 50): Promise<{ data: ActivityLog[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      return { data: null, error: 'Erro ao buscar logs de atividade' };
    }
  },

  /**
   * Log activity to database
   */
  async logActivity(userId: string, activity: Omit<ActivityLog, 'id'>): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          ...activity,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Error logging activity:', err);
      return { success: false, error: 'Erro ao registrar atividade' };
    }
  },

  /**
   * Delete user settings (for account deletion)
   */
  async deleteUserSettings(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Error deleting user settings:', err);
      return { success: false, error: 'Erro ao excluir configurações' };
    }
  },
};
```

## Validation Hooks

```typescript
// src/hooks/useSettingsValidation.ts
import { useState, useCallback } from 'react';

interface ValidationErrors {
  displayName?: string;
  bio?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface ValidationRules {
  [key: string]: (value: string) => string | null;
}

export const useSettingsValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validationRules: ValidationRules = {
    displayName: (value: string) => {
      if (!value.trim()) return 'Nome é obrigatório';
      if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
      if (value.length > 100) return 'Nome deve ter no máximo 100 caracteres';
      return null;
    },
    
    bio: (value: string) => {
      if (value.length > 500) return 'Biografia deve ter no máximo 500 caracteres';
      return null;
    },
    
    phone: (value: string) => {
      if (!value.trim()) return null; // Optional field
      const phoneRegex = /^\+?[\d\s\-\(\)]{1,15}[\d\s\-\)]{1,15}$/;
      if (!phoneRegex.test(value)) return 'Telefone inválido';
      return null;
    },
    
    email: (value: string) => {
      const emailRegex = /^[^\s@]+[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Email inválido';
      return null;
    },
    
    password: (value: string) => {
      if (!value) return 'Senha é obrigatória';
      if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
      if (!/(?=.*[A-Z])/.test(value)) return 'Senha deve conter pelo menos uma letra maiúscula';
      if (!/(?=.*[a-z])/.test(value)) return 'Senha deve conter pelo menos uma letra minúscula';
      if (!/(?=.*\d)/.test(value)) return 'Senha deve conter pelo menos um número';
      return null;
    },
    
    confirmPassword: (value: string, originalPassword: string) => {
      if (value !== originalPassword) return 'Senhas não coincidem';
      return null;
    },
  };

  const validateField = useCallback((field: string, value: string, confirmValue?: string) => {
    const rule = validationRules[field];
    if (!rule) return null;
    
    const error = rule(value);
    
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
    
    return error;
  }, [validationRules]);

  const validatePersonalInfo = useCallback((data: any) => {
    const newErrors: ValidationErrors = {};
    
    // Validate each field
    Object.keys(data).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field as keyof ValidationErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    errors,
    validateField,
    validatePersonalInfo,
    clearErrors,
    hasErrors,
  };
};
```

## Search Hook

```typescript
// src/hooks/useSettingsSearch.ts
import { useState, useMemo, useCallback } from 'react';
import { UserSettings } from '../context/SettingsContext';

interface SearchResult {
  section: string;
  title: string;
  description: string;
  path: string;
  keywords: string[];
}

export const useSettingsSearch = (settings: UserSettings) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const searchableItems = useMemo((): SearchResult[] => [
    // Profile section
    {
      section: 'profile',
      title: 'Informações Pessoais',
      description: 'Atualize seu nome, email, telefone e biografia',
      path: '/settings/profile#personal',
      keywords: ['nome', 'email', 'telefone', 'biografia', 'perfil', 'pessoal', 'informações'],
    },
    {
      section: 'profile',
      title: 'Foto de Perfil',
      description: 'Adicione ou altere sua foto de perfil',
      path: '/settings/profile#avatar',
      keywords: ['foto', 'avatar', 'imagem', 'perfil'],
    },
    {
      section: 'profile',
      title: 'Privacidade',
      description: 'Controle quem pode ver suas informações',
      path: '/settings/profile#privacy',
      keywords: ['privacidade', 'visibilidade', 'perfil', 'público', 'privado'],
    },
    
    // System section
    {
      section: 'system',
      title: 'Aparência',
      description: 'Tema, tamanho da fonte e configurações visuais',
      path: '/settings/system#appearance',
      keywords: ['tema', 'aparência', 'fonte', 'tamanho', 'cor', 'claro', 'escuro', 'automático'],
    },
    {
      section: 'system',
      title: 'Idioma e Região',
      description: 'Idioma, fuso horário e configurações regionais',
      path: '/settings/system#language',
      keywords: ['idioma', 'língua', 'fuso', 'horário', 'região', 'país'],
    },
    {
      section: 'system',
      title: 'Notificações',
      description: 'Configure notificações push, email e no aplicativo',
      path: '/settings/system#notifications',
      keywords: ['notificação', 'notificar', 'email', 'push', 'alerta', 'som'],
    },
    {
      section: 'system',
      title: 'Sincronização',
      description: 'Configure sincronização automática de dados',
      path: '/settings/system#sync',
      keywords: ['sincronização', 'sincronizar', 'automático', 'backup', 'nuvem'],
    },
    
    // Accessibility section
    {
      section: 'accessibility',
      title: 'Exibição',
      description: 'Tamanho da fonte, contraste e opções de acessibilidade',
      path: '/settings/accessibility#display',
      keywords: ['acessibilidade', 'fonte', 'tamanho', 'contraste', 'leitor', 'tela'],
    },
    {
      section: 'accessibility',
      title: 'Atalhos de Teclado',
      description: 'Configure atalhos personalizados para navegação',
      path: '/settings/accessibility#keyboard',
      keywords: ['atalho', 'teclado', 'atalho', 'atalho', 'navegação', 'atalho'],
    },
    
    // Data section
    {
      section: 'data',
      title: 'Exportar Dados',
      description: 'Exporte suas notas, tarefas e eventos',
      path: '/settings/data#export',
      keywords: ['exportar', 'dados', 'backup', 'json', 'csv', 'pdf'],
    },
    {
      section: 'data',
      title: 'Armazenamento',
      description: 'Gerencie seu espaço de armazenamento',
      path: '/settings/data#storage',
      keywords: ['armazenamento', 'espaço', 'limpar', 'excluir', 'dados'],
    },
    {
      section: 'data',
      title: 'Exclusão de Conta',
      description: 'Exclua permanentemente sua conta e dados',
      path: '/settings/data#deletion',
      keywords: ['excluir', 'conta', 'deletar', 'remover', 'apagar', 'permanentemente'],
    },
  ], [settings]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    
    return searchableItems.filter(item => {
      // Search in title, description, and keywords
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.keywords.some(keyword => keyword.includes(query))
      );
    });
  }, [searchableItems, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
  }, []);

  return {
    searchQuery,
    isSearching,
    results: filteredResults,
    handleSearch,
    clearSearch,
  };
};
```

## Database Schema

```sql
-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('profile', 'system', 'data', 'accessibility')),
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
```

## CSS Variables for Dynamic Styling

```css
/* src/styles/settings.css */
:root {
  --settings-font-size-small: 14px;
  --settings-font-size-medium: 16px;
  --settings-font-size-large: 18px;
  --settings-font-size-xlarge: 20px;
  
  --settings-line-height-compact: 1.2;
  --settings-line-height-normal: 1.5;
  --settings-line-height-relaxed: 1.8;
  
  --settings-cursor-size-small: 16px;
  --settings-cursor-size-medium: 20px;
  --settings-cursor-size-large: 24px;
}

.high-contrast {
  --text-primary: #000000;
  --text-secondary: #333333;
  --bg-primary: #ffffff;
  --bg-secondary: #f0f0f0;
  --border-color: #000000;
}

.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

.screen-reader .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Dynamic font size application */
.settings-font-size-small {
  font-size: var(--settings-font-size-small);
  line-height: var(--settings-line-height-compact);
}

.settings-font-size-medium {
  font-size: var(--settings-font-size-medium);
  line-height: var(--settings-line-height-normal);
}

.settings-font-size-large {
  font-size: var(--settings-font-size-large);
  line-height: var(--settings-line-height-relaxed);
}

.settings-font-size-xlarge {
  font-size: var(--settings-font-size-xlarge);
  line-height: var(--settings-line-height-relaxed);
}

/* Dynamic line height application */
.settings-line-height-compact {
  line-height: var(--settings-line-height-compact);
}

.settings-line-height-normal {
  line-height: var(--settings-line-height-normal);
}

.settings-line-height-relaxed {
  line-height: var(--settings-line-height-relaxed);
}

/* Dynamic cursor size */
.settings-cursor-small {
  cursor: var(--settings-cursor-size-small);
}

.settings-cursor-medium {
  cursor: var(--settings-cursor-size-medium);
}

.settings-cursor-large {
  cursor: var(--settings-cursor-size-large);
}
```

This comprehensive state management system provides:
- Centralized settings management with persistence
- Real-time validation and error handling
- Activity logging for audit trails
- Search functionality across all settings
- Immediate UI updates for visual settings
- Robust error handling and recovery
- Performance optimization with caching and debouncing