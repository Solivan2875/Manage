# MaxNote Settings Component Designs

## Overview

This document provides detailed designs and implementation specifications for all Settings page components, following the architecture outlined in the main Settings architecture document.

## Table of Contents

1. [Main Settings Components](#main-settings-components)
2. [Profile Management Components](#profile-management-components)
3. [System Settings Components](#system-settings-components)
4. [Data Management Components](#data-management-components)
5. [Accessibility Components](#accessibility-components)
6. [About Components](#about-components)
7. [Shared Components](#shared-components)
8. [Integration Examples](#integration-examples)

## Main Settings Components

### SettingsPage Component

```typescript
// src/pages/Settings.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SettingsLayout } from '../components/settings/SettingsLayout';
import { ProfileTab } from '../components/settings/tabs/ProfileTab';
import { SystemTab } from '../components/settings/tabs/SystemTab';
import { DataTab } from '../components/settings/tabs/DataTab';
import { AccessibilityTab } from '../components/settings/tabs/AccessibilityTab';
import { AboutTab } from '../components/settings/tabs/AboutTab';
import { useSettings } from '../context/SettingsContext';
import { cn } from '../lib/utils';

const SETTINGS_TABS = [
  { id: 'profile', label: 'Perfil', component: ProfileTab },
  { id: 'system', label: 'Sistema', component: SystemTab },
  { id: 'data', label: 'Dados', component: DataTab },
  { id: 'accessibility', label: 'Acessibilidade', component: AccessibilityTab },
  { id: 'about', label: 'Sobre', component: AboutTab },
];

export const SettingsPage: React.FC = () => {
  const { tab = 'profile' } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { settings, loading } = useSettings();
  
  const [activeTab, setActiveTab] = useState(tab);
  const currentTab = SETTINGS_TABS.find(t => t.id === activeTab);
  const CurrentTabComponent = currentTab?.component;

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    navigate(`/settings/${newTab}`, { replace: true });
  };

  // Sync URL state with component state
  useEffect(() => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!currentTab || !CurrentTabComponent) {
    navigate('/settings/profile', { replace: true });
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie suas preferências e configurações do MaxNote
        </p>
      </div>

      <SettingsLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={SETTINGS_TABS}
      >
        <CurrentTabComponent />
      </SettingsLayout>
    </div>
  );
};
```

### SettingsLayout Component

```typescript
// src/components/settings/SettingsLayout.tsx
import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, Home, User, Settings as SettingsIcon, Database, Accessibility, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TabItem {
  id: string;
  label: string;
  component: React.ComponentType;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SettingsLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: TabItem[];
}

const getTabIcon = (tabId: string) => {
  switch (tabId) {
    case 'profile':
      return User;
    case 'system':
      return SettingsIcon;
    case 'data':
      return Database;
    case 'accessibility':
      return Accessibility;
    case 'about':
      return Info;
    default:
      return SettingsIcon;
  }
};

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  tabs
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 flex-shrink-0">
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = getTabIcon(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  activeTab === tab.id
                    ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-l-4 border-teal-600"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Breadcrumb */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Home className="w-4 h-4" />
            <span>Configurações</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">
              {tabs.find(t => t.id === activeTab)?.label}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </main>
    </div>
  );
};
```

## Profile Management Components

### ProfileTab Component

```typescript
// src/components/settings/tabs/ProfileTab.tsx
import { useState } from 'react';
import { PersonalInfoForm } from '../profile/PersonalInfoForm';
import { AvatarUpload } from '../profile/AvatarUpload';
import { ActivityHistory } from '../profile/ActivityHistory';
import { PrivacySettings } from '../profile/PrivacySettings';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';

export const ProfileTab: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeSection, setActiveSection] = useState('personal');

  const sections = [
    { id: 'personal', label: 'Informações Pessoais', component: PersonalInfoForm },
    { id: 'avatar', label: 'Foto de Perfil', component: AvatarUpload },
    { id: 'activity', label: 'Histórico de Atividades', component: ActivityHistory },
    { id: 'privacy', label: 'Privacidade', component: PrivacySettings },
  ];

  const currentSection = sections.find(s => s.id === activeSection);
  const CurrentSectionComponent = currentSection?.component;

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* Section Navigation */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Section */}
      <div className="p-6">
        {CurrentSectionComponent && (
          <CurrentSectionComponent 
            user={user}
            settings={settings}
            onUpdate={updateSettings}
          />
        )}
      </div>
    </div>
  );
};
```

### PersonalInfoForm Component

```typescript
// src/components/settings/profile/PersonalInfoForm.tsx
import { useState, useEffect } from 'react';
import { Save, Check, X, Loader2 } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { UserSettings } from '../../../context/SettingsContext';
import { SettingsInput } from '../shared/SettingsInput';
import { SettingsButton } from '../shared/SettingsButton';
import { useSettingsValidation } from '../../../hooks/useSettingsValidation';
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
  
  const { validatePersonalInfo, errors } = useSettingsValidation();

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
    if (!validatePersonalInfo(formData)) {
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
                disabled={!!errors.displayName || !!errors.phone}
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
          error={errors.displayName}
          placeholder="Seu nome completo"
        />

        <SettingsInput
          label="Email"
          value={formData.email}
          onChange={() => {}} // Email is read-only
          disabled={true}
          type="email"
          description="Email não pode ser alterado aqui"
        />

        <SettingsInput
          label="Telefone"
          value={formData.phone}
          onChange={(value) => handleInputChange('phone', value)}
          disabled={!isEditing}
          error={errors.phone}
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
```

### AvatarUpload Component

```typescript
// src/components/settings/profile/AvatarUpload.tsx
import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Camera, X, Loader2, User } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { storageService } from '../../../services/supabaseService';
import { SettingsButton } from '../shared/SettingsButton';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { cn } from '../../../lib/utils';

interface AvatarUploadProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAvatar = user?.avatarUrl || settings.avatarUrl;

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const result = await storageService.uploadAvatar(user.id, file);
      
      if (result.error) {
        alert(result.error);
      } else if (result.url) {
        await onUpdate({ avatarUrl: result.url });
        setPreviewUrl(null);
      }
    } catch (error) {
      alert('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      const result = await storageService.deleteAvatar(user.id);
      
      if (result.error) {
        alert(result.error);
      } else {
        await onUpdate({ avatarUrl: null });
      }
    } catch (error) {
      alert('Erro ao remover imagem');
    } finally {
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Foto de Perfil
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Adicione uma foto para personalizar seu perfil
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* Avatar Display */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {(previewUrl || currentAvatar) ? (
              <img
                src={previewUrl || currentAvatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload"
            />
            
            <label
              htmlFor="avatar-upload"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium",
                "bg-teal-600 text-white rounded-lg hover:bg-teal-700",
                "cursor-pointer transition-colors",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Enviando...' : 'Enviar Foto'}
            </label>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formatos: JPG, PNG, GIF, WebP<br />
            Tamanho máximo: 5MB
          </p>

          {currentAvatar && (
            <SettingsButton
              variant="secondary"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
              Remover Foto
            </SettingsButton>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        title="Remover Foto de Perfil"
        description="Tem certeza que deseja remover sua foto de perfil? Esta ação não pode ser desfeita."
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={handleRemoveAvatar}
        onCancel={() => setShowConfirmDialog(false)}
        variant="danger"
      />
    </div>
  );
};
```

### ActivityHistory Component

```typescript
// src/components/settings/profile/ActivityHistory.tsx
import { useState, useEffect } from 'react';
import { Clock, FileText, Calendar, CheckCircle2, Settings, Filter, Download } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsButton } from '../shared/SettingsButton';
import { SettingsSelect } from '../shared/SettingsSelect';

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
  category: 'profile' | 'system' | 'data' | 'accessibility';
  icon?: React.ComponentType<{ className?: string }>;
}

interface ActivityHistoryProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

const getActivityIcon = (category: string) => {
  switch (category) {
    case 'profile':
      return Settings;
    case 'system':
      return Calendar;
    case 'data':
      return FileText;
    case 'accessibility':
      return CheckCircle2;
    default:
      return Clock;
  }
};

const getActivityColor = (category: string) => {
  switch (category) {
    case 'profile':
      return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
    case 'system':
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
    case 'data':
      return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
    case 'accessibility':
      return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
  }
};

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockActivities: ActivityLog[] = [
      {
        id: '1',
        action: 'Perfil atualizado',
        timestamp: '2024-01-15T10:30:00Z',
        details: 'Nome e biografia atualizados',
        category: 'profile'
      },
      {
        id: '2',
        action: 'Tema alterado',
        timestamp: '2024-01-14T15:45:00Z',
        details: 'Mudado para tema escuro',
        category: 'system'
      },
      {
        id: '3',
        action: 'Dados exportados',
        timestamp: '2024-01-13T09:15:00Z',
        details: 'Exportado como JSON',
        category: 'data'
      },
      {
        id: '4',
        action: 'Configurações de acessibilidade',
        timestamp: '2024-01-12T14:20:00Z',
        details: 'Tamanho da fonte aumentado',
        category: 'accessibility'
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.category === filter;
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const exportHistory = () => {
    // Export functionality
    const csvContent = [
      ['Data', 'Ação', 'Categoria', 'Detalhes'],
      ...filteredActivities.map(activity => [
        formatDate(activity.timestamp),
        activity.action,
        activity.category,
        activity.details || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historico-atividades.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Histórico de Atividades
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualize suas atividades recentes no MaxNote
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SettingsSelect
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Todas' },
              { value: 'profile', label: 'Perfil' },
              { value: 'system', label: 'Sistema' },
              { value: 'data', label: 'Dados' },
              { value: 'accessibility', label: 'Acessibilidade' }
            ]}
          />

          <SettingsSelect
            value={dateRange}
            onChange={setDateRange}
            options={[
              { value: '7', label: '7 dias' },
              { value: '30', label: '30 dias' },
              { value: '90', label: '90 dias' },
              { value: '365', label: '1 ano' }
            ]}
          />

          <SettingsButton onClick={exportHistory}>
            <Download className="w-4 h-4" />
            Exportar
          </SettingsButton>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <SettingsCard>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma atividade encontrada no período selecionado
            </p>
          </div>
        </SettingsCard>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => {
            const Icon = getActivityIcon(activity.category);
            const colorClass = getActivityColor(activity.category);
            
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  
                  {activity.details && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.details}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
```

### PrivacySettings Component

```typescript
// src/components/settings/profile/PrivacySettings.tsx
import { useState } from 'react';
import { Shield, Eye, EyeOff, Globe, Lock, Users } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { SettingsToggle } from '../shared/SettingsToggle';
import { SettingsSelect } from '../shared/SettingsSelect';

interface PrivacySettingsProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: settings.profileVisibility || 'public',
    showEmail: settings.showEmail ?? false,
    showPhone: settings.showPhone ?? false,
    allowDataCollection: settings.allowDataCollection ?? true,
    enableAnalytics: settings.enableAnalytics ?? true,
    shareActivity: settings.shareActivity ?? false,
  });

  const handleToggleChange = (key: string, value: boolean) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);
    onUpdate(updated);
  };

  const handleSelectChange = (key: string, value: string) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Configurações de Privacidade
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Controle quem pode ver suas informações e como seus dados são usados
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <SettingsCard>
          <SettingsSection
            title="Visibilidade do Perfil"
            description="Controle quem pode ver seu perfil"
          >
            <div className="space-y-4">
              <SettingsSelect
                label="Quem pode ver seu perfil"
                value={privacySettings.profileVisibility}
                onChange={(value) => handleSelectChange('profileVisibility', value)}
                options={[
                  { value: 'public', label: 'Público - Qualquer pessoa' },
                  { value: 'registered', label: 'Usuários Registrados' },
                  { value: 'private', label: 'Privado - Apenas eu' }
                ]}
              />

              <div className="space-y-3">
                <SettingsToggle
                  label="Mostrar email no perfil"
                  description="Seu email será visível para outros usuários"
                  checked={privacySettings.showEmail}
                  onChange={(checked) => handleToggleChange('showEmail', checked)}
                />

                <SettingsToggle
                  label="Mostrar telefone no perfil"
                  description="Seu telefone será visível para outros usuários"
                  checked={privacySettings.showPhone}
                  onChange={(checked) => handleToggleChange('showPhone', checked)}
                />
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Data Collection */}
        <SettingsCard>
          <SettingsSection
            title="Coleta de Dados"
            description="Gerencie como seus dados são coletados e usados"
          >
            <div className="space-y-3">
              <SettingsToggle
                label="Permitir coleta de dados"
                description="Ajude-nos a melhorar o MaxNote compartilhando dados de uso anônimos"
                checked={privacySettings.allowDataCollection}
                onChange={(checked) => handleToggleChange('allowDataCollection', checked)}
              />

              <SettingsToggle
                label="Habilitar analytics"
                description="Permitir análise de comportamento para melhorar a experiência"
                checked={privacySettings.enableAnalytics}
                onChange={(checked) => handleToggleChange('enableAnalytics', checked)}
              />

              <SettingsToggle
                label="Compartilhar atividades"
                description="Permitir que outras pessoas vejam suas atividades públicas"
                checked={privacySettings.shareActivity}
                onChange={(checked) => handleToggleChange('shareActivity', checked)}
              />
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Privacy Information */}
        <SettingsCard>
          <SettingsSection
            title="Informações de Privacidade"
            description="Saiba mais sobre como protegemos seus dados"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Proteção de Dados
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Seus dados são criptografados e armazenados com segurança. 
                    Nunca compartilhamos informações pessoais com terceiros sem seu consentimento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Controle Total
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Você tem controle total sobre seus dados. 
                    Pode exportá-los ou excluir sua conta a qualquer momento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Transparência
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Somos transparentes sobre como usamos seus dados. 
                    Leia nossa política de privacidade para mais detalhes.
                  </p>
                </div>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>
    </div>
  );
};
```

## System Settings Components

### SystemTab Component

```typescript
// src/components/settings/tabs/SystemTab.tsx
import { useState } from 'react';
import { AppearanceSettings } from '../system/AppearanceSettings';
import { LanguageRegionSettings } from '../system/LanguageRegionSettings';
import { NotificationSettings } from '../system/NotificationSettings';
import { DataSyncSettings } from '../system/DataSyncSettings';
import { BackupRestoreSettings } from '../system/BackupRestoreSettings';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';

export const SystemTab: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeSection, setActiveSection] = useState('appearance');

  const sections = [
    { id: 'appearance', label: 'Aparência', component: AppearanceSettings },
    { id: 'language', label: 'Idioma e Região', component: LanguageRegionSettings },
    { id: 'notifications', label: 'Notificações', component: NotificationSettings },
    { id: 'sync', label: 'Sincronização', component: DataSyncSettings },
    { id: 'backup', label: 'Backup e Restauração', component: BackupRestoreSettings },
  ];

  const currentSection = sections.find(s => s.id === activeSection);
  const CurrentSectionComponent = currentSection?.component;

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* Section Navigation */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Section */}
      <div className="p-6">
        {CurrentSectionComponent && (
          <CurrentSectionComponent 
            user={user}
            settings={settings}
            onUpdate={updateSettings}
          />
        )}
      </div>
    </div>
  );
};
```

### AppearanceSettings Component

```typescript
// src/components/settings/system/AppearanceSettings.tsx
import { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Type, Contrast, Zap } from 'lucide-react';
import { AuthUser } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { SettingsCard } from '../shared/SettingsCard';
import { SettingsSection } from '../shared/SettingsSection';
import { SettingsToggle } from '../shared/SettingsToggle';
import { SettingsSelect } from '../shared/SettingsSelect';

interface AppearanceSettingsProps {
  user: AuthUser | null;
  settings: any;
  onUpdate: (updates: any) => Promise<void>;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  user,
  settings,
  onUpdate
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [appearanceSettings, setAppearanceSettings] = useState({
    fontSize: settings.fontSize || 'medium',
    highContrast: settings.highContrast || false,
    reduceMotion: settings.reduceMotion || false,
    compactMode: settings.compactMode || false,
    showSidebar: settings.showSidebar !== false,
    customColors: settings.customColors || {},
  });

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    onUpdate({ theme: newTheme });
  };

  const handleSettingChange = (key: string, value: any) => {
    const updated = { ...appearanceSettings, [key]: value };
    setAppearanceSettings(updated);
    onUpdate(updated);
  };

  const fontSizes = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' },
  ];

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return Sun;
      case 'dark':
        return Moon;
      case 'system':
        return Monitor;
      default:
        return Monitor;
    }
  };

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      case 'system':
        return 'Automático';
      default:
        return 'Automático';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Aparência
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Personalize a aparência do MaxNote
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <SettingsCard>
          <SettingsSection
            title="Tema"
            description="Escolha o tema que prefere usar"
          >
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((themeValue) => {
                const Icon = getThemeIcon(themeValue);
                const isActive = theme === themeValue;
                
                return (
                  <button
                    key={themeValue}
                    onClick={() => handleThemeChange(themeValue)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-6 h-6 ${
                        isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {getThemeLabel(themeValue)}
                      </span>
                    </div>
                    
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Tema atual: <span className="font-medium">{getThemeLabel(theme)}</span>
              {theme === 'system' && (
                <span className="ml-1">
                  ({resolvedTheme === 'light' ? 'Claro' : 'Escuro'} detectado)
                </span>
              )}
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Typography Settings */}
        <SettingsCard>
          <SettingsSection
            title="Tipografia"
            description="Ajuste o tamanho e estilo do texto"
          >
            <div className="space-y-4">
              <SettingsSelect
                label="Tamanho da fonte"
                value={appearanceSettings.fontSize}
                onChange={(value) => handleSettingChange('fontSize', value)}
                options={fontSizes}
                description="Aumenta ou diminui o tamanho do texto em toda a aplicação"
              />

              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {fontSizes.map((size) => (
                  <div
                    key={size.value}
                    className={`text-center p-3 rounded border ${
                      appearanceSettings.fontSize === size.value
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className={`${
                      size.value === 'small' ? 'text-sm' :
                      size.value === 'large' ? 'text-lg' : 'text-base'
                    } text-gray-700 dark:text-gray-300`}>
                      Exemplo
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {size.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Visual Effects */}
        <SettingsCard>
          <SettingsSection
            title="Efeitos Visuais"
            description="Controle animações e efeitos visuais"
          >
            <div className="space-y-3">
              <SettingsToggle
                label="Alto contraste"
                description="Aumenta o contraste para melhor legibilidade"
                checked={appearanceSettings.highContrast}
                onChange={(checked) => handleSettingChange('highContrast', checked)}
              />

              <SettingsToggle
                label="Reduzir movimento"
                description="Reduz animações e efeitos de transição"
                checked={appearanceSettings.reduceMotion}
                onChange={(checked) => handleSettingChange('reduceMotion', checked)}
              />

              <SettingsToggle
                label="Modo compacto"
                description="Reduz o espaçamento entre elementos"
                checked={appearanceSettings.compactMode}
                onChange={(checked) => handleSettingChange('compactMode', checked)}
              />

              <SettingsToggle
                label="Mostrar barra lateral"
                description="Exibe ou oculta a barra lateral de navegação"
                checked={appearanceSettings.showSidebar}
                onChange={(checked) => handleSettingChange('showSidebar', checked)}
              />
            </div>
          </SettingsSection>
        </SettingsCard>

        {/* Preview */}
        <SettingsCard>
          <SettingsSection
            title="Visualização"
            description="Veja como suas configurações afetam a aparência"
          >
            <div className={`p-6 bg-gray-50 dark:bg-gray-800 rounded-lg ${
              appearanceSettings.highContrast ? 'border-2 border-gray-900 dark:border-white' : ''
            } ${appearanceSettings.compactMode ? 'space-y-2' : 'space-y-4'}`}>
              <div className={`${
                appearanceSettings.fontSize === 'small' ? 'text-sm' :
                appearanceSettings.fontSize === 'large' ? 'text-lg' : 'text-base'
              }`}>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Exemplo de Título
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Este é um exemplo de como seu texto aparecerá com as configurações atuais.
                  Você pode ver o tamanho da fonte e o contraste aplicados aqui.
                </p>
              </div>
              
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700">
                  Botão de Exemplo
                </button>
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                  Botão Secundário
                </button>
              </div>
            </div>
          </SettingsSection>
        </SettingsCard>
      </div>
    </div>
  );
};
```

## Shared Components

### SettingsCard Component

```typescript
// src/components/settings/shared/SettingsCard.tsx
import { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface SettingsCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
      "shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={cn(
        "p-6",
        !title && !description && "pt-6"
      )}>
        {children}
      </div>
    </div>
  );
};
```

### SettingsToggle Component

```typescript
// src/components/settings/shared/SettingsToggle.tsx
import { Switch } from '@headlessui/react';
import { cn } from '../../../lib/utils';

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className
}) => {
  return (
    <Switch.Group as="div" className={cn("flex items-center justify-between", className)}>
      <div className="flex-1">
        <Switch.Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Switch.Label>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      
      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked
            ? "bg-teal-600 hover:bg-teal-700"
            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </Switch>
    </Switch.Group>
  );
};
```

### SettingsSelect Component

```typescript
// src/components/settings/shared/SettingsSelect.tsx
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SettingsSelectProps {
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({
  label,
  description,
  value,
  options,
  onChange,
  disabled = false,
  className
}) => {
  const selectedOption = options.find(option => option.value === value);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={cn("space-y-1", className)}>
        <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Listbox.Label>
        
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}

        <div className="relative">
          <Listbox.Button
            className={cn(
              "relative w-full cursor-default rounded-lg border border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left",
              "text-gray-900 dark:text-white shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <span className="block truncate">
              {selectedOption?.label || 'Selecione uma opção'}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    cn(
                      "relative cursor-default select-none py-2 pl-3 pr-9",
                      active
                        ? "bg-teal-100 dark:bg-teal-900/30 text-teal-900 dark:text-teal-400"
                        : "text-gray-900 dark:text-white"
                    )
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={cn(
                          "block truncate",
                          selected ? "font-medium" : "font-normal"
                        )}
                      >
                        {option.label}
                      </span>

                      {selected && (
                        <span
                          className={cn(
                            "absolute inset-y-0 right-0 flex items-center pr-4",
                            "text-teal-600 dark:text-teal-400"
                          )}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </div>
    </Listbox>
  );
};
```

### SettingsInput Component

```typescript
// src/components/settings/shared/SettingsInput.tsx
import { cn } from '../../../lib/utils';

interface SettingsInputProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'tel';
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  maxLength?: number;
}

export const SettingsInput: React.FC<SettingsInputProps> = ({
  label,
  description,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  error,
  className,
  maxLength
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
          "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
          "placeholder-gray-500 dark:placeholder-gray-400",
          "focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500"
        )}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {maxLength && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
};
```

### SettingsButton Component

```typescript
// src/components/settings/shared/SettingsButton.tsx
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SettingsButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  loading = false,
  disabled = false,
  className,
  type = 'button'
}) => {
  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500",
    secondary: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {children}
    </button>
  );
};
```

### ConfirmDialog Component

```typescript
// src/components/settings/shared/ConfirmDialog.tsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { SettingsButton } from './SettingsButton';
import { cn } from '../../../lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  const isDanger = variant === 'danger';

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className={cn(
                      "text-lg font-medium leading-6",
                      isDanger
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {title}
                  </Dialog.Title>
                  
                  <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {description}
                </Dialog.Description>

                <div className="flex justify-end gap-3">
                  <SettingsButton
                    variant="secondary"
                    onClick={onCancel}
                  >
                    {cancelText}
                  </SettingsButton>
                  
                  <SettingsButton
                    variant={isDanger ? 'danger' : 'primary'}
                    onClick={onConfirm}
                  >
                    {confirmText}
                  </SettingsButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
```

## Integration Examples

### App.tsx Integration

```typescript
// src/App.tsx - Add settings route
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TagProvider } from './context/TagContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { SettingsPage } from './pages/Settings';
// ... other imports

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TagProvider>
          <SettingsProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/jots" replace />} />
                          <Route path="/jots" element={<Jots />} />
                          <Route path="/notes" element={<Notes />} />
                          <Route path="/notes/:id" element={<NoteEditor />} />
                          <Route path="/tasks" element={<Tasks />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
                          <Route path="/settings/:tab" element={<SettingsPage />} />
                        </Routes>
                      </Layout>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </SettingsProvider>
        </TagProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### Sidebar Integration

```typescript
// src/components/Sidebar.tsx - Add settings navigation
// Update the settings item at the bottom
<div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
    <SidebarItem to="/settings/profile" icon={Settings} label="Configurações" />
</div>
```

### Layout Integration

```typescript
// src/components/Layout.tsx - Update user menu settings button
<button
    onClick={() => {
        setShowUserMenu(false);
        navigate('/settings/profile');
    }}
    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
>
    <Settings className="w-4 h-4" />
    <span>Configurações</span>
</button>
```

This comprehensive component design provides a solid foundation for implementing the Settings page in MaxNote. Each component follows the established patterns and integrates seamlessly with the existing architecture while providing a professional and user-friendly interface.