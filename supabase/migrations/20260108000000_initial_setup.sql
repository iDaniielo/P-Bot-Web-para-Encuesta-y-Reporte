-- Migration: Initial setup
-- Created at: 2026-01-08

-- ============================================================================
-- 1. CREAR SCHEMA API
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS api;

-- ============================================================================
-- 2. CREAR TABLA DE ENCUESTAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS api.encuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    regalo TEXT[] NOT NULL,
    regalo_otro TEXT,
    lugar_compra TEXT NOT NULL,
    gasto TEXT NOT NULL
);

-- ============================================================================
-- 3. CREAR TABLA DE PREGUNTAS DINÁMICAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS api.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_key TEXT NOT NULL UNIQUE,
    question_type TEXT NOT NULL CHECK (question_type IN ('text', 'phone', 'checkbox', 'radio', 'select')),
    options JSONB,
    validation_rules JSONB,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. CREAR ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_survey_questions_order 
ON api.survey_questions(order_index);

CREATE INDEX IF NOT EXISTS idx_survey_questions_active 
ON api.survey_questions(is_active);

CREATE INDEX IF NOT EXISTS idx_encuestas_created 
ON api.encuestas(created_at DESC);

-- ============================================================================
-- 5. CREAR FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 6. CREAR TRIGGER PARA updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_survey_questions_updated_at ON api.survey_questions;

CREATE TRIGGER update_survey_questions_updated_at
    BEFORE UPDATE ON api.survey_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE api.encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.survey_questions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. POLÍTICAS RLS PARA ENCUESTAS
-- ============================================================================

-- Permitir inserts públicos (para el formulario de encuesta)
DROP POLICY IF EXISTS "allow_public_insert_encuestas" ON api.encuestas;
CREATE POLICY "allow_public_insert_encuestas" 
ON api.encuestas
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Permitir selects solo a usuarios autenticados (dashboard)
DROP POLICY IF EXISTS "allow_authenticated_select_encuestas" ON api.encuestas;
CREATE POLICY "allow_authenticated_select_encuestas" 
ON api.encuestas
FOR SELECT 
TO authenticated 
USING (true);

-- ============================================================================
-- 9. POLÍTICAS RLS PARA PREGUNTAS
-- ============================================================================

-- Permitir lectura pública de preguntas (para el formulario)
DROP POLICY IF EXISTS "allow_all_select_questions" ON api.survey_questions;
CREATE POLICY "allow_all_select_questions" 
ON api.survey_questions
FOR SELECT 
USING (true);

-- Permitir insert solo a autenticados (gestión de preguntas)
DROP POLICY IF EXISTS "allow_authenticated_insert_questions" ON api.survey_questions;
CREATE POLICY "allow_authenticated_insert_questions" 
ON api.survey_questions
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permitir update solo a autenticados
DROP POLICY IF EXISTS "allow_authenticated_update_questions" ON api.survey_questions;
CREATE POLICY "allow_authenticated_update_questions" 
ON api.survey_questions
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Permitir delete solo a autenticados
DROP POLICY IF EXISTS "allow_authenticated_delete_questions" ON api.survey_questions;
CREATE POLICY "allow_authenticated_delete_questions" 
ON api.survey_questions
FOR DELETE 
TO authenticated 
USING (true);

-- ============================================================================
-- 10. GRANT PERMISOS DEL SCHEMA
-- ============================================================================
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT ALL ON api.survey_questions TO authenticated;
GRANT SELECT ON api.survey_questions TO anon;
GRANT ALL ON api.encuestas TO authenticated;
GRANT INSERT ON api.encuestas TO anon;
