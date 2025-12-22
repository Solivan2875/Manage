-- =============================================
-- CORREÇÃO DEFINITIVA DE RLS - MaxNote
-- =============================================
-- EXECUTE ESTE SQL NO SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/yxeoarwviwpheyelrkee/sql

-- =============================================
-- PASSO 1: Remover TODAS as políticas existentes
-- =============================================

-- Notes
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'notes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notes', pol.policyname);
    END LOOP;
END $$;

-- Jots
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'jots' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.jots', pol.policyname);
    END LOOP;
END $$;

-- Tasks
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'tasks' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.tasks', pol.policyname);
    END LOOP;
END $$;

-- Events
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'events' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.events', pol.policyname);
    END LOOP;
END $$;

-- Profiles
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- =============================================
-- PASSO 2: Habilitar RLS em todas as tabelas
-- =============================================
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PASSO 3: Forçar RLS mesmo para table owners
-- =============================================
ALTER TABLE public.notes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.jots FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- =============================================
-- PASSO 4: Criar políticas para NOTES
-- =============================================
CREATE POLICY "notes_select_policy" ON public.notes
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "notes_insert_policy" ON public.notes
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update_policy" ON public.notes
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_delete_policy" ON public.notes
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- =============================================
-- PASSO 5: Criar políticas para JOTS
-- =============================================
CREATE POLICY "jots_select_policy" ON public.jots
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "jots_insert_policy" ON public.jots
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jots_update_policy" ON public.jots
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jots_delete_policy" ON public.jots
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- =============================================
-- PASSO 6: Criar políticas para TASKS
-- =============================================
CREATE POLICY "tasks_select_policy" ON public.tasks
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_policy" ON public.tasks
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_policy" ON public.tasks
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_delete_policy" ON public.tasks
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- =============================================
-- PASSO 7: Criar políticas para EVENTS
-- =============================================
CREATE POLICY "events_select_policy" ON public.events
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "events_insert_policy" ON public.events
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_update_policy" ON public.events
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_delete_policy" ON public.events
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- =============================================
-- PASSO 8: Criar políticas para PROFILES
-- =============================================
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- =============================================
-- PASSO 9: Verificar políticas criadas
-- =============================================
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
