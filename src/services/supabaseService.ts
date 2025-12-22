import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// ============================================
// Authentication Service
// ============================================

export interface AuthResult {
    success: boolean;
    user?: User | null;
    session?: Session | null;
    error?: string;
}

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string, name: string): Promise<AuthResult> => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    full_name: name,
                },
            },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            user: data.user,
            session: data.session,
        };
    } catch (err) {
        console.error('Sign up error:', err);
        return { success: false, error: 'Erro ao criar conta' };
    }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return {
            success: true,
            user: data.user,
            session: data.session,
        };
    } catch (err) {
        console.error('Sign in error:', err);
        return { success: false, error: 'Erro ao fazer login' };
    }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Sign out error:', err);
        return { success: false, error: 'Erro ao sair' };
    }
};

/**
 * Get current session
 */
export const getSession = async (): Promise<Session | null> => {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Get session error:', error);
            return null;
        }

        return data.session;
    } catch (err) {
        console.error('Get session error:', err);
        return null;
    }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Get user error:', error);
            return null;
        }

        return data.user;
    } catch (err) {
        console.error('Get user error:', err);
        return null;
    }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Reset password error:', err);
        return { success: false, error: 'Erro ao enviar email de recuperação' };
    }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Update password error:', err);
        return { success: false, error: 'Erro ao atualizar senha' };
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (updates: { name?: string; avatar_url?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.auth.updateUser({
            data: updates,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Update profile error:', err);
        return { success: false, error: 'Erro ao atualizar perfil' };
    }
};

// ============================================
// Database Service - Notes
// ============================================

export interface Note {
    id: string;
    user_id: string;
    title: string;
    content: string;
    tags: string[];
    is_pinned: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export const notesService = {
    /**
     * Get all notes for current user
     */
    async getAll(): Promise<{ data: Note[] | null; error: string | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { data: null, error: 'Usuário não autenticado' };
            }

            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Get notes error:', err);
            return { data: null, error: 'Erro ao carregar notas' };
        }
    },

    /**
     * Get a single note by ID
     */
    async getById(id: string): Promise<{ data: Note | null; error: string | null }> {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Get note error:', err);
            return { data: null, error: 'Erro ao carregar nota' };
        }
    },

    /**
     * Create a new note
     */
    async create(note: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Note | null; error: string | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { data: null, error: 'Usuário não autenticado' };
            }

            const { data, error } = await supabase
                .from('notes')
                .insert([{ ...note, user_id: user.id }])
                .select()
                .single();

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Create note error:', err);
            return { data: null, error: 'Erro ao criar nota' };
        }
    },

    /**
     * Update a note
     */
    async update(id: string, updates: Partial<Note>): Promise<{ data: Note | null; error: string | null }> {
        try {
            const { data, error } = await supabase
                .from('notes')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Update note error:', err);
            return { data: null, error: 'Erro ao atualizar nota' };
        }
    },

    /**
     * Delete a note
     */
    async delete(id: string): Promise<{ success: boolean; error: string | null }> {
        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', id);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, error: null };
        } catch (err) {
            console.error('Delete note error:', err);
            return { success: false, error: 'Erro ao deletar nota' };
        }
    },
};

// ============================================
// Database Service - Tasks
// ============================================

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export const tasksService = {
    /**
     * Get all tasks for current user
     */
    async getAll(): Promise<{ data: Task[] | null; error: string | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { data: null, error: 'Usuário não autenticado' };
            }

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Get tasks error:', err);
            return { data: null, error: 'Erro ao carregar tarefas' };
        }
    },

    /**
     * Create a new task
     */
    async create(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Task | null; error: string | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { data: null, error: 'Usuário não autenticado' };
            }

            const { data, error } = await supabase
                .from('tasks')
                .insert([{ ...task, user_id: user.id }])
                .select()
                .single();

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Create task error:', err);
            return { data: null, error: 'Erro ao criar tarefa' };
        }
    },

    /**
     * Update a task
     */
    async update(id: string, updates: Partial<Task>): Promise<{ data: Task | null; error: string | null }> {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Update task error:', err);
            return { data: null, error: 'Erro ao atualizar tarefa' };
        }
    },

    /**
     * Delete a task
     */
    async delete(id: string): Promise<{ success: boolean; error: string | null }> {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, error: null };
        } catch (err) {
            console.error('Delete task error:', err);
            return { success: false, error: 'Erro ao deletar tarefa' };
        }
    },
};

// ============================================
// Database Service - Events (Calendar)
// ============================================

export interface CalendarEvent {
    id: string;
    user_id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    all_day: boolean;
    location: string | null;
    color: string;
    reminder: number | null;
    recurrence: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export const eventsService = {
    /**
     * Get all events for current user
     */
    async getAll(): Promise<{ data: CalendarEvent[] | null; error: string | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { data: null, error: 'Usuário não autenticado' };
            }

            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', user.id)
                .order('start_date', { ascending: true });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Get events error:', err);
            return { data: null, error: 'Erro ao carregar eventos' };
        }
    },

    /**
     * Get events within a date range
     */
    async getByDateRange(startDate: string, endDate: string): Promise<{ data: CalendarEvent[] | null; error: string | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { data: null, error: 'Usuário não autenticado' };
            }

            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', user.id)
                .gte('start_date', startDate)
                .lte('end_date', endDate)
                .order('start_date', { ascending: true });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Get events error:', err);
            return { data: null, error: 'Erro ao carregar eventos' };
        }
    },

    /**
     * Create a new event
     */
    async create(event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: CalendarEvent | null; error: string | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { data: null, error: 'Usuário não autenticado' };
            }

            const { data, error } = await supabase
                .from('events')
                .insert([{ ...event, user_id: user.id }])
                .select()
                .single();

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Create event error:', err);
            return { data: null, error: 'Erro ao criar evento' };
        }
    },

    /**
     * Update an event
     */
    async update(id: string, updates: Partial<CalendarEvent>): Promise<{ data: CalendarEvent | null; error: string | null }> {
        try {
            const { data, error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Update event error:', err);
            return { data: null, error: 'Erro ao atualizar evento' };
        }
    },

    /**
     * Delete an event
     */
    async delete(id: string): Promise<{ success: boolean; error: string | null }> {
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, error: null };
        } catch (err) {
            console.error('Delete event error:', err);
            return { success: false, error: 'Erro ao deletar evento' };
        }
    },
};

// ============================================
// Database Service - Jots (Quick Notes)
// ============================================

export interface Jot {
    id: string;
    user_id: string;
    content: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export const jotsService = {
    /**
     * Get all jots for current user
     */
    async getAll(): Promise<{ data: Jot[] | null; error: string | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { data: null, error: 'Usuário não autenticado' };
            }

            const { data, error } = await supabase
                .from('jots')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Get jots error:', err);
            return { data: null, error: 'Erro ao carregar rascunhos' };
        }
    },

    /**
     * Create a new jot
     */
    async create(jot: Omit<Jot, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Jot | null; error: string | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { data: null, error: 'Usuário não autenticado' };
            }

            const { data, error } = await supabase
                .from('jots')
                .insert([{ ...jot, user_id: user.id }])
                .select()
                .single();

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Create jot error:', err);
            return { data: null, error: 'Erro ao criar rascunho' };
        }
    },

    /**
     * Update a jot
     */
    async update(id: string, updates: Partial<Jot>): Promise<{ data: Jot | null; error: string | null }> {
        try {
            const { data, error } = await supabase
                .from('jots')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                return { data: null, error: error.message };
            }

            return { data, error: null };
        } catch (err) {
            console.error('Update jot error:', err);
            return { data: null, error: 'Erro ao atualizar rascunho' };
        }
    },

    /**
     * Delete a jot
     */
    async delete(id: string): Promise<{ success: boolean; error: string | null }> {
        try {
            const { error } = await supabase
                .from('jots')
                .delete()
                .eq('id', id);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, error: null };
        } catch (err) {
            console.error('Delete jot error:', err);
            return { success: false, error: 'Erro ao deletar rascunho' };
        }
    },
};

// ============================================
// Storage Service - Avatar Upload
// ============================================

export const storageService = {
    /**
     * Upload avatar image
     * @param userId - User ID to organize files
     * @param file - File to upload
     * @returns URL of the uploaded image or error
     */
    async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: string | null }> {
        try {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                return { url: null, error: 'Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP.' };
            }

            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                return { url: null, error: 'Arquivo muito grande. Tamanho máximo: 5MB.' };
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

            // Delete old avatar if exists
            const { data: existingFiles } = await supabase.storage
                .from('avatars')
                .list(userId);

            if (existingFiles && existingFiles.length > 0) {
                const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
                await supabase.storage.from('avatars').remove(filesToDelete);
            }

            // Upload new avatar
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                return { url: null, error: uploadError.message };
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update user profile with new avatar URL
            await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            return { url: publicUrl, error: null };
        } catch (err) {
            console.error('Upload avatar error:', err);
            return { url: null, error: 'Erro ao enviar imagem' };
        }
    },

    /**
     * Delete avatar image
     * @param userId - User ID
     * @returns Success status
     */
    async deleteAvatar(userId: string): Promise<{ success: boolean; error: string | null }> {
        try {
            // List files in user's folder
            const { data: files, error: listError } = await supabase.storage
                .from('avatars')
                .list(userId);

            if (listError) {
                return { success: false, error: listError.message };
            }

            if (files && files.length > 0) {
                const filesToDelete = files.map(f => `${userId}/${f.name}`);
                const { error: deleteError } = await supabase.storage
                    .from('avatars')
                    .remove(filesToDelete);

                if (deleteError) {
                    return { success: false, error: deleteError.message };
                }
            }

            // Clear avatar URL from user profile
            await supabase.auth.updateUser({
                data: { avatar_url: null }
            });

            return { success: true, error: null };
        } catch (err) {
            console.error('Delete avatar error:', err);
            return { success: false, error: 'Erro ao deletar imagem' };
        }
    },

    /**
     * Get avatar URL for a user
     * @param userId - User ID
     * @returns Avatar URL or null
     */
    async getAvatarUrl(userId: string): Promise<string | null> {
        try {
            const { data: files } = await supabase.storage
                .from('avatars')
                .list(userId);

            if (files && files.length > 0) {
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(`${userId}/${files[0].name}`);
                return publicUrl;
            }

            return null;
        } catch (err) {
            console.error('Get avatar URL error:', err);
            return null;
        }
    },

    /**
     * Upload any file to a bucket
     * @param bucket - Bucket name
     * @param path - File path within bucket
     * @param file - File to upload
     * @returns URL of the uploaded file or error
     */
    async uploadFile(bucket: string, path: string, file: File): Promise<{ url: string | null; error: string | null }> {
        try {
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                return { url: null, error: uploadError.message };
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);

            return { url: publicUrl, error: null };
        } catch (err) {
            console.error('Upload file error:', err);
            return { url: null, error: 'Erro ao enviar arquivo' };
        }
    },

    /**
     * Delete a file from a bucket
     * @param bucket - Bucket name
     * @param path - File path within bucket
     * @returns Success status
     */
    async deleteFile(bucket: string, path: string): Promise<{ success: boolean; error: string | null }> {
        try {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, error: null };
        } catch (err) {
            console.error('Delete file error:', err);
            return { success: false, error: 'Erro ao deletar arquivo' };
        }
    },
};

// Export supabase client for direct access if needed
export { supabase };
