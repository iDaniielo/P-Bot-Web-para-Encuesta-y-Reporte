-- Activar todas las preguntas para que aparezcan en la encuesta pública
UPDATE api.survey_questions
SET is_active = true
WHERE is_active = false OR is_active IS NULL;

-- Verificar el estado de las preguntas
SELECT id, question_text, question_key, is_active, order_index
FROM api.survey_questions
ORDER BY order_index;
`