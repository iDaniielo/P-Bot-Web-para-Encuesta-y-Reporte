# 🚀 Guía de Migración: Sistema Multi-Encuestas

## 📋 Resumen de Cambios

El sistema ha sido actualizado para soportar **múltiples encuestas** en lugar de una sola encuesta con preguntas dinámicas. Ahora puedes:

- ✅ Crear múltiples encuestas independientes
- ✅ Agrupar encuestas por categorías
- ✅ Gestionar preguntas por cada encuesta
- ✅ Permitir a los usuarios elegir qué encuesta responder
- ✅ Mantener todo el historial de respuestas existente

## 🗄️ Paso 1: Migración de Base de Datos

### 1.1 Ejecutar Script de Migración

1. Abre tu proyecto en [Supabase](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Abre el archivo: `database/multi-survey-migration.sql`
4. Copia todo el contenido
5. Pégalo en el editor SQL
6. Haz clic en **Run**

### 1.2 ¿Qué hace este script?

El script:
- Crea las tablas `surveys` (encuestas) y `survey_groups` (grupos)
- Agrega columnas `survey_id` a las tablas `survey_questions` y `encuestas`
- Crea una encuesta por defecto llamada "Encuesta Navideña 2024"
- Crea un grupo por defecto llamado "Encuestas Navideñas"
- Asigna todas las preguntas y respuestas existentes a la encuesta por defecto
- Configura políticas de seguridad RLS para las nuevas tablas

### 1.3 Verificar Migración

Ejecuta esta consulta en SQL Editor para verificar:

```sql
-- Verificar que las tablas fueron creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'api' 
  AND table_name IN ('surveys', 'survey_groups');

-- Verificar encuesta por defecto
SELECT * FROM api.surveys;

-- Verificar que las preguntas están asociadas
SELECT COUNT(*) as total_questions, survey_id 
FROM api.survey_questions 
GROUP BY survey_id;

-- Verificar que las respuestas están asociadas
SELECT COUNT(*) as total_responses, survey_id 
FROM api.encuestas 
GROUP BY survey_id;
```

## 🎨 Paso 2: Usar las Nuevas Funcionalidades

### 2.1 Gestión de Encuestas

1. Inicia sesión en el dashboard
2. Ve a **Dashboard** → **📋 Gestión de Encuestas**
3. Aquí puedes:
   - Crear nuevos grupos de encuestas
   - Crear nuevas encuestas
   - Editar o eliminar encuestas existentes
   - Cambiar el estado de las encuestas (Borrador/Activa/Archivada)

### 2.2 Gestión de Preguntas por Encuesta

1. Ve a **Dashboard** → **⚙️ Gestión de Preguntas**
2. En la parte superior, verás un **selector de encuesta**
3. Selecciona la encuesta para la que quieres gestionar preguntas
4. Agrega, edita o elimina preguntas específicas para esa encuesta

### 2.3 Responder Encuestas

Ahora los usuarios pueden:
- Ver todas las encuestas activas en la página principal
- Seleccionar qué encuesta responder
- Las encuestas están organizadas por grupos

## 📊 Estructura de Datos

### Tabla: `surveys` (Encuestas)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único de la encuesta |
| title | TEXT | Título de la encuesta |
| description | TEXT | Descripción (opcional) |
| survey_group_id | UUID | ID del grupo (opcional) |
| status | TEXT | Estado: 'draft', 'active', 'archived' |
| created_by | UUID | Usuario que creó la encuesta |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### Tabla: `survey_groups` (Grupos)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del grupo |
| name | TEXT | Nombre del grupo |
| description | TEXT | Descripción (opcional) |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### Relaciones

```
survey_groups
    ↓ (1:N)
surveys
    ↓ (1:N)
survey_questions
    
surveys
    ↓ (1:N)
encuestas (respuestas)
```

## 🔄 Migración de Datos Existentes

### Automática (Ya Incluida en el Script)

El script de migración automáticamente:
- Crea una encuesta por defecto con ID: `00000000-0000-0000-0000-000000000001`
- Asigna todas las preguntas existentes a esta encuesta
- Asigna todas las respuestas existentes a esta encuesta

### Manual (Si es Necesario)

Si tienes preguntas o respuestas sin `survey_id`:

```sql
-- Asignar preguntas sin encuesta a la encuesta por defecto
UPDATE api.survey_questions 
SET survey_id = '00000000-0000-0000-0000-000000000001'
WHERE survey_id IS NULL;

-- Asignar respuestas sin encuesta a la encuesta por defecto
UPDATE api.encuestas 
SET survey_id = '00000000-0000-0000-0000-000000000001'
WHERE survey_id IS NULL;
```

## 🎯 Casos de Uso

### Ejemplo 1: Encuestas Navideñas por Año

```
Grupo: "Encuestas Navideñas"
├── Encuesta Navideña 2024
├── Encuesta Navideña 2025
└── Encuesta de Propósitos 2025
```

### Ejemplo 2: Múltiples Departamentos

```
Grupo: "Recursos Humanos"
├── Satisfacción Laboral
├── Evaluación de Desempeño
└── Clima Organizacional

Grupo: "Ventas"
├── Satisfacción del Cliente
└── Feedback de Producto
```

### Ejemplo 3: Eventos

```
Grupo: "Conferencia TechCon 2025"
├── Registro Pre-Evento
├── Encuesta Post-Sesión Mañana
├── Encuesta Post-Sesión Tarde
└── Evaluación General
```

## 🛠️ API Endpoints Nuevos

### Encuestas

```typescript
// Listar todas las encuestas
GET /api/surveys
GET /api/surveys?status=active
GET /api/surveys?groupId=<group_id>

// Crear encuesta
POST /api/surveys
Body: {
  title: string,
  description?: string,
  survey_group_id?: string,
  status?: 'draft' | 'active' | 'archived'
}

// Actualizar encuesta
PATCH /api/surveys
Body: {
  id: string,
  title?: string,
  description?: string,
  survey_group_id?: string,
  status?: 'draft' | 'active' | 'archived'
}

// Eliminar encuesta
DELETE /api/surveys?id=<survey_id>
```

### Grupos

```typescript
// Listar grupos
GET /api/survey-groups

// Crear grupo
POST /api/survey-groups
Body: {
  name: string,
  description?: string
}

// Actualizar grupo
PATCH /api/survey-groups
Body: {
  id: string,
  name?: string,
  description?: string
}

// Eliminar grupo
DELETE /api/survey-groups?id=<group_id>
```

### Preguntas (Actualizado)

```typescript
// Listar preguntas de una encuesta específica
GET /api/questions?surveyId=<survey_id>

// Crear pregunta para una encuesta
POST /api/questions
Body: {
  survey_id: string,
  question_text: string,
  question_key: string,
  question_type: 'text' | 'phone' | 'checkbox' | 'radio' | 'select',
  options?: string[],
  // ... otros campos
}
```

## 📝 Notas Importantes

### Estados de Encuesta

- **draft**: Borrador - No visible para usuarios públicos
- **active**: Activa - Visible en la página principal
- **archived**: Archivada - No visible pero mantiene los datos

### Eliminación en Cascada

- **Eliminar un grupo**: Las encuestas quedan sin grupo (no se eliminan)
- **Eliminar una encuesta**: Se eliminan todas sus preguntas y respuestas asociadas
- ⚠️ **¡Ten cuidado!** Eliminar una encuesta borra permanentemente todas sus respuestas

### Retrocompatibilidad

El sistema mantiene compatibilidad con:
- URLs antiguas (`/encuesta`) → Ahora abre la encuesta por defecto
- Preguntas sin `survey_id` → Se asignan automáticamente a la encuesta por defecto
- Respuestas sin `survey_id` → Se asignan automáticamente a la encuesta por defecto

## 🐛 Solución de Problemas

### Error: "No hay encuestas disponibles"

**Solución:**
1. Ve a la gestión de encuestas
2. Verifica que existe al menos una encuesta con estado "active"
3. Si no existe, crea una nueva o cambia el estado de una existente

### Error: "No hay preguntas creadas"

**Solución:**
1. Asegúrate de haber seleccionado una encuesta en el selector
2. Ve a la gestión de preguntas
3. Crea preguntas para esa encuesta específica

### Las preguntas no aparecen en la encuesta

**Solución:**
```sql
-- Verificar que las preguntas están asociadas correctamente
SELECT 
  sq.id,
  sq.question_text,
  sq.survey_id,
  s.title as survey_title,
  sq.is_active
FROM api.survey_questions sq
LEFT JOIN api.surveys s ON s.id = sq.survey_id
WHERE sq.survey_id = '<tu_survey_id>';

-- Si survey_id es NULL, asignar:
UPDATE api.survey_questions 
SET survey_id = '<tu_survey_id>'
WHERE id = '<question_id>';
```

## 📞 Soporte

Si tienes problemas con la migración:
1. Revisa esta guía completa
2. Verifica que ejecutaste el script SQL correctamente
3. Consulta los logs en Supabase
4. Abre un issue en GitHub con detalles del error

---

**Última actualización:** Enero 2025  
**Versión:** 2.0.0 - Sistema Multi-Encuestas
