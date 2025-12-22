import type { User, AuthCredentials, RegisterData, StoredUser, AuthSession } from '../types/auth';

const USERS_STORAGE_KEY = 'maxnote_users';
const SESSION_STORAGE_KEY = 'maxnote_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Simple hash function for password storage
 * In production, use bcrypt or similar on the backend
 */
const hashPassword = (password: string): string => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    // Add salt and convert to string
    const salt = 'maxnote_salt_2025';
    const saltedHash = hash.toString(36) + '_' + btoa(salt + password.slice(0, 3));
    return saltedHash;
};

/**
 * Generate a unique token for session
 */
const generateToken = (): string => {
    return 'token_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Generate a unique user ID
 */
const generateUserId = (): string => {
    return 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
};

class AuthService {
    /**
     * Get all stored users
     */
    private getStoredUsers(): StoredUser[] {
        try {
            const stored = localStorage.getItem(USERS_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
        return [];
    }

    /**
     * Save users to storage
     */
    private saveUsers(users: StoredUser[]): void {
        try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    /**
     * Get current session
     */
    getSession(): AuthSession | null {
        try {
            const stored = localStorage.getItem(SESSION_STORAGE_KEY);
            if (stored) {
                const session: AuthSession = JSON.parse(stored);
                // Check if session is expired
                if (new Date(session.expiresAt) > new Date()) {
                    return session;
                } else {
                    // Clear expired session
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('Error loading session:', error);
        }
        return null;
    }

    /**
     * Save session to storage
     */
    private saveSession(session: AuthSession): void {
        try {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }

    /**
     * Clear current session
     */
    clearSession(): void {
        try {
            localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    }

    /**
     * Validate email format
     */
    validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     */
    validatePassword(password: string): { isValid: boolean; message: string } {
        if (password.length < 6) {
            return { isValid: false, message: 'A senha deve ter pelo menos 6 caracteres' };
        }
        if (password.length > 100) {
            return { isValid: false, message: 'A senha não pode ter mais de 100 caracteres' };
        }
        return { isValid: true, message: '' };
    }

    /**
     * Register a new user
     */
    register(data: RegisterData): { success: boolean; user?: User; error?: string } {
        // Validate email
        if (!this.validateEmail(data.email)) {
            return { success: false, error: 'Email inválido' };
        }

        // Validate password
        const passwordValidation = this.validatePassword(data.password);
        if (!passwordValidation.isValid) {
            return { success: false, error: passwordValidation.message };
        }

        // Check password confirmation
        if (data.password !== data.confirmPassword) {
            return { success: false, error: 'As senhas não coincidem' };
        }

        // Validate name
        if (!data.name.trim()) {
            return { success: false, error: 'Nome é obrigatório' };
        }

        // Check if email already exists
        const users = this.getStoredUsers();
        const existingUser = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
        if (existingUser) {
            return { success: false, error: 'Este email já está cadastrado' };
        }

        // Create new user
        const now = new Date();
        const newUser: StoredUser = {
            id: generateUserId(),
            email: data.email.toLowerCase(),
            name: data.name.trim(),
            passwordHash: hashPassword(data.password),
            createdAt: now.toISOString(),
            lastLoginAt: now.toISOString(),
        };

        // Save user
        users.push(newUser);
        this.saveUsers(users);

        // Create session
        const session: AuthSession = {
            userId: newUser.id,
            token: generateToken(),
            expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
        };
        this.saveSession(session);

        // Return user without password
        const user: User = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            createdAt: new Date(newUser.createdAt),
            lastLoginAt: new Date(newUser.lastLoginAt),
        };

        return { success: true, user };
    }

    /**
     * Login with email and password
     */
    login(credentials: AuthCredentials): { success: boolean; user?: User; error?: string } {
        // Validate email
        if (!this.validateEmail(credentials.email)) {
            return { success: false, error: 'Email inválido' };
        }

        // Find user
        const users = this.getStoredUsers();
        const storedUser = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

        if (!storedUser) {
            return { success: false, error: 'Email ou senha incorretos' };
        }

        // Verify password
        const passwordHash = hashPassword(credentials.password);
        if (storedUser.passwordHash !== passwordHash) {
            return { success: false, error: 'Email ou senha incorretos' };
        }

        // Update last login
        const now = new Date();
        storedUser.lastLoginAt = now.toISOString();
        this.saveUsers(users);

        // Create session
        const session: AuthSession = {
            userId: storedUser.id,
            token: generateToken(),
            expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
        };
        this.saveSession(session);

        // Return user without password
        const user: User = {
            id: storedUser.id,
            email: storedUser.email,
            name: storedUser.name,
            createdAt: new Date(storedUser.createdAt),
            lastLoginAt: new Date(storedUser.lastLoginAt),
        };

        return { success: true, user };
    }

    /**
     * Logout current user
     */
    logout(): void {
        this.clearSession();
    }

    /**
     * Get current user from session
     */
    getCurrentUser(): User | null {
        const session = this.getSession();
        if (!session) return null;

        const users = this.getStoredUsers();
        const storedUser = users.find(u => u.id === session.userId);

        if (!storedUser) {
            this.clearSession();
            return null;
        }

        return {
            id: storedUser.id,
            email: storedUser.email,
            name: storedUser.name,
            createdAt: new Date(storedUser.createdAt),
            lastLoginAt: new Date(storedUser.lastLoginAt),
        };
    }

    /**
     * Update user data
     */
    updateUser(userId: string, updates: Partial<User>): { success: boolean; user?: User; error?: string } {
        const users = this.getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return { success: false, error: 'Usuário não encontrado' };
        }

        // Update allowed fields
        if (updates.name) {
            users[userIndex].name = updates.name.trim();
        }

        this.saveUsers(users);

        return {
            success: true,
            user: {
                id: users[userIndex].id,
                email: users[userIndex].email,
                name: users[userIndex].name,
                createdAt: new Date(users[userIndex].createdAt),
                lastLoginAt: new Date(users[userIndex].lastLoginAt),
            },
        };
    }

    /**
     * Check if email is available
     */
    isEmailAvailable(email: string): boolean {
        const users = this.getStoredUsers();
        return !users.some(u => u.email.toLowerCase() === email.toLowerCase());
    }
}

export const authService = new AuthService();
