-- =============================================
-- ADICIONAR CAMPO TAGS À TABELA EVENTS
-- =============================================
-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yxeoarwviwpheyelrkee/sql/new

-- Adicionar campo tags à tabela events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Criar índice para busca por tags (GIN index para arrays)
CREATE INDEX IF NOT EXISTS events_tags_idx ON public.events USING GIN (tags);

-- Verificar se a coluna foi criada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'tags';
