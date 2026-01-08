-- ============================================================================
-- FIX DASHBOARD FUNCTIONS - Move from api schema to public schema
-- ============================================================================
-- This fixes the issue where get_survey_dashboard RPC function cannot be found
-- by the Supabase client because it's looking in the public schema
-- ============================================================================

-- 1. DROP OLD FUNCTIONS FROM api SCHEMA (if they exist)
-- ============================================================================
DROP FUNCTION IF EXISTS api.calculate_question_statistics(UUID, UUID);
DROP FUNCTION IF EXISTS api.get_survey_dashboard(UUID);
DROP VIEW IF EXISTS api.survey_statistics_summary;

-- 2. CREATE FUNCTION FOR CALCULATING QUESTION STATISTICS IN PUBLIC SCHEMA
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_question_statistics(
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
           (SELECT COUNT(*) FROM public.encuestas WHERE survey_id = p_survey_id)
    INTO v_question_type, v_question_key, v_options, v_total_responses
    FROM public.survey_questions
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
                        FROM public.encuestas
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
                FROM public.encuestas
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
            FROM public.encuestas
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
            FROM public.encuestas
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

-- 3. CREATE VIEW FOR SURVEY STATISTICS SUMMARY IN PUBLIC SCHEMA
-- ============================================================================
CREATE OR REPLACE VIEW public.survey_statistics_summary AS
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
FROM public.surveys s
LEFT JOIN public.survey_questions sq ON sq.survey_id = s.id AND sq.is_active = true
LEFT JOIN public.encuestas e ON e.survey_id = s.id
WHERE s.status = 'active'
GROUP BY s.id, s.title, s.slug;

-- 4. CREATE FUNCTION TO GET COMPLETE DASHBOARD IN PUBLIC SCHEMA
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_survey_dashboard(p_survey_id UUID)
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
    FROM public.survey_statistics_summary
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
            'statistics', public.calculate_question_statistics(p_survey_id, sq.id)
        )
        ORDER BY sq.order_index
    )
    INTO v_questions
    FROM public.survey_questions sq
    WHERE sq.survey_id = p_survey_id AND sq.is_active = true;

    -- Combinar resultados
    v_result := v_result || jsonb_build_object('questions', COALESCE(v_questions, '[]'::jsonb));

    RETURN v_result;
END;
$$;

-- 5. GRANT PERMISSIONS
-- ============================================================================
-- Permitir que usuarios autenticados y anónimos ejecuten las funciones
GRANT EXECUTE ON FUNCTION public.calculate_question_statistics(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_survey_dashboard(UUID) TO authenticated, anon;

-- Permitir lectura de la vista de resumen
GRANT SELECT ON public.survey_statistics_summary TO authenticated, anon;

-- 6. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON FUNCTION public.calculate_question_statistics IS 
'Calcula estadísticas específicas para una pregunta según su tipo (multiple choice, rating, boolean, text)';

COMMENT ON FUNCTION public.get_survey_dashboard IS 
'Obtiene un dashboard completo con todas las estadísticas de una encuesta';

COMMENT ON VIEW public.survey_statistics_summary IS 
'Vista con resumen de estadísticas básicas de cada encuesta activa';

-- ============================================================================
-- MIGRATION COMPLETED
-- ============================================================================
-- The functions are now in the public schema and will be accessible via
-- Supabase RPC calls
-- ============================================================================
