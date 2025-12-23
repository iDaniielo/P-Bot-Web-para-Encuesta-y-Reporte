-- ============================================================================
-- MIGRAR TABLA ENCUESTAS DE PUBLIC A API SCHEMA
-- ============================================================================
-- Ejecuta este script en Supabase SQL Editor
-- ============================================================================

-- PASO 1: Crear el schema api si no existe
CREATE SCHEMA IF NOT EXISTS api;

-- PASO 2: Crear la tabla en el schema api (copia de public.encuestas)
CREATE TABLE IF NOT EXISTS api.encuestas (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    regalo TEXT NOT NULL,
    lugar_compra TEXT NOT NULL,
    gasto TEXT NOT NULL,
    CONSTRAINT encuestas_pkey PRIMARY KEY (id)
);

-- PASO 3: Copiar datos de public.encuestas a api.encuestas (si existen)
INSERT INTO api.encuestas (id, created_at, nombre, telefono, regalo, lugar_compra, gasto)
SELECT id, created_at, nombre, telefono, regalo, lugar_compra, gasto
FROM public.encuestas
ON CONFLICT (id) DO NOTHING;

-- PASO 4: Habilitar RLS en api.encuestas
ALTER TABLE api.encuestas ENABLE ROW LEVEL SECURITY;

-- PASO 5: Eliminar políticas antiguas (si existen)
DROP POLICY IF EXISTS "Allow public inserts" ON api.encuestas;
DROP POLICY IF EXISTS "Allow public reads" ON api.encuestas;
DROP POLICY IF EXISTS "Public can insert survey responses" ON api.encuestas;
DROP POLICY IF EXISTS "Public can read survey responses" ON api.encuestas;

-- PASO 6: Crear políticas RLS para api.encuestas
CREATE POLICY "Public can insert survey responses"
ON api.encuestas
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can read survey responses"
ON api.encuestas
FOR SELECT
TO anon, authenticated
USING (true);

-- PASO 7: Crear índices en api.encuestas
CREATE INDEX IF NOT EXISTS idx_encuestas_created_at ON api.encuestas USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_encuestas_lugar_compra ON api.encuestas USING btree (lugar_compra);
CREATE INDEX IF NOT EXISTS idx_encuestas_regalo ON api.encuestas USING btree (regalo);

-- PASO 8: Verificar las políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'encuestas' AND schemaname = 'api';

-- PASO 9: Verificar los datos migrados
SELECT COUNT(*) as total_registros FROM api.encuestas;

SELECT 'Migración completada exitosamente!' as status;
