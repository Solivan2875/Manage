import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { User, Palette, Database, Eye, Info } from 'lucide-react';

const SETTINGS_TABS = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'system', label: 'Sistema', icon: Palette },
    { id: 'data', label: 'Dados', icon: Database },
    { id: 'accessibility', label: 'Acessibilidade', icon: Eye },
    { id: 'about', label: 'Sobre', icon: Info },
];

export const SettingsPage: React.FC = () => {
    const { tab = 'profile' } = useParams<{ tab: string }>();
    const navigate = useNavigate();
    const { settings, loading } = useSettings();

    const [activeTab, setActiveTab] = useState(tab);

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        navigate(`/settings/${newTab}`, { replace: true });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
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

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                        {SETTINGS_TABS.map((tabItem) => {
                            const Icon = tabItem.icon;
                            return (
                                <button
                                    key={tabItem.id}
                                    onClick={() => handleTabChange(tabItem.id)}
                                    className={`
                                        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                                        ${activeTab === tabItem.id
                                            ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tabItem.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">
                            Configurações de {SETTINGS_TABS.find(t => t.id === activeTab)?.label}
                        </p>
                        <p className="text-sm mt-2">
                            Esta seção está em desenvolvimento
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};