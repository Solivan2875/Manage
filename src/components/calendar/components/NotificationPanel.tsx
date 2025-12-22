import { useState } from 'react';
import { Bell, X, Settings, Check, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import type { Notification, NotificationSettings } from '../../../types/calendar';

interface NotificationPanelProps {
    notifications: Notification[];
    settings: NotificationSettings;
    unreadCount: number;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onRemoveNotification: (id: string) => void;
    onClearAllNotifications: () => void;
    onUpdateSettings: (settings: Partial<NotificationSettings>) => void;
    onRequestBrowserPermission: () => Promise<boolean>;
    permission: NotificationPermission;
}

export const NotificationPanel = ({
    notifications,
    settings,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
    onRemoveNotification,
    onClearAllNotifications,
    onUpdateSettings,
    onRequestBrowserPermission,
    permission
}: NotificationPanelProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'error':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d atrás`;
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }

        if (notification.actionUrl) {
            window.open(notification.actionUrl, '_blank');
        }
    };

    const handleRequestPermission = async () => {
        const granted = await onRequestBrowserPermission();
        if (granted) {
            onUpdateSettings({ browserNotifications: true });
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Notificações"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notificações</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={onMarkAllAsRead}
                                    className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                                    title="Marcar todas como lidas"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                title="Configurações"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                title="Fechar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    {showSettings && (
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Configurações de Notificação</h4>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700 dark:text-gray-300">Notificações do navegador</label>
                                    <div className="flex items-center gap-2">
                                        {permission !== 'granted' && (
                                            <button
                                                onClick={handleRequestPermission}
                                                className="text-xs px-2 py-1 bg-teal-600 text-white rounded hover:bg-teal-700"
                                            >
                                                Solicitar
                                            </button>
                                        )}
                                        <input
                                            type="checkbox"
                                            checked={settings.browserNotifications}
                                            onChange={(e) => onUpdateSettings({ browserNotifications: e.target.checked })}
                                            disabled={permission !== 'granted'}
                                            className="rounded"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700 dark:text-gray-300">Notificações no app</label>
                                    <input
                                        type="checkbox"
                                        checked={settings.inAppNotifications}
                                        onChange={(e) => onUpdateSettings({ inAppNotifications: e.target.checked })}
                                        className="rounded"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700 dark:text-gray-300">Som</label>
                                    <input
                                        type="checkbox"
                                        checked={settings.sound}
                                        onChange={(e) => onUpdateSettings({ sound: e.target.checked })}
                                        className="rounded"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-700 dark:text-gray-300">Lembrete padrão (minutos)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="1440"
                                        value={settings.defaultReminder}
                                        onChange={(e) => onUpdateSettings({ defaultReminder: parseInt(e.target.value) || 0 })}
                                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Nenhuma notificação</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                            }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            {formatTimeAgo(notification.timestamp)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRemoveNotification(notification.id);
                                                        }}
                                                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                        title="Remover"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <button
                                onClick={onClearAllNotifications}
                                className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                                Limpar todas as notificações
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};