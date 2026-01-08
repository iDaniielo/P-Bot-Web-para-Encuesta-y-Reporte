# 📊 Sistema de Dashboard Dinámico y Exportación Excel

## 🎯 Descripción General

Este sistema implementa dashboards dinámicos y exportación a Excel que se adaptan automáticamente a la estructura de cada encuesta, sin necesidad de modificar código.

## ✨ Características Principales

### 1. Dashboard Dinámico por Encuesta
- **Widgets automáticos** según tipo de pregunta
- **Métricas generales**: total respuestas, completitud, última respuesta
- **Gráficos interactivos** con Recharts
- **Responsive** y optimizado para todos los dispositivos

### 2. Tipos de Pregunta Soportados

| Tipo | Descripción | Visualización |
|------|-------------|---------------|
| `checkbox` | Opción múltiple (varias respuestas) | Gráfico de pastel y barras |
| `radio` | Opción única | Gráfico de pastel y barras |
| `select` | Lista desplegable | Gráfico de pastel y barras |
| `rating` | Calificación numérica | Barras con promedio, min, max |
| `number` | Número libre | Barras con promedio, min, max |
| `boolean` | Sí/No | Gráfico de dona con porcentajes |
| `text` | Texto abierto | Lista de respuestas |
| `phone` | Teléfono | Lista de respuestas |

### 3. Exportación Excel Dinámica
Archivos `.xlsx` con 3 hojas:
- **Metadata**: Información de la encuesta
- **Respuestas**: Una columna por pregunta, una fila por respuesta
- **Estadísticas**: Métricas calculadas por tipo de pregunta

## 🚀 Instalación y Configuración

### Paso 1: Migración de Base de Datos

Ejecuta el script SQL en tu proyecto de Supabase:

```bash
# En Supabase SQL Editor, ejecuta:
database/dynamic-dashboard-migration.sql
```

Este script:
- ✅ Extiende tipos de pregunta (rating, boolean, number)
- ✅ Crea función `calculate_question_statistics()`
- ✅ Crea función `get_survey_dashboard()`
- ✅ Crea vista `survey_statistics_summary`
- ✅ Agrega índices para optimización

### Paso 2: Verificar Permisos

Asegúrate de que los permisos RLS están correctos:

```sql
-- Verificar permisos
SELECT * FROM information_schema.role_table_grants 
WHERE table_schema = 'api' 
AND grantee IN ('anon', 'authenticated');
```

### Paso 3: Desplegar la Aplicación

El código ya está listo. Solo necesitas hacer deploy:

```bash
# En Vercel, Railway, o tu plataforma preferida
git push origin main
```

## 📖 Uso del Sistema

### Crear una Encuesta con Diferentes Tipos de Preguntas

1. **Accede al Dashboard**: `/dashboard/surveys`

2. **Crea una nueva encuesta**: Click en "Nueva Encuesta"

3. **Agrega preguntas variadas**:

```javascript
// Ejemplo de preguntas por tipo:

// Pregunta de rating
{
  question_text: "¿Cómo calificarías el servicio?",
  question_key: "calificacion_servicio",
  question_type: "rating",
  options: ["1", "2", "3", "4", "5"],
  validation_rules: { min: 1, max: 5 }
}

// Pregunta booleana
{
  question_text: "¿Recomendarías nuestro producto?",
  question_key: "recomendacion",
  question_type: "boolean",
  validation_rules: { required: true }
}

// Pregunta de opción múltiple
{
  question_text: "¿Qué características te gustaron? (selecciona todas)",
  question_key: "caracteristicas",
  question_type: "checkbox",
  options: ["Precio", "Calidad", "Atención", "Rapidez"],
  validation_rules: { minSelected: 1 }
}

// Pregunta numérica
{
  question_text: "¿Cuántos productos compraste?",
  question_key: "cantidad_productos",
  question_type: "number",
  validation_rules: { min: 1, max: 100 }
}
```

### Ver el Dashboard Dinámico

1. **Desde el dashboard principal**: `/dashboard`
   - Verás tarjetas de "Dashboards Dinámicos por Encuesta"
   - Click en cualquier encuesta

2. **URL directa**: `/dashboard/[surveyId]`
   - Reemplaza `[surveyId]` con el UUID de tu encuesta

3. **Características del Dashboard**:
   - 📊 Métricas generales (total, completitud, última respuesta)
   - 📈 Widgets específicos por tipo de pregunta
   - 💾 Botón de exportar a Excel
   - 🔄 Actualización automática de datos

### Exportar a Excel

**Opción 1: Desde el dashboard dinámico**
```
/dashboard/[surveyId] → Click "Exportar a Excel"
```

**Opción 2: Llamada directa a la API**
```javascript
// Descarga programática
const response = await fetch(`/api/surveys/${surveyId}/export`);
const blob = await response.blob();
// Crear URL y descargar...
```

**Contenido del archivo Excel:**

- **Hoja "Metadata"**:
  - Título, descripción, slug
  - Total de preguntas y respuestas
  - Fechas de creación y última respuesta

- **Hoja "Respuestas"**:
  ```
  | ID | Fecha | Pregunta 1 | Pregunta 2 | Pregunta 3 | ... |
  ```

- **Hoja "Estadísticas"**:
  - Por cada pregunta:
    - Tipo de pregunta
    - Distribución de respuestas
    - Promedios (para rating/number)
    - Porcentajes (para boolean)

## 🔧 API Endpoints

### GET `/api/surveys/[surveyId]/dashboard`

Retorna datos completos para renderizar el dashboard.

**Respuesta:**
```json
{
  "survey_id": "uuid",
  "survey_title": "Mi Encuesta",
  "survey_slug": "mi-encuesta",
  "total_responses": 150,
  "total_questions": 8,
  "last_response_at": "2024-01-08T...",
  "completion_rate": 95.5,
  "questions": [
    {
      "question_id": "uuid",
      "question_text": "¿Cómo calificarías...?",
      "question_type": "rating",
      "statistics": {
        "type": "rating",
        "average": 4.2,
        "min": 1,
        "max": 5,
        "distribution": { "1": 5, "2": 10, "3": 20, "4": 50, "5": 65 }
      }
    }
  ]
}
```

### GET `/api/surveys/[surveyId]/statistics`

Retorna estadísticas detalladas.

**Query params opcionales:**
- `questionId`: Para obtener estadísticas de una pregunta específica

### GET `/api/surveys/[surveyId]/export`

Genera y descarga archivo Excel.

**Respuesta:** Archivo `.xlsx` con 3 hojas

## 🎨 Componentes

### `<DynamicDashboard surveyId={string} />`

Componente principal que renderiza el dashboard completo.

**Props:**
- `surveyId`: UUID de la encuesta

**Características:**
- Fetch automático de datos
- Loading states
- Error handling
- Botón de exportar Excel integrado

### `<StatisticWidget />`

Renderiza widgets específicos según tipo de pregunta.

**Props:**
- `questionText`: Texto de la pregunta
- `questionType`: Tipo de pregunta
- `statistics`: Objeto con estadísticas

**Widgets renderizados:**
- **MultipleChoiceWidget**: Pie chart + Bar chart
- **RatingWidget**: Métricas + Bar chart
- **BooleanWidget**: Donut chart + Desglose
- **TextWidget**: Lista de respuestas

## 📊 Funciones de Base de Datos

### `calculate_question_statistics(p_survey_id, p_question_id)`

Calcula estadísticas para una pregunta específica.

**Ejemplo de uso:**
```sql
SELECT api.calculate_question_statistics(
  '00000000-0000-0000-0000-000000000001'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid
);
```

### `get_survey_dashboard(p_survey_id)`

Obtiene dashboard completo de una encuesta.

**Ejemplo de uso:**
```sql
SELECT api.get_survey_dashboard(
  '00000000-0000-0000-0000-000000000001'::uuid
);
```

### Vista `survey_statistics_summary`

Vista materializada con resumen de encuestas.

**Ejemplo de consulta:**
```sql
SELECT * FROM api.survey_statistics_summary 
WHERE survey_slug = 'mi-encuesta';
```

## 🔍 Utilities

### `lib/statistics.ts`

Funciones de utilidad para calcular estadísticas:

```typescript
import { 
  calculateStatistics,
  getChartColor,
  formatPercentage 
} from '@/lib/statistics';

// Calcular estadísticas
const stats = calculateStatistics('rating', responses, 'calificacion');

// Obtener color para gráficos
const color = getChartColor(0); // #dc2626

// Formatear porcentaje
const formatted = formatPercentage(75.5); // "75.5%"
```

## 🧪 Testing

### Probar con Diferentes Tipos de Pregunta

```sql
-- Crear encuesta de prueba
INSERT INTO api.surveys (title, slug, status) 
VALUES ('Encuesta de Prueba', 'prueba-tipos', 'active')
RETURNING id;

-- Agregar preguntas de cada tipo
INSERT INTO api.survey_questions 
  (survey_id, question_text, question_key, question_type, options, order_index)
VALUES
  -- Rating
  (:survey_id, '¿Calificación?', 'rating_test', 'rating', '["1","2","3","4","5"]'::jsonb, 1),
  -- Boolean
  (:survey_id, '¿Te gustó?', 'boolean_test', 'boolean', null, 2),
  -- Checkbox
  (:survey_id, '¿Qué características?', 'checkbox_test', 'checkbox', '["Opción 1","Opción 2"]'::jsonb, 3),
  -- Text
  (:survey_id, '¿Comentarios?', 'text_test', 'text', null, 4);
```

### Simular Respuestas

```sql
INSERT INTO api.encuestas (survey_id, respuestas)
VALUES 
  (:survey_id, '{"rating_test": 5, "boolean_test": true, "checkbox_test": ["Opción 1"], "text_test": "Excelente"}'::jsonb),
  (:survey_id, '{"rating_test": 4, "boolean_test": true, "checkbox_test": ["Opción 1", "Opción 2"], "text_test": "Muy bien"}'::jsonb),
  (:survey_id, '{"rating_test": 3, "boolean_test": false, "checkbox_test": ["Opción 2"], "text_test": "Regular"}'::jsonb);
```

### Verificar Dashboard

```bash
# Visita en tu navegador
http://localhost:3000/dashboard/[id-de-encuesta-prueba]
```

## 🐛 Troubleshooting

### Error: "Función get_survey_dashboard no existe"

**Solución:** Ejecuta la migración SQL:
```sql
-- database/dynamic-dashboard-migration.sql
```

### Error: "No hay datos disponibles"

**Verificaciones:**
1. ¿La encuesta tiene preguntas activas?
   ```sql
   SELECT * FROM api.survey_questions WHERE survey_id = :id AND is_active = true;
   ```

2. ¿Hay respuestas para la encuesta?
   ```sql
   SELECT COUNT(*) FROM api.encuestas WHERE survey_id = :id;
   ```

### Error al exportar Excel

**Verificaciones:**
1. ¿El tipo de pregunta es válido?
2. ¿Las respuestas están en formato JSONB correcto?
3. Revisa logs del servidor para errores específicos

### Los gráficos no se muestran

**Verificaciones:**
1. ¿Recharts está instalado? `npm list recharts`
2. ¿Hay datos de respuestas? Verifica en la consola del navegador
3. Revisa errores de JavaScript en DevTools

## 📈 Performance

### Optimizaciones Implementadas

1. **Índices de Base de Datos**:
   - GIN index en columna `respuestas` (JSONB)
   - Index compuesto en `(survey_id, is_active, order_index)`

2. **Funciones de Base de Datos**:
   - Cálculos realizados en PostgreSQL (más rápido)
   - Security definer para permisos optimizados

3. **Frontend**:
   - Loading states para UX fluida
   - Componentes memoizados con React
   - Lazy loading de gráficos

### Recomendaciones para Escala

- **< 1,000 respuestas**: Sin cambios necesarios
- **1,000 - 10,000**: Considerar cache en Redis
- **> 10,000**: Implementar paginación en respuestas de texto

## 🔐 Seguridad

### Permisos RLS

Las funciones y vistas tienen permisos configurados:
- `authenticated`: Acceso completo
- `anon`: Solo lectura de encuestas activas

### Validación de Datos

- Sanitización en API endpoints
- Validación de tipos de pregunta
- Escape de caracteres especiales en Excel

## 📚 Recursos Adicionales

- [Documentación Recharts](https://recharts.org/)
- [XLSX SheetJS](https://docs.sheetjs.com/)
- [Supabase Functions](https://supabase.com/docs/guides/database/functions)
- [Next.js App Router](https://nextjs.org/docs/app)

## 🤝 Contribuir

Para agregar nuevos tipos de pregunta:

1. **Actualizar constraint en BD**:
   ```sql
   ALTER TABLE api.survey_questions DROP CONSTRAINT survey_questions_question_type_check;
   ALTER TABLE api.survey_questions ADD CONSTRAINT survey_questions_question_type_check 
   CHECK (question_type IN ('text', 'phone', 'checkbox', 'radio', 'select', 'rating', 'boolean', 'number', 'TU_NUEVO_TIPO'));
   ```

2. **Agregar caso en `calculate_question_statistics()`**

3. **Crear nuevo widget en `StatisticWidget.tsx`**

4. **Actualizar tipos en `types/database.ts`**

## 📝 Changelog

### v2.0.0 (2024-01-08)
- ✨ Sistema de dashboard dinámico
- ✨ Exportación Excel con estructura dinámica
- ✨ Soporte para 8 tipos de pregunta
- ✨ Funciones PostgreSQL para estadísticas
- ✨ Componentes React reutilizables
- ✨ API endpoints RESTful

---

**¿Preguntas o problemas?** Abre un issue en el repositorio.
