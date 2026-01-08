-- Verificar columnas de la tabla encuestas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'api' 
AND table_name = 'encuestas'
ORDER BY ordinal_position;
