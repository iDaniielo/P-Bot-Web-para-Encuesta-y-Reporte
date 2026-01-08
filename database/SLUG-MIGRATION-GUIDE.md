# 🚀 Cómo Aplicar la Migración de Multi-Encuestas

Este documento explica cómo aplicar la migración de base de datos para habilitar el sistema de múltiples encuestas con URLs slug-friendly.

## 📋 Prerrequisitos

- Acceso al panel de Supabase
- Permisos de administrador en la base de datos

## 🔧 Pasos para Aplicar la Migración

### 1. Ejecutar la Migración Principal (si no se ha ejecutado)

Si aún no has aplicado la migración multi-survey, primero ejecuta:

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Abre el archivo: `database/multi-survey-migration.sql`
4. Copia todo el contenido
5. Pégalo en el editor SQL
6. Haz clic en **Run**

### 2. Agregar Soporte para Slugs

Ahora ejecuta la migración de slugs:

1. En **SQL Editor** de Supabase
2. Abre el archivo: `database/add-slug-to-surveys.sql`
3. Copia todo el contenido
4. Pégalo en el editor SQL
5. Haz clic en **Run**

Esta migración hará lo siguiente:
- ✅ Agregará la columna `slug` a la tabla `surveys`
- ✅ Creará un índice para búsquedas rápidas por slug
- ✅ Agregará la función `generate_slug()` para auto-generar slugs
- ✅ Creará un trigger para auto-generar slugs en inserciones
- ✅ Actualizará la encuesta por defecto con el slug `navidad`
- ✅ Generará slugs para cualquier encuesta existente sin slug

## 🧪 Verificar la Migración

Ejecuta esta consulta para verificar que todo funcionó correctamente:

```sql
-- Verificar que la columna slug existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'api'
  AND table_name = 'surveys'
  AND column_name = 'slug';

-- Verificar encuestas con sus slugs
SELECT id, title, slug, status
FROM api.surveys
ORDER BY created_at DESC;

-- Verificar que el índice se creó
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'api'
  AND tablename = 'surveys'
  AND indexname = 'idx_surveys_slug';
```

Deberías ver:
1. La columna `slug` de tipo `text`
2. Todas las encuestas con slugs únicos
3. La encuesta "Navideña" con slug `navidad`
4. El índice `idx_surveys_slug` creado

## 🎯 Probar el Sistema

### 1. Acceder a Encuestas por Slug

Ahora puedes acceder a las encuestas usando URLs amigables:

```
https://tu-dominio.com/encuesta/navidad
https://tu-dominio.com/encuesta/satisfaccion-2026
https://tu-dominio.com/encuesta/servicio-cliente
```

### 2. Ver Todas las Encuestas Activas

```
https://tu-dominio.com/encuestas
```

### 3. Gestionar Encuestas desde el Dashboard

```
https://tu-dominio.com/dashboard/surveys
```

Aquí podrás:
- ✅ Crear nuevas encuestas
- ✅ Editar encuestas existentes
- ✅ Cambiar el estado (borrador/activa/archivada)
- ✅ Ver estadísticas (# preguntas, # respuestas)
- ✅ Modificar el slug manualmente si es necesario

## 🔄 Cómo Funcionan los Slugs

### Generación Automática

Cuando creas una nueva encuesta, el slug se genera automáticamente desde el título:

| Título | Slug Generado |
|--------|---------------|
| "Encuesta Navidad 2024" | `navidad-2024` |
| "Satisfacción del Cliente" | `satisfaccion-del-cliente` |
| "Evaluación de Desempeño" | `evaluacion-de-desempeno` |

### Reglas de Generación

1. Convierte a minúsculas
2. Reemplaza espacios con guiones
3. Elimina acentos (á→a, é→e, etc.)
4. Elimina caracteres especiales
5. Limita a 100 caracteres
6. Si ya existe, agrega un número (ej: `encuesta-2`, `encuesta-3`)

### Personalización Manual

Puedes editar el slug manualmente en el formulario de edición de encuesta:
- El slug debe ser único
- Solo puede contener letras minúsculas, números y guiones
- Se validará al guardar

## ⚠️ Notas Importantes

### Slugs y URLs Antiguas

Si tienes URLs antiguas con IDs:
```
/encuesta?surveyId=uuid-aqui
```

Estas **seguirán funcionando** por retrocompatibilidad. Sin embargo, se recomienda migrar a:
```
/encuesta/slug-aqui
```

### Cambiar Slugs

⚠️ **PRECAUCIÓN:** Cambiar el slug de una encuesta activa romperá los enlaces compartidos.

Si necesitas cambiar un slug:
1. Actualiza todos los enlaces externos
2. Considera agregar una redirección en el servidor
3. Notifica a los usuarios del cambio

### Unicidad de Slugs

El sistema garantiza que todos los slugs sean únicos:
- La base de datos tiene una constraint UNIQUE
- La API valida antes de crear/actualizar
- Si hay conflicto, agrega un sufijo numérico

## 🐛 Solución de Problemas

### Error: "Slug already exists"

**Causa:** Intentas crear una encuesta con un slug que ya existe.

**Solución:**
1. Cambia el título para generar un slug diferente, o
2. Modifica el slug manualmente en el formulario

### Error: "Survey not found" al acceder por slug

**Causa:** El slug no existe o la encuesta no está activa.

**Solución:**
1. Verifica el slug en la base de datos:
```sql
SELECT id, title, slug, status FROM api.surveys WHERE slug = 'tu-slug';
```
2. Asegúrate de que el status sea 'active' para acceso público

### Las preguntas no aparecen en la encuesta

**Causa:** Las preguntas no tienen `survey_id` asignado.

**Solución:**
```sql
-- Asignar preguntas a una encuesta específica
UPDATE api.survey_questions
SET survey_id = 'id-de-tu-encuesta'
WHERE survey_id IS NULL;
```

## 📊 Crear Encuestas de Prueba

Una vez aplicada la migración, crea algunas encuestas de prueba:

### 1. Encuesta de Satisfacción

```sql
INSERT INTO api.surveys (title, description, slug, status)
VALUES (
  'Encuesta de Satisfacción 2026',
  'Cuéntanos tu experiencia con nuestros servicios',
  'satisfaccion-2026',
  'active'
);
```

### 2. Encuesta de Servicio al Cliente

```sql
INSERT INTO api.surveys (title, description, slug, status)
VALUES (
  'Servicio al Cliente',
  'Ayúdanos a mejorar nuestro servicio al cliente',
  'servicio-cliente',
  'active'
);
```

Luego agrega preguntas a estas encuestas desde el dashboard.

## 🔗 Enlaces Útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Migración Multi-Survey](database/MULTI-SURVEY-MIGRATION-GUIDE.md)
- [Esquema de Base de Datos](database/multi-survey-migration.sql)

## ✅ Checklist Final

Después de aplicar la migración, verifica:

- [ ] La columna `slug` existe en `api.surveys`
- [ ] Todas las encuestas tienen slugs únicos
- [ ] La encuesta "Navideña" tiene el slug `navidad`
- [ ] Puedes acceder a `/encuesta/navidad`
- [ ] Puedes ver la lista en `/encuestas`
- [ ] Puedes gestionar encuestas en `/dashboard/surveys`
- [ ] Los slugs se generan automáticamente al crear encuestas
- [ ] Las preguntas están asociadas a sus encuestas

---

**¿Necesitas ayuda?** Abre un issue en GitHub con los detalles del problema.
