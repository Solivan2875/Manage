import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { signIn, signUp, signOut, getCurrentUser } from '../services/supabaseService';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    createdAt: Date;
}

interface AuthCredentials {
    email: string;
    password: string;
}

interface RegisterData extends AuthCredentials {
    name: string;
    confirmPassword: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: AuthCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
    updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = (user: User): AuthUser => ({
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    avatarUrl: user.user_metadata?.avatar_url,
    createdAt: new Date(user.created_at),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check for existing session on mount and listen for auth changes
    useEffect(() => {
        // Get initial session
        const initSession = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(mapSupabaseUser(currentUser));
                }
            } catch (err) {
                console.error('Error checking session:', err);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initSession();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);

                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(mapSupabaseUser(session.user));
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                } else if (event === 'USER_UPDATED' && session?.user) {
                    setUser(mapSupabaseUser(session.user));
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    setUser(mapSupabaseUser(session.user));
                }

                setIsLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = useCallback(async (credentials: AuthCredentials): Promise<boolean> => {
        setError(null);
        setIsLoading(true);

        try {
            const result = await signIn(credentials.email, credentials.password);

            if (result.success && result.user) {
                setUser(mapSupabaseUser(result.user));
                setIsLoading(false);
                return true;
            } else {
                setError(result.error || 'Erro ao fazer login');
                setIsLoading(false);
                return false;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Erro inesperado ao fazer login');
            setIsLoading(false);
            return false;
        }
    }, []);

    const register = useCallback(async (data: RegisterData): Promise<boolean> => {
        setError(null);
        setIsLoading(true);

        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            setError('As senhas não coincidem');
            setIsLoading(false);
            return false;
        }

        try {
            const result = await signUp(data.email, data.password, data.name);

            if (result.success && result.user) {
                setUser(mapSupabaseUser(result.user));
                setIsLoading(false);
                return true;
            } else {
                setError(result.error || 'Erro ao criar conta');
                setIsLoading(false);
                return false;
            }
        } catch (err) {
            console.error('Register error:', err);
            setError('Erro inesperado ao criar conta');
            setIsLoading(false);
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await signOut();
            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const updateUser = useCallback((updates: Partial<AuthUser>) => {
        if (!user) return;
        setUser({ ...user, ...updates });
    }, [user]);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
