-- ============================================================================
-- MIGRACIÓN PARA SISTEMA DE DASHBOARD DINÁMICO
-- ============================================================================
-- Este script actualiza el sistema para soportar dashboards dinámicos
-- con diferentes tipos de preguntas y estadísticas adaptativas
-- ============================================================================

-- 1. ACTUALIZAR TIPOS DE PREGUNTAS PERMITIDOS
-- ============================================================================
-- Ampliar los tipos de preguntas soportados para incluir rating, boolean y number
-- Nota: No se puede modificar directamente un CHECK constraint, necesitamos recrearlo

-- Primero, eliminar el constraint existente si existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_schema = 'api' 
        AND table_name = 'survey_questions' 
        AND constraint_name LIKE '%question_type%'
    ) THEN
        ALTER TABLE api.survey_questions DROP CONSTRAINT IF EXISTS survey_questions_question_type_check;
    END IF;
END $$;

-- Agregar nuevo constraint con tipos adicionales
ALTER TABLE api.survey_questions 
ADD CONSTRAINT survey_questions_question_type_check 
CHECK (question_type IN ('text', 'phone', 'checkbox', 'radio', 'select', 'rating', 'boolean', 'number'));

-- 2. CREAR FUNCIÓN PARA CALCULAR ESTADÍSTICAS POR TIPO DE PREGUNTA
-- ============================================================================

CREATE OR REPLACE FUNCTION api.calculate_question_statistics(
    p_survey_id UUID,
    p_question_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_question_type TEXT;
    v_question_key TEXT;
    v_options JSONB;
    v_result JSONB;
    v_total_responses INTEGER;
BEGIN
    -- Obtener información de la pregunta
    SELECT question_type, question_key, options, 
           (SELECT COUNT(*) FROM api.encuestas WHERE survey_id = p_survey_id)
    INTO v_question_type, v_question_key, v_options, v_total_responses
    FROM api.survey_questions
    WHERE id = p_question_id AND survey_id = p_survey_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Pregunta no encontrada');
    END IF;

    -- Calcular estadísticas según el tipo de pregunta
    CASE v_question_type
        -- Preguntas de opción múltiple (checkbox, radio, select)
        WHEN 'checkbox', 'radio', 'select' THEN
            SELECT jsonb_build_object(
                'type', v_question_type,
                'total_responses', v_total_responses,
                'distribution', (
                    SELECT jsonb_object_agg(value, count)
                    FROM (
                        SELECT 
                            COALESCE(respuestas->v_question_key, 'Sin respuesta') as value,
                            COUNT(*) as count
                        FROM api.encuestas
                        WHERE survey_id = p_survey_id 
                        AND respuestas IS NOT NULL
                        GROUP BY respuestas->v_question_key
                    ) sub
                )
            ) INTO v_result;

        -- Preguntas de rating (calificación numérica)
        WHEN 'rating', 'number' THEN
            SELECT jsonb_build_object(
                'type', v_question_type,
                'total_responses', COUNT(*),
                'average', ROUND(AVG((respuestas->>v_question_key)::numeric), 2),
                'min', MIN((respuestas->>v_question_key)::numeric),
                'max', MAX((respuestas->>v_question_key)::numeric),
                'distribution', jsonb_object_agg(
                    respuestas->>v_question_key,
                    count
                )
            ) INTO v_result
            FROM (
                SELECT 
                    respuestas->>v_question_key,
                    COUNT(*) as count
                FROM api.encuestas
                WHERE survey_id = p_survey_id 
                AND respuestas IS NOT NULL
                AND respuestas->>v_question_key IS NOT NULL
                GROUP BY respuestas->>v_question_key
            ) sub;

        -- Preguntas booleanas (Sí/No)
        WHEN 'boolean' THEN
            SELECT jsonb_build_object(
                'type', 'boolean',
                'total_responses', v_total_responses,
                'yes_count', COUNT(*) FILTER (WHERE (respuestas->>v_question_key)::boolean = true),
                'no_count', COUNT(*) FILTER (WHERE (respuestas->>v_question_key)::boolean = false),
                'yes_percentage', ROUND(
                    COUNT(*) FILTER (WHERE (respuestas->>v_question_key)::boolean = true)::numeric / 
                    NULLIF(v_total_responses, 0) * 100, 
                    2
                ),
                'no_percentage', ROUND(
                    COUNT(*) FILTER (WHERE (respuestas->>v_question_key)::boolean = false)::numeric / 
                    NULLIF(v_total_responses, 0) * 100, 
                    2
                )
            ) INTO v_result
            FROM api.encuestas
            WHERE survey_id = p_survey_id 
            AND respuestas IS NOT NULL;

        -- Preguntas de texto abierto
        WHEN 'text', 'phone' THEN
            SELECT jsonb_build_object(
                'type', v_question_type,
                'total_responses', COUNT(*),
                'responses', jsonb_agg(
                    jsonb_build_object(
                        'value', respuestas->>v_question_key,
                        'created_at', created_at
                    )
                    ORDER BY created_at DESC
                    LIMIT 100
                )
            ) INTO v_result
            FROM api.encuestas
            WHERE survey_id = p_survey_id 
            AND respuestas IS NOT NULL
            AND respuestas->>v_question_key IS NOT NULL;

        ELSE
            v_result := jsonb_build_object(
                'type', v_question_type,
                'total_responses', v_total_responses,
                'message', 'Tipo de pregunta no soportado para estadísticas'
            );
    END CASE;

    RETURN v_result;
END;
$$;

-- 3. CREAR VISTA PARA RESUMEN DE ESTADÍSTICAS DE ENCUESTA
-- ============================================================================

CREATE OR REPLACE VIEW api.survey_statistics_summary AS
SELECT 
    s.id as survey_id,
    s.title as survey_title,
    s.slug as survey_slug,
    COUNT(DISTINCT e.id) as total_responses,
    COUNT(DISTINCT sq.id) as total_questions,
    MAX(e.created_at) as last_response_at,
    MIN(e.created_at) as first_response_at,
    -- Tasa de completitud (asumiendo que respuestas con datos son completas)
    ROUND(
        COUNT(DISTINCT e.id) FILTER (WHERE e.respuestas IS NOT NULL)::numeric / 
        NULLIF(COUNT(DISTINCT e.id), 0) * 100,
        2
    ) as completion_rate
FROM api.surveys s
LEFT JOIN api.survey_questions sq ON sq.survey_id = s.id AND sq.is_active = true
LEFT JOIN api.encuestas e ON e.survey_id = s.id
WHERE s.status = 'active'
GROUP BY s.id, s.title, s.slug;

-- 4. CREAR FUNCIÓN PARA OBTENER DASHBOARD COMPLETO DE UNA ENCUESTA
-- ============================================================================

CREATE OR REPLACE FUNCTION api.get_survey_dashboard(p_survey_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
    v_questions JSONB;
BEGIN
    -- Obtener resumen general
    SELECT jsonb_build_object(
        'survey_id', survey_id,
        'survey_title', survey_title,
        'survey_slug', survey_slug,
        'total_responses', total_responses,
        'total_questions', total_questions,
        'last_response_at', last_response_at,
        'first_response_at', first_response_at,
        'completion_rate', completion_rate
    )
    INTO v_result
    FROM api.survey_statistics_summary
    WHERE survey_id = p_survey_id;

    -- Si no existe la encuesta
    IF v_result IS NULL THEN
        RETURN jsonb_build_object('error', 'Encuesta no encontrada');
    END IF;

    -- Obtener estadísticas de cada pregunta
    SELECT jsonb_agg(
        jsonb_build_object(
            'question_id', sq.id,
            'question_text', sq.question_text,
            'question_key', sq.question_key,
            'question_type', sq.question_type,
            'options', sq.options,
            'statistics', api.calculate_question_statistics(p_survey_id, sq.id)
        )
        ORDER BY sq.order_index
    )
    INTO v_questions
    FROM api.survey_questions sq
    WHERE sq.survey_id = p_survey_id AND sq.is_active = true;

    -- Combinar resultados
    v_result := v_result || jsonb_build_object('questions', COALESCE(v_questions, '[]'::jsonb));

    RETURN v_result;
END;
$$;

-- 5. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Índice para búsquedas por survey_id en respuestas
CREATE INDEX IF NOT EXISTS idx_encuestas_survey_respuestas 
ON api.encuestas(survey_id) 
WHERE respuestas IS NOT NULL;

-- Índice GIN para búsquedas dentro del JSONB respuestas
CREATE INDEX IF NOT EXISTS idx_encuestas_respuestas_gin 
ON api.encuestas USING gin(respuestas);

-- Índice para preguntas activas por encuesta
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_active 
ON api.survey_questions(survey_id, is_active, order_index);

-- 6. PERMISOS
-- ============================================================================

-- Permitir que usuarios autenticados y anónimos ejecuten la función de estadísticas
GRANT EXECUTE ON FUNCTION api.calculate_question_statistics(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION api.get_survey_dashboard(UUID) TO authenticated, anon;

-- Permitir lectura de la vista de resumen
GRANT SELECT ON api.survey_statistics_summary TO authenticated, anon;

-- 7. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON FUNCTION api.calculate_question_statistics IS 
'Calcula estadísticas específicas para una pregunta según su tipo (multiple choice, rating, boolean, text)';

COMMENT ON FUNCTION api.get_survey_dashboard IS 
'Obtiene un dashboard completo con todas las estadísticas de una encuesta';

COMMENT ON VIEW api.survey_statistics_summary IS 
'Vista con resumen de estadísticas básicas de cada encuesta activa';

-- ============================================================================
-- MIGRACIÓN COMPLETADA
-- ============================================================================
-- El sistema ahora soporta:
-- 1. Tipos de preguntas adicionales: rating, boolean, number
-- 2. Función para calcular estadísticas por tipo de pregunta
-- 3. Función para obtener dashboard completo de encuesta
-- 4. Vista de resumen de estadísticas
-- 5. Índices para optimizar consultas
-- ============================================================================
