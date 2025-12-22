import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// These values should be set in your environment variables for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yxeoarwviwpheyelrkee.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
    console.warn('Supabase anon key is not configured. Please set VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Export types for convenience
export type { User, Session, AuthError } from '@supabase/supabase-js';
