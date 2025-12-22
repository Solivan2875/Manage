import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock de matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock de ResizeObserver
Object.defineProperty(globalThis, 'ResizeObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    })),
});

// Mock de IntersectionObserver
Object.defineProperty(globalThis, 'IntersectionObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    })),
});

// Mock de requestAnimationFrame
Object.defineProperty(globalThis, 'requestAnimationFrame', {
    writable: true,
    value: vi.fn().mockImplementation(cb => setTimeout(cb, 0)),
});

Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    writable: true,
    value: vi.fn().mockImplementation(id => clearTimeout(id)),
});

// Mock de Notification API
Object.defineProperty(globalThis, 'Notification', {
    writable: true,
    value: {
        requestPermission: vi.fn().mockResolvedValue('granted'),
        permission: 'granted',
    } as any,
});

// Mock de crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
    value: {
        randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
    },
});

// Configuração de datas consistentes para testes
const mockDate = new Date('2025-01-15T10:00:00.000Z');
vi.setSystemTime(mockDate);