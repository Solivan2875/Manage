export interface UserSettings {
    // Profile settings
    displayName: string;
    bio: string;
    phone: string;
    avatarUrl?: string;

    // System settings
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: NotificationSettings;
    autoSync: boolean;
    autoBackup: boolean;

    // Accessibility settings
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;

    // Data settings
    exportFormat: 'json' | 'pdf' | 'csv';
    retentionDays: number;
}

export interface NotificationSettings {
    push: boolean;
    email: boolean;
    inApp: boolean;
    reminders: boolean;
    updates: boolean;
}

export interface ActivityLog {
    id: string;
    action: string;
    timestamp: string;
    details?: string;
    category: 'profile' | 'system' | 'data' | 'accessibility';
}

export interface StorageInfo {
    total: number;
    used: number;
    available: number;
    breakdown: {
        notes: number;
        tasks: number;
        events: number;
        jots: number;
        attachments: number;
    };
}

export interface SettingsValidationErrors {
    displayName?: string;
    phone?: string;
    email?: string;
    bio?: string;
}

export interface PrivacySettings {
    profileVisibility: 'public' | 'registered' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    allowDataCollection: boolean;
    enableAnalytics: boolean;
    shareActivity: boolean;
}

export interface LanguageRegionSettings {
    language: string;
    timezone: string;
    dateFormat: string;
    numberFormat: string;
}

export interface NotificationPreferences {
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    sound: 'default' | 'gentle' | 'chime' | 'none';
    doNotDisturb: boolean;
    scheduleStart: string;
    scheduleEnd: string;
}

export interface SyncBackupSettings {
    autoSync: boolean;
    autoBackup: boolean;
    syncInterval: number;
    backupRetention: number;
    lastSync: string;
    conflicts: number;
}

export interface AppearanceSettings {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
    compactMode: boolean;
    showSidebar: boolean;
    customColors: Record<string, string>;
}

export interface TabItem {
    id: string;
    label: string;
    component: React.ComponentType;
    icon?: React.ComponentType<{ className?: string }>;
}