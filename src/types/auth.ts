// Authentication Types

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    lastLoginAt: Date;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends AuthCredentials {
    name: string;
    confirmPassword: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    login: (credentials: AuthCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
    updateUser: (updates: Partial<User>) => void;
}

export interface StoredUser {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    createdAt: string;
    lastLoginAt: string;
}

export interface AuthSession {
    userId: string;
    token: string;
    expiresAt: string;
}
