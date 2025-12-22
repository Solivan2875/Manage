// Mock do localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock do import.meta.env
Object.defineProperty(global, 'import', {
    value: {
        meta: {
            env: {
                VITE_SUPABASE_URL: 'https://test.supabase.co',
                VITE_SUPABASE_ANON_KEY: 'test-key',
                MODE: 'test',
                DEV: false,
                PROD: false,
                SSR: false
            }
        }
    },
    writable: true,
});

// Mock do Notification API
const mockNotification = {
    requestPermission: jest.fn().mockResolvedValue('granted'),
    permission: 'default',
};

Object.defineProperty(window, 'Notification', {
    value: mockNotification,
    writable: true,
});

// Mock do Web Audio API
const mockAudioContext = {
    createOscillator: jest.fn(() => ({
        connect: jest.fn(),
        frequency: { value: 0 },
        type: 'sine',
        start: jest.fn(),
        stop: jest.fn(),
    })),
    createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: {
            setValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn(),
        },
    })),
    destination: {},
    currentTime: 0,
};

Object.defineProperty(window, 'AudioContext', {
    value: jest.fn(() => mockAudioContext),
    writable: true,
});

// Mock de ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock de IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock de requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock de Notification API para testes
global.Notification = {
    requestPermission: jest.fn().mockResolvedValue('granted'),
    permission: 'default',
};

// Mock de crypto.randomUUID
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
    },
    writable: true,
});

// Configuração de datas consistentes para testes
const mockDate = new Date('2025-01-15T10:00:00.000Z');
const OriginalDate = Date;
Object.defineProperty(global, 'Date', {
    value: class MockDate extends OriginalDate {
        constructor(...args) {
            if (args.length === 0) {
                return mockDate;
            }
            return new OriginalDate(...args);
        }
        static now() {
            return mockDate.getTime();
        }
    },
    writable: true,
});