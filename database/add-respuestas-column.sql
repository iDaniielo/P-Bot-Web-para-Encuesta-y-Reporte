-- Agregar columna respuestas para almacenar todas las respuestas en formato JSON
-- Esto permite flexibilidad para preguntas dinámicas

-- Verificar si la columna ya existe antes de agregarla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'api' 
        AND table_name = 'encuestas' 
        AND column_name = 'respuestas'
    ) THEN
        ALTER TABLE api.encuestas 
        ADD COLUMN respuestas jsonb DEFAULT '{}'::jsonb;
        
        RAISE NOTICE 'Columna respuestas agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna respuestas ya existe';
    END IF;
END $$;

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'api' 
AND table_name = 'encuestas'
ORDER BY ordinal_position;
