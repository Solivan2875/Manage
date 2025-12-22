import { useState } from 'react';
import { SettingsCard } from '../shared';
import { PersonalInfoForm, AvatarUpload, ActivityHistory, PrivacySettings as PrivacySettingsComponent } from '../profile';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';
import type { ActivityLog } from '../../../types/settings';

export const ProfileTab: React.FC = () => {
    const { user } = useAuth();
    const { settings, updateSettings } = useSettings();
    const [activeSection, setActiveSection] = useState('personal');

    // Mock activity data for demonstration
    const mockActivities: ActivityLog[] = [
        {
            id: '1',
            action: 'profile.updated',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            details: 'Perfil atualizado',
            category: 'profile'
        },
        {
            id: '2',
            action: 'profile.avatar_changed',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            details: 'Avatar alterado',
            category: 'profile'
        },
        {
            id: '3',
            action: 'system.theme_changed',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            details: 'Tema alterado para escuro',
            category: 'system'
        },
    ];

    const sections = [
        { id: 'personal', label: 'Informações Pessoais', component: PersonalInfoForm },
        { id: 'avatar', label: 'Avatar', component: AvatarUpload },
        { id: 'privacy', label: 'Privacidade', component: PrivacySettingsComponent },
        { id: 'activity', label: 'Histórico', component: ActivityHistory },
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
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === section.id
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
                        currentAvatar={settings.avatarUrl}
                        activities={mockActivities}
                        privacySettings={{
                            profileVisibility: 'public',
                            showEmail: false,
                            showPhone: false,
                            allowDataCollection: true,
                            enableAnalytics: false,
                            shareActivity: false,
                        }}
                        onExport={(filteredActivities: ActivityLog[]) => {
                            // Export functionality
                            const dataStr = JSON.stringify(filteredActivities, null, 2);
                            const dataBlob = new Blob([dataStr], { type: 'application/json' });
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `atividades-${new Date().toISOString().split('T')[0]}.json`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                        }}
                    />
                )}
            </div>
        </div>
    );
};