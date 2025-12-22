-- =============================================
-- FIX: Remove and Recreate RLS Policies
-- =============================================
-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yxeoarwviwpheyelrkee/sql

-- PASSO 1: Remover TODAS as políticas existentes
-- =============================================

-- Notes policies
DROP POLICY IF EXISTS "Users can view own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can create own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
DROP POLICY IF EXISTS "notes_select" ON public.notes;
DROP POLICY IF EXISTS "notes_insert" ON public.notes;
DROP POLICY IF EXISTS "notes_update" ON public.notes;
DROP POLICY IF EXISTS "notes_delete" ON public.notes;

-- Jots policies
DROP POLICY IF EXISTS "Users can view own jots" ON public.jots;
DROP POLICY IF EXISTS "Users can create own jots" ON public.jots;
DROP POLICY IF EXISTS "Users can update own jots" ON public.jots;
DROP POLICY IF EXISTS "Users can delete own jots" ON public.jots;
DROP POLICY IF EXISTS "jots_select" ON public.jots;
DROP POLICY IF EXISTS "jots_insert" ON public.jots;
DROP POLICY IF EXISTS "jots_update" ON public.jots;
DROP POLICY IF EXISTS "jots_delete" ON public.jots;

-- Tasks policies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete" ON public.tasks;

-- Events policies
DROP POLICY IF EXISTS "Users can view own events" ON public.events;
DROP POLICY IF EXISTS "Users can create own events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
DROP POLICY IF EXISTS "events_select" ON public.events;
DROP POLICY IF EXISTS "events_insert" ON public.events;
DROP POLICY IF EXISTS "events_update" ON public.events;
DROP POLICY IF EXISTS "events_delete" ON public.events;

-- Profiles policies  
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- PASSO 2: Garantir que RLS está habilitado
-- =============================================
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 3: Criar novas políticas
-- =============================================

-- NOTES
CREATE POLICY "notes_access_all" ON public.notes
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- JOTS
CREATE POLICY "jots_access_all" ON public.jots
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- TASKS
CREATE POLICY "tasks_access_all" ON public.tasks
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- EVENTS
CREATE POLICY "events_access_all" ON public.events
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- PROFILES
CREATE POLICY "profiles_access_all" ON public.profiles
    FOR ALL USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- PASSO 4: Verificar se as permissões estão corretas
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- PASSO 5: Confirmar tabelas existem
-- =============================================
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notes', 'jots', 'tasks', 'events', 'profiles');
