-- ============================================================================
-- ESQUEMA DE PREGUNTAS DINÁMICAS PARA ENCUESTAS
-- ============================================================================
-- Ejecuta este script en Supabase SQL Editor
-- https://app.supabase.com/project/ykhrhzckfklnoakldncq/sql/new
-- ============================================================================

-- Crear tabla para almacenar preguntas de encuesta
CREATE TABLE IF NOT EXISTS api.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_key TEXT NOT NULL UNIQUE, -- Clave única para identificar la pregunta (ej: 'nombre', 'regalo')
    question_type TEXT NOT NULL CHECK (question_type IN ('text', 'phone', 'checkbox', 'radio', 'select')),
    options JSONB, -- Opciones para checkbox, radio, select (ej: ["Opción 1", "Opción 2"])
    validation_rules JSONB, -- Reglas de validación (ej: {"required": true, "minLength": 2})
    order_index INTEGER NOT NULL DEFAULT 0, -- Orden de aparición en el formulario
    is_active BOOLEAN DEFAULT true, -- Si la pregunta está activa o no
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear índice para ordenamiento
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON api.survey_questions(order_index);
CREATE INDEX IF NOT EXISTS idx_survey_questions_active ON api.survey_questions(is_active);

-- Enable Row Level Security
ALTER TABLE api.survey_questions ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer preguntas activas (para el formulario)
CREATE POLICY "Allow api read active questions" ON api.survey_questions
    FOR SELECT
    USING (is_active = true);

-- Política: Solo usuarios autenticados pueden insertar/actualizar/eliminar
CREATE POLICY "Allow authenticated insert" ON api.survey_questions
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON api.survey_questions
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON api.survey_questions
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- DATOS INICIALES - Migración de preguntas actuales
-- ============================================================================

-- Insertar preguntas actuales del sistema
INSERT INTO api.survey_questions (question_text, question_key, question_type, options, validation_rules, order_index) VALUES
('¿Cuál es tu nombre?', 'nombre', 'text', NULL, '{"required": true, "minLength": 2}', 1),
('¿Cuál es tu número de teléfono?', 'telefono', 'phone', NULL, '{"required": true, "pattern": "^\\d{10}$"}', 2),
('¿Qué regalas en Navidad?', 'regalo', 'checkbox', '["Ropa", "Juguetes", "Electrónicos", "Libros", "Tarjetas de regalo", "Otro"]', '{"required": true}', 3),
('¿Dónde lo compras?', 'lugar', 'select', '["Centro comercial", "Tienda en línea", "Tienda local", "Mercado", "Amazon", "Otro"]', '{"required": true}', 4),
('¿Cuánto gastas?', 'gasto', 'radio', '["Menos de $500", "$500 - $1,000", "$1,000 - $2,000", "$2,000 - $5,000", "Más de $5,000"]', '{"required": true}', 5)
ON CONFLICT (question_key) DO NOTHING;

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_survey_questions_updated_at 
    BEFORE UPDATE ON api.survey_questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que las preguntas se insertaron correctamente
SELECT 
    question_key,
    question_text,
    question_type,
    order_index,
    is_active
FROM api.survey_questions
ORDER BY order_index;

-- ============================================================================
-- FINALIZADO
-- ============================================================================
-- Las preguntas ahora están almacenadas en la base de datos
-- Puedes gestionarlas desde el dashboard
-- ============================================================================
