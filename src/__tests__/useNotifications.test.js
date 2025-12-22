const { renderHook, act, waitFor } = require('@testing-library/react');
const { describe, it, expect, beforeEach } = require('@jest/globals');

// Mock do Notification API
global.Notification = {
    requestPermission: jest.fn().mockResolvedValue('granted'),
    permission: 'default',
};

// Mock do dateHelpers
jest.mock('../components/calendar/utils/dateHelpers', () => ({
    generateId: jest.fn(() => 'test-id'),
    formatDate: jest.fn((date) => date.toISOString()),
    parseDate: jest.fn((dateStr) => new Date(dateStr)),
    isSameDay: jest.fn((date1, date2) => date1.toDateString() === date2.toDateString()),
}));

// Mock do storageHelpers
jest.mock('../components/calendar/utils/storageHelpers', () => ({
    storageService: {
        loadNotificationSettings: jest.fn(),
        saveNotificationSettings: jest.fn(),
    },
}));

const useNotifications = require('../hooks/calendar/useNotifications').useNotifications;

describe('useNotifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.Notification.permission = 'default';
    });

    it('deve inicializar com configurações padrão', () => {
        const { result } = renderHook(() => useNotifications());

        expect(result.current.settings).toHaveProperty('enabled');
        expect(result.current.settings).toHaveProperty('defaultReminder');
        expect(result.current.settings).toHaveProperty('browserNotifications');
        expect(result.current.settings).toHaveProperty('inAppNotifications');
        expect(result.current.settings).toHaveProperty('sound');
        expect(result.current.notifications).toHaveLength(0); // inicializa vazio
    });

    it('deve solicitar permissão de notificação', async () => {
        global.Notification.requestPermission.mockResolvedValue('granted');

        const { result } = renderHook(() => useNotifications());

        await act(async () => {
            await result.current.requestBrowserPermission();
        });

        expect(global.Notification.requestPermission).toHaveBeenCalled();
        expect(result.current.permission).toBe('granted');
    });

    it('deve lidar com permissão negada', async () => {
        global.Notification.requestPermission.mockResolvedValue('denied');

        const { result } = renderHook(() => useNotifications());

        await act(async () => {
            const resultPermission = await result.current.requestBrowserPermission();
            expect(resultPermission).toBe(false);
        });

        expect(result.current.permission).toBe('denied');
    });

    it('deve atualizar configurações de notificação', () => {
        const { result } = renderHook(() => useNotifications());

        const newSettings = {
            enabled: true,
            defaultReminder: 15,
            browserNotifications: false,
        };

        act(() => {
            result.current.updateSettings(newSettings);
        });

        expect(result.current.settings).toEqual(expect.objectContaining(newSettings));
    });

    it('deve criar lembrete de evento', () => {
        const { result } = renderHook(() => useNotifications());

        const event = {
            id: 'test-event',
            title: 'Test Event',
            startDate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago (to trigger reminder)
            endDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        };

        act(() => {
            result.current.createEventReminder(event, 15);
        });

        expect(result.current.notifications.length).toBeGreaterThanOrEqual(1); // possibly new reminder
    });

    it('deve remover notificação', () => {
        const { result } = renderHook(() => useNotifications());

        // Primeiro, criar uma notificação para remover
        act(() => {
            result.current.createNotification('test-event', 'Test Event', 'Test message');
        });

        const initialCount = result.current.notifications.length;
        const notificationId = result.current.notifications[0].id;

        act(() => {
            result.current.removeNotification(notificationId);
        });

        expect(result.current.notifications.length).toBe(initialCount - 1);
        expect(result.current.notifications.find(n => n.id === notificationId)).toBeUndefined();
    });

    it('deve criar notificação', () => {
        const { result } = renderHook(() => useNotifications());

        const initialCount = result.current.notifications.length;

        act(() => {
            result.current.createNotification('event-1', 'Test Event', 'Test message');
        });

        expect(result.current.notifications.length).toBe(initialCount + 1);
        expect(result.current.notifications[0].title).toBe('Test Event');
        expect(result.current.notifications[0].message).toBe('Test message');
    });

    it('deve limpar todas as notificações', () => {
        const { result } = renderHook(() => useNotifications());

        // Primeiro, criar algumas notificações
        act(() => {
            result.current.createNotification('event-1', 'Test Event 1', 'Test message 1');
            result.current.createNotification('event-2', 'Test Event 2', 'Test message 2');
        });

        expect(result.current.notifications.length).toBeGreaterThan(0);

        act(() => {
            result.current.clearAllNotifications();
        });

        expect(result.current.notifications).toHaveLength(0);
    });

    it('deve marcar notificação como lida', () => {
        const { result } = renderHook(() => useNotifications());

        // Primeiro, criar uma notificação para marcar como lida
        act(() => {
            result.current.createNotification('test-event', 'Test Event', 'Test message');
        });

        expect(result.current.notifications[0].read).toBe(false);

        const notificationId = result.current.notifications[0].id;

        act(() => {
            result.current.markAsRead(notificationId);
        });

        expect(result.current.notifications[0].read).toBe(true);
    });

    it('deve marcar todas as notificações como lidas', () => {
        const { result } = renderHook(() => useNotifications());

        // Primeiro, criar algumas notificações
        act(() => {
            result.current.createNotification('event-1', 'Test Event 1', 'Test message 1');
            result.current.createNotification('event-2', 'Test Event 2', 'Test message 2');
        });

        expect(result.current.notifications.some(n => !n.read)).toBe(true);

        act(() => {
            result.current.markAllAsRead();
        });

        expect(result.current.notifications.every(n => n.read)).toBe(true);
    });

    it('deve obter contagem de não lidas', () => {
        const { result } = renderHook(() => useNotifications());

        const unreadCount = result.current.unreadCount;
        const expectedCount = result.current.notifications.filter(n => !n.read).length;

        expect(unreadCount).toBe(expectedCount);
    });
});