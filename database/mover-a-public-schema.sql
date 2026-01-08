-- ============================================================================
-- MOVER TABLAS DEL ESQUEMA 'api' AL ESQUEMA 'public'
-- ============================================================================
-- Esto resuelve el problema "Invalid schema: api"
-- El esquema 'public' es el por defecto y siempre funciona

-- 1. MOVER LAS TABLAS
-- ============================================================================
ALTER TABLE api.survey_questions SET SCHEMA public;
ALTER TABLE api.encuestas SET SCHEMA public;

-- 2. VERIFICAR QUE LAS TABLAS SE MOVIERON
-- ============================================================================
SELECT 
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_name IN ('survey_questions', 'encuestas')
ORDER BY table_schema, table_name;

-- 3. RECREAR POLÍTICAS RLS (ahora en el esquema public)
-- ============================================================================

-- Deshabilitar RLS temporalmente para recrear políticas
ALTER TABLE public.survey_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "allow_all_select_questions" ON public.survey_questions;
DROP POLICY IF EXISTS "allow_authenticated_insert_questions" ON public.survey_questions;
DROP POLICY IF EXISTS "allow_authenticated_update_questions" ON public.survey_questions;
DROP POLICY IF EXISTS "allow_authenticated_delete_questions" ON public.survey_questions;
DROP POLICY IF EXISTS "allow_public_insert_encuestas" ON public.encuestas;
DROP POLICY IF EXISTS "allow_authenticated_select_encuestas" ON public.encuestas;

-- Habilitar RLS de nuevo
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;

-- Políticas para survey_questions
CREATE POLICY "allow_all_select_questions" 
ON public.survey_questions
FOR SELECT 
USING (true);

CREATE POLICY "allow_authenticated_insert_questions" 
ON public.survey_questions
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "allow_authenticated_update_questions" 
ON public.survey_questions
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete_questions" 
ON public.survey_questions
FOR DELETE 
TO authenticated 
USING (true);

-- Políticas para encuestas
CREATE POLICY "allow_public_insert_encuestas" 
ON public.encuestas
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "allow_authenticated_select_encuestas" 
ON public.encuestas
FOR SELECT 
TO authenticated 
USING (true);

-- 4. CONFIGURAR PERMISOS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.survey_questions TO authenticated;
GRANT SELECT ON public.survey_questions TO anon;
GRANT ALL ON public.encuestas TO authenticated;
GRANT INSERT ON public.encuestas TO anon;

-- 5. VERIFICACIÓN FINAL
-- ============================================================================
-- Verificar políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('survey_questions', 'encuestas')
ORDER BY tablename, policyname;

-- Probar consultas
SELECT COUNT(*) as total_preguntas FROM public.survey_questions;
SELECT COUNT(*) as total_encuestas FROM public.encuestas;

-- ============================================================================
-- ✅ LISTO - Las tablas ahora están en el esquema 'public'
-- ============================================================================
