-- Verificar políticas RLS para survey_questions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'api'
  AND tablename = 'survey_questions'
ORDER BY policyname;

-- Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'api'
  AND tablename IN ('survey_questions', 'encuestas');

-- Verificar permisos de la tabla
SELECT 
    grantee,
    privilege_type,
    table_schema,
    table_name
FROM information_schema.table_privileges
WHERE table_schema = 'api'
  AND table_name = 'survey_questions'
ORDER BY grantee, privilege_type;
