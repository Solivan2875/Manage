import { useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationSettings, Event } from '../../types/calendar';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [settings, setSettings] = useState<NotificationSettings>({
        enabled: true,
        defaultReminder: 15,
        browserNotifications: false,
        inAppNotifications: true,
        sound: false
    });
    const [permission, setPermission] = useState<NotificationPermission>('default');

    // Check browser notification permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Request browser notification permission
    const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            setPermission('granted');
            return true;
        }

        if (Notification.permission !== 'denied') {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        }

        return false;
    }, []);

    // Create a notification
    const createNotification = useCallback((
        eventId: string,
        title: string,
        message: string,
        type: Notification['type'] = 'info',
        actionUrl?: string
    ) => {
        const notification: Notification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            eventId,
            title,
            message,
            type,
            timestamp: new Date(),
            read: false,
            actionUrl
        };

        setNotifications(prev => [notification, ...prev]);

        // Show browser notification if enabled and permission granted
        if (settings.browserNotifications && permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/vite.svg',
                tag: eventId,
                requireInteraction: true
            });
        }

        // Play sound if enabled
        if (settings.sound) {
            playNotificationSound();
        }

        return notification;
    }, [settings.browserNotifications, settings.sound, permission]);

    // Create event reminder notifications
    const createEventReminder = useCallback((event: Event, minutesBefore: number) => {
        const reminderTime = new Date(event.startDate.getTime() - minutesBefore * 60 * 1000);
        const now = new Date();

        // Only create if the reminder time is in the past or very near future
        if (reminderTime <= now) {
            const message = minutesBefore === 0
                ? `O evento "${event.title}" está começando agora`
                : `O evento "${event.title}" começará em ${minutesBefore} minutos`;

            createNotification(
                event.id,
                event.title,
                message,
                minutesBefore <= 5 ? 'warning' : 'info'
            );
        }
    }, [createNotification]);

    // Mark notification as read
    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    }, []);

    // Mark all notifications as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    }, []);

    // Remove notification
    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, []);

    // Clear all notifications
    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Get unread notifications count
    const getUnreadCount = useCallback(() => {
        return notifications.filter(notif => !notif.read).length;
    }, [notifications]);

    // Get recent notifications
    const getRecentNotifications = useCallback((limit: number = 5) => {
        return notifications
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }, [notifications]);

    // Update notification settings
    const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));

        // Save to localStorage
        try {
            const currentSettings = JSON.parse(localStorage.getItem('maxnote_notification_settings') || '{}');
            const updatedSettings = { ...currentSettings, ...newSettings };
            localStorage.setItem('maxnote_notification_settings', JSON.stringify(updatedSettings));
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    }, []);

    // Load settings from localStorage
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('maxnote_notification_settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSettings(prev => ({ ...prev, ...parsed }));
            }
        } catch (error) {
            console.error('Error loading notification settings:', error);
        }
    }, []);

    // Play notification sound (simple implementation)
    const playNotificationSound = useCallback(() => {
        try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    }, []);

    // Check for upcoming events and create reminders
    const checkUpcomingEvents = useCallback((events: Event[]) => {
        if (!settings.enabled) return;

        const now = new Date();
        const upcomingEvents = events.filter(event => {
            const reminderTime = new Date(event.startDate.getTime() - settings.defaultReminder * 60 * 1000);
            return reminderTime <= now && reminderTime > new Date(now.getTime() - 60 * 1000); // Within last minute
        });

        upcomingEvents.forEach(event => {
            // Check if we already created a notification for this event
            const existingNotif = notifications.find(
                notif => notif.eventId === event.id && !notif.read
            );

            if (!existingNotif) {
                createEventReminder(event, settings.defaultReminder);
            }
        });
    }, [settings.enabled, settings.defaultReminder, notifications, createEventReminder]);

    return {
        // State
        notifications,
        settings,
        permission,
        unreadCount: getUnreadCount(),

        // Actions
        createNotification,
        createEventReminder,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,

        // Settings
        updateSettings,
        requestBrowserPermission,

        // Utilities
        getRecentNotifications,
        checkUpcomingEvents,
        playNotificationSound
    };
};