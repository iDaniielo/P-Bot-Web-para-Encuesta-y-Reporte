-- SOLUCIÓN RÁPIDA - DESHABILITAR RLS Y DAR TODOS LOS PERMISOS

-- Deshabilitar RLS completamente
ALTER TABLE public.encuestas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions DISABLE ROW LEVEL SECURITY;

-- Dar todos los permisos
GRANT ALL PRIVILEGES ON public.encuestas TO anon;
GRANT ALL PRIVILEGES ON public.encuestas TO authenticated;
GRANT ALL PRIVILEGES ON public.survey_questions TO anon;
GRANT ALL PRIVILEGES ON public.survey_questions TO authenticated;

-- Verificar
SELECT 'Permisos otorgados correctamente' as status;
