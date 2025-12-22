import { useState } from 'react';
import { AppearanceSettings } from '../system/AppearanceSettings';
import { LanguageRegionSettings } from '../system/LanguageRegionSettings';
import { NotificationSettings } from '../system/NotificationSettings';
import { DataSyncSettings } from '../system/DataSyncSettings';
import { useSettings } from '../../../context/SettingsContext';

export const SystemTab: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const [activeSection, setActiveSection] = useState('appearance');

    const sections = [
        { id: 'appearance', label: 'Aparência', component: AppearanceSettings },
        { id: 'language', label: 'Idioma e Região', component: LanguageRegionSettings },
        { id: 'notifications', label: 'Notificações', component: NotificationSettings },
        { id: 'sync', label: 'Sincronização', component: DataSyncSettings },
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
                        settings={settings}
                        onUpdate={updateSettings}
                    />
                )}
            </div>
        </div>
    );
};