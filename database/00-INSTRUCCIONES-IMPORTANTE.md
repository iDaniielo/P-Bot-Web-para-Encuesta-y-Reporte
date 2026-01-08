# 🚨 INSTRUCCIONES IMPORTANTES - Base de Datos

## Problema: "Invalid schema: api"

Este error ocurre cuando el esquema `api` no existe en tu base de datos Supabase o las tablas no están creadas correctamente.

## ✅ Solución - Ejecutar scripts en orden

### Paso 1: Acceder al SQL Editor de Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. En el menú lateral, busca **SQL Editor**
4. Haz clic en **New query**

### Paso 2: Ejecutar el script principal

1. Copia **TODO** el contenido del archivo `setup-complete.sql`
2. Pégalo en el editor SQL de Supabase
3. Haz clic en **RUN** (o presiona Ctrl+Enter)
4. Espera a que se complete (debería decir "Success")

### Paso 3: Agregar columna respuestas (si no existe)

1. Copia el contenido de `add-respuestas-column.sql`
2. Pégalo en una nueva query
3. Haz clic en **RUN**

### Paso 4: Activar todas las preguntas (opcional)

1. Copia el contenido de `activate-all-questions.sql`
2. Pégalo en una nueva query
3. Haz clic en **RUN**

## 🔍 Verificar que funciona

Ejecuta esta query en SQL Editor:

```sql
-- Verificar que el esquema api existe
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'api';

-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'api';

-- Verificar columnas de encuestas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'api' 
AND table_name = 'encuestas';

-- Verificar columnas de survey_questions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'api' 
AND table_name = 'survey_questions';
```

Si ves resultados, ¡todo está bien! 🎉

## 📝 Orden de ejecución completo

1. ✅ `setup-complete.sql` - Crea esquema, tablas, políticas
2. ✅ `add-respuestas-column.sql` - Agrega columna JSON para respuestas
3. ✅ `activate-all-questions.sql` - Activa todas las preguntas
4. (Opcional) `fix-permissions-simple.sql` - Solo si hay problemas de permisos

## ⚠️ Errores comunes

### Error: "relation api.encuestas does not exist"
👉 Ejecuta `setup-complete.sql`

### Error: "schema api does not exist"  
👉 Ejecuta `setup-complete.sql`

### Error: "column respuestas does not exist"
👉 Ejecuta `add-respuestas-column.sql`

### Error de permisos al insertar
👉 Ejecuta `fix-permissions-simple.sql`

## 🎯 Después de ejecutar los scripts

1. Reinicia tu aplicación (Ctrl+C en terminal y luego `npm run dev`)
2. Prueba registrarte y contestar una encuesta
3. Debería funcionar sin errores

---

**Nota:** Los scripts están diseñados para ser seguros - no borrarán datos existentes y verifican antes de crear objetos.
