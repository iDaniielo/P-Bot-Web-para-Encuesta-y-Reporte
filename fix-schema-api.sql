-- ============================================================================
-- CREAR TABLA ENCUESTAS EN API SCHEMA CON PERMISOS COMPLETOS
-- ============================================================================
-- Ejecuta este script COMPLETO en Supabase SQL Editor
-- ============================================================================

-- PASO 1: Crear el schema api si no existe
CREATE SCHEMA IF NOT EXISTS api;

-- PASO 2: Eliminar tabla existente si hay conflictos
DROP TABLE IF EXISTS api.encuestas CASCADE;

-- PASO 3: Crear la tabla en el schema api
CREATE TABLE api.encuestas (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    regalo TEXT NOT NULL,
    lugar_compra TEXT NOT NULL,
    gasto TEXT NOT NULL,
    CONSTRAINT encuestas_pkey PRIMARY KEY (id)
);

-- PASO 4: Otorgar permisos explícitos a roles anon y authenticated
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT ALL ON api.encuestas TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA api TO anon, authenticated;

-- PASO 5: Habilitar RLS
ALTER TABLE api.encuestas ENABLE ROW LEVEL SECURITY;

-- PASO 6: Crear políticas RLS permisivas
CREATE POLICY "Enable insert for anon and authenticated users"
ON api.encuestas
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for anon and authenticated users"
ON api.encuestas
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Enable update for anon and authenticated users"
ON api.encuestas
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for anon and authenticated users"
ON api.encuestas
FOR DELETE
TO anon, authenticated
USING (true);

-- PASO 7: Crear índices
CREATE INDEX idx_encuestas_created_at ON api.encuestas USING btree (created_at DESC);
CREATE INDEX idx_encuestas_lugar_compra ON api.encuestas USING btree (lugar_compra);
CREATE INDEX idx_encuestas_regalo ON api.encuestas USING btree (regalo);

-- PASO 8: Verificar permisos
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'api' 
AND table_name = 'encuestas';

-- PASO 9: Verificar políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'encuestas' AND schemaname = 'api';

SELECT '✅ Tabla creada exitosamente con todos los permisos!' as status;
