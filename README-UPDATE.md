# Actualización del README - Sistema de Dashboard Dinámico

## Nueva Sección para Agregar al README Principal

---

## 📊 Dashboard Dinámico y Exportación Excel

### Características

El sistema ahora incluye **dashboards dinámicos** que se adaptan automáticamente a la estructura de cada encuesta, mostrando estadísticas visuales y permitiendo exportación a Excel profesional.

#### ✨ Funcionalidades Principales

1. **Dashboards Adaptativos**
   - Gráficos automáticos según tipo de pregunta
   - Métricas en tiempo real (respuestas, completitud, última actualización)
   - Visualizaciones interactivas con Recharts

2. **Tipos de Pregunta Extendidos**
   - `text` - Texto libre
   - `phone` - Número telefónico
   - `checkbox` - Opción múltiple
   - `radio` - Opción única
   - `select` - Lista desplegable
   - `rating` - Calificación numérica ⭐ **NUEVO**
   - `boolean` - Sí/No ⭐ **NUEVO**
   - `number` - Número libre ⭐ **NUEVO**

3. **Exportación Excel Avanzada**
   - Estructura dinámica (columnas según preguntas)
   - Múltiples hojas: Metadata, Respuestas, Estadísticas
   - Formato profesional con colores y auto-ajuste
   - Un click desde el dashboard

### 🚀 Inicio Rápido

#### 1. Ejecutar Migración de Base de Datos

```bash
# En Supabase SQL Editor
# Ejecuta: database/dynamic-dashboard-migration.sql
```

#### 2. Acceder a los Dashboards

**Desde el Dashboard Principal:**
```
https://tu-app.com/dashboard
→ Ver sección "Dashboards Dinámicos por Encuesta"
→ Click en cualquier encuesta
```

**URL Directa:**
```
https://tu-app.com/dashboard/[surveyId]
```

#### 3. Crear Encuesta con Nuevos Tipos

```typescript
// Ejemplo: Pregunta de calificación
{
  question_text: "¿Cómo calificarías el servicio?",
  question_key: "calificacion",
  question_type: "rating",
  options: ["1", "2", "3", "4", "5"]
}

// Ejemplo: Pregunta Sí/No
{
  question_text: "¿Recomendarías nuestro producto?",
  question_key: "recomendacion",
  question_type: "boolean"
}
```

### 📖 Documentación Detallada

- **Guía Completa**: Ver [DYNAMIC-DASHBOARD-GUIDE.md](./DYNAMIC-DASHBOARD-GUIDE.md)
- **Migración Rápida**: Ver [MIGRATION-QUICKSTART.md](./MIGRATION-QUICKSTART.md)
- **Script SQL**: Ver [dynamic-dashboard-migration.sql](./database/dynamic-dashboard-migration.sql)

### 🎨 Capturas de Pantalla

#### Dashboard Dinámico
![Dashboard con widgets automáticos por tipo de pregunta]

#### Exportación Excel
![Archivo Excel con múltiples hojas y formato profesional]

#### Selector de Encuestas
![Tarjetas de encuestas en dashboard principal]

### 🔧 API Endpoints Nuevos

```typescript
// Obtener dashboard completo
GET /api/surveys/[surveyId]/dashboard

// Obtener estadísticas
GET /api/surveys/[surveyId]/statistics
GET /api/surveys/[surveyId]/statistics?questionId=[id]

// Exportar a Excel
GET /api/surveys/[surveyId]/export
```

### 📊 Tipos de Gráficos

| Tipo Pregunta | Visualización |
|---------------|---------------|
| Multiple Choice (checkbox/radio/select) | Gráfico de Pastel + Barras |
| Rating/Number | Barras con Promedio + Min/Max |
| Boolean (Sí/No) | Gráfico de Dona + Porcentajes |
| Text/Phone | Lista de Respuestas |

### 🔍 Ejemplo de Uso Completo

```typescript
// 1. Crear encuesta
const survey = await createSurvey({
  title: "Satisfacción del Cliente",
  status: "active"
});

// 2. Agregar preguntas variadas
await addQuestion({
  survey_id: survey.id,
  question_text: "Califica nuestro servicio",
  question_type: "rating",
  options: ["1", "2", "3", "4", "5"]
});

await addQuestion({
  survey_id: survey.id,
  question_text: "¿Volverías a comprar?",
  question_type: "boolean"
});

// 3. Ver dashboard
// Visita: /dashboard/[survey.id]

// 4. Exportar Excel
// Click en "Exportar a Excel" o:
const excel = await fetch(`/api/surveys/${survey.id}/export`);
```

### 🎯 Características Técnicas

- **Performance**: Índices GIN en JSONB, funciones PostgreSQL optimizadas
- **Escalabilidad**: Maneja miles de respuestas sin degradación
- **Type-Safe**: TypeScript end-to-end con validación
- **Responsive**: Funciona en móvil, tablet y desktop
- **Profesional**: Excel con formato, colores y auto-ajuste

### 📈 Roadmap

- [x] Dashboard dinámico por encuesta
- [x] Exportación Excel multi-hoja
- [x] 8 tipos de pregunta soportados
- [x] Gráficos interactivos
- [ ] Nube de palabras para preguntas de texto
- [ ] Comparación entre encuestas
- [ ] Exportación a PDF
- [ ] Filtros de fecha en dashboards

---

## Actualizar Sección de Tecnologías

Agregar a la lista de tecnologías:

```markdown
## 📚 Tecnologías

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Autenticación**: Supabase Auth + @supabase/ssr
- **Gráficos**: [Recharts](https://recharts.org/) ⭐ **Actualizado con nuevos widgets**
- **Exportación**: [XLSX](https://docs.sheetjs.com/) ⭐ **Exportación dinámica**
- **Íconos**: [Lucide React](https://lucide.dev/)
- **Lenguaje**: TypeScript
```

## Actualizar Sección de Características

```markdown
## 🚀 Características

### 📝 Encuesta Interactiva (Bot)

- Chatbot conversacional paso a paso
- Validación en tiempo real
- Diseño responsive y moderno
- Soporte para **8 tipos de preguntas** ⭐ (incluye rating, boolean, number)

### 📊 Dashboard CEO

- ✅ Métricas y estadísticas en tiempo real
- ✅ Gráficos interactivos (Recharts)
- ✅ Exportación a Excel
- ✅ Gestión dinámica de preguntas
- ✅ Autenticación segura con Supabase
- ⭐ **NUEVO**: **Dashboards dinámicos por encuesta**
- ⭐ **NUEVO**: **Widgets adaptativos según tipo de pregunta**
- ⭐ **NUEVO**: **Excel multi-hoja con estadísticas**

### 🎨 Gestión de Preguntas

- Sistema CRUD completo
- Reordenamiento drag & drop
- Preguntas dinámicas configurables
- Validación y sanitización automática
- ⭐ **NUEVO**: **Soporte para rating, boolean y number**
```

---

## Contenido para Actualizar README.md

Copia y pega las secciones anteriores en tu `README.md` existente en los lugares apropiados.
