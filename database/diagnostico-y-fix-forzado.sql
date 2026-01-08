-- ============================================================================
-- DIAGNÓSTICO COMPLETO Y SOLUCIÓN FORZADA
-- ============================================================================

-- 1. VER EN QUÉ ESQUEMA ESTÁN LAS TABLAS
-- ============================================================================
SELECT 
    table_schema,
    table_name
FROM information_schema.tables
WHERE table_name IN ('survey_questions', 'encuestas')
ORDER BY table_schema, table_name;

-- 2. VER POLÍTICAS ACTUALES
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN ('survey_questions', 'encuestas')
ORDER BY schemaname, tablename, policyname;

-- 3. VER PERMISOS ACTUALES
-- ============================================================================
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('survey_questions', 'encuestas')
ORDER BY table_schema, table_name, grantee;

-- 4. DESHABILITAR RLS COMPLETAMENTE (TEMPORAL PARA TESTING)
-- ============================================================================
-- Esto es para probar si el problema es RLS

ALTER TABLE IF EXISTS public.encuestas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.survey_questions DISABLE ROW LEVEL SECURITY;

-- Si también están en api schema:
ALTER TABLE IF EXISTS api.encuestas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api.survey_questions DISABLE ROW LEVEL SECURITY;

-- 5. OTORGAR TODOS LOS PERMISOS (FORZAR)
-- ============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Si también están en api:
GRANT ALL ON ALL TABLES IN SCHEMA api TO anon, authenticated;
GRANT USAGE ON SCHEMA api TO anon, authenticated;

-- 6. PROBAR CONSULTAS
-- ============================================================================
SELECT 'Test query - public.encuestas' as test, COUNT(*) FROM public.encuestas;
SELECT 'Test query - public.survey_questions' as test, COUNT(*) FROM public.survey_questions;

-- Si fallan, probar con api:
-- SELECT 'Test query - api.encuestas' as test, COUNT(*) FROM api.encuestas;
-- SELECT 'Test query - api.survey_questions' as test, COUNT(*) FROM api.survey_questions;

-- ============================================================================
-- RESULTADO: Esto deshabilita RLS temporalmente para que funcione
-- Una vez que funcione, re-habilitaremos RLS con políticas correctas
-- ============================================================================
