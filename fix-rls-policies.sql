-- ============================================================================
-- FIX RLS POLICIES FOR ENCUESTAS TABLE
-- ============================================================================
-- Execute este script en el SQL Editor de Supabase para solucionar el error
-- "permission denied for table encuestas"
-- ============================================================================

-- PASO 1: Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow public inserts" ON public.encuestas;
DROP POLICY IF EXISTS "Allow public reads" ON public.encuestas;
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.encuestas;
DROP POLICY IF EXISTS "Allow admin reads" ON public.encuestas;
DROP POLICY IF EXISTS "Public can insert survey responses" ON public.encuestas;
DROP POLICY IF EXISTS "Only admins can read all responses" ON public.encuestas;
DROP POLICY IF EXISTS "Only authenticated users can read all responses" ON public.encuestas;

-- PASO 2: Asegurar que RLS esté habilitado
ALTER TABLE public.encuestas ENABLE ROW LEVEL SECURITY;

-- PASO 3: Crear política para permitir inserts públicos (encuestas anónimas)
CREATE POLICY "Public can insert survey responses"
ON public.encuestas
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- PASO 4: Crear política para permitir lecturas públicas (dashboard)
-- ⚠️ NOTA: Esto permite lecturas públicas para desarrollo/demostración
-- Para producción, considera restringir a usuarios autenticados
CREATE POLICY "Public can read survey responses"
ON public.encuestas
FOR SELECT
TO anon, authenticated
USING (true);

-- PASO 5: Verificar que las políticas se crearon correctamente
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
WHERE tablename = 'encuestas';
