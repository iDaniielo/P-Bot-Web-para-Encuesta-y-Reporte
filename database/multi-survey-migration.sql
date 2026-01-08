-- ============================================================================
-- MIGRACIÓN A SISTEMA MULTI-ENCUESTAS
-- ============================================================================
-- Este script migra el sistema de una sola encuesta a un sistema que soporta
-- múltiples encuestas con agrupación
-- ============================================================================

-- 1. CREAR TABLA DE GRUPOS DE ENCUESTAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS api.survey_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CREAR TABLA DE ENCUESTAS (PLANTILLAS/DEFINICIONES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS api.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    survey_group_id UUID REFERENCES api.survey_groups(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. AGREGAR COLUMNA survey_id A survey_questions
-- ============================================================================
-- Primero verificar si la columna ya existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'api' 
        AND table_name = 'survey_questions' 
        AND column_name = 'survey_id'
    ) THEN
        ALTER TABLE api.survey_questions 
        ADD COLUMN survey_id UUID REFERENCES api.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. AGREGAR COLUMNA survey_id A encuestas (respuestas)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'api' 
        AND table_name = 'encuestas' 
        AND column_name = 'survey_id'
    ) THEN
        ALTER TABLE api.encuestas 
        ADD COLUMN survey_id UUID REFERENCES api.surveys(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. CREAR ENCUESTA POR DEFECTO (MIGRACIÓN DE DATOS EXISTENTES)
-- ============================================================================
-- Crear grupo por defecto
INSERT INTO api.survey_groups (id, name, description)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Encuestas Navideñas',
    'Grupo de encuestas navideñas 2024-2025'
)
ON CONFLICT (id) DO NOTHING;

-- Crear encuesta por defecto
INSERT INTO api.surveys (id, title, description, survey_group_id, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Encuesta Navideña 2024',
    'Encuesta sobre planes y compras navideñas',
    '00000000-0000-0000-0000-000000000001',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Asignar todas las preguntas existentes a la encuesta por defecto
UPDATE api.survey_questions 
SET survey_id = '00000000-0000-0000-0000-000000000001'
WHERE survey_id IS NULL;

-- Asignar todas las respuestas existentes a la encuesta por defecto
UPDATE api.encuestas 
SET survey_id = '00000000-0000-0000-0000-000000000001'
WHERE survey_id IS NULL;

-- 6. CREAR ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_surveys_group 
ON api.surveys(survey_group_id);

CREATE INDEX IF NOT EXISTS idx_surveys_status 
ON api.surveys(status);

CREATE INDEX IF NOT EXISTS idx_survey_questions_survey 
ON api.survey_questions(survey_id);

CREATE INDEX IF NOT EXISTS idx_encuestas_survey 
ON api.encuestas(survey_id);

-- 7. CREAR TRIGGERS PARA updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_survey_groups_updated_at ON api.survey_groups;
CREATE TRIGGER update_survey_groups_updated_at
    BEFORE UPDATE ON api.survey_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_surveys_updated_at ON api.surveys;
CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON api.surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. HABILITAR ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE api.survey_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.surveys ENABLE ROW LEVEL SECURITY;

-- 9. POLÍTICAS RLS PARA survey_groups
-- ============================================================================

-- Lectura pública de grupos
DROP POLICY IF EXISTS "allow_all_select_survey_groups" ON api.survey_groups;
CREATE POLICY "allow_all_select_survey_groups" 
ON api.survey_groups
FOR SELECT 
USING (true);

-- Solo usuarios autenticados pueden crear grupos
DROP POLICY IF EXISTS "allow_authenticated_insert_survey_groups" ON api.survey_groups;
CREATE POLICY "allow_authenticated_insert_survey_groups" 
ON api.survey_groups
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar grupos
DROP POLICY IF EXISTS "allow_authenticated_update_survey_groups" ON api.survey_groups;
CREATE POLICY "allow_authenticated_update_survey_groups" 
ON api.survey_groups
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar grupos
DROP POLICY IF EXISTS "allow_authenticated_delete_survey_groups" ON api.survey_groups;
CREATE POLICY "allow_authenticated_delete_survey_groups" 
ON api.survey_groups
FOR DELETE 
TO authenticated 
USING (true);

-- 10. POLÍTICAS RLS PARA surveys
-- ============================================================================

-- Lectura pública de encuestas activas
DROP POLICY IF EXISTS "allow_all_select_surveys" ON api.surveys;
CREATE POLICY "allow_all_select_surveys" 
ON api.surveys
FOR SELECT 
USING (status = 'active' OR auth.role() = 'authenticated');

-- Solo usuarios autenticados pueden crear encuestas
DROP POLICY IF EXISTS "allow_authenticated_insert_surveys" ON api.surveys;
CREATE POLICY "allow_authenticated_insert_surveys" 
ON api.surveys
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar encuestas
DROP POLICY IF EXISTS "allow_authenticated_update_surveys" ON api.surveys;
CREATE POLICY "allow_authenticated_update_surveys" 
ON api.surveys
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar encuestas
DROP POLICY IF EXISTS "allow_authenticated_delete_surveys" ON api.surveys;
CREATE POLICY "allow_authenticated_delete_surveys" 
ON api.surveys
FOR DELETE 
TO authenticated 
USING (true);

-- 11. PERMISOS DEL SCHEMA
-- ============================================================================
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT ALL ON api.survey_groups TO authenticated;
GRANT SELECT ON api.survey_groups TO anon;
GRANT ALL ON api.surveys TO authenticated;
GRANT SELECT ON api.surveys TO anon;

-- ============================================================================
-- MIGRACIÓN COMPLETADA
-- ============================================================================
-- Ahora el sistema soporta:
-- 1. Múltiples encuestas (plantillas)
-- 2. Agrupación de encuestas
-- 3. Estados de encuesta (draft, active, archived)
-- 4. Preguntas asociadas a encuestas específicas
-- 5. Respuestas asociadas a encuestas específicas
-- ============================================================================
