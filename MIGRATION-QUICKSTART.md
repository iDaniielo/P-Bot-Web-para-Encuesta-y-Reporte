# 🚀 Guía Rápida de Migración - Dashboard Dinámico

## ⚡ Pasos Rápidos

### 1. Ejecutar Migración SQL (5 minutos)

```bash
# Ve a Supabase Dashboard → SQL Editor
# Ejecuta el archivo: database/dynamic-dashboard-migration.sql
```

### 2. Verificar Instalación

```sql
-- Verifica que las funciones existen
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'api' 
AND routine_name IN ('calculate_question_statistics', 'get_survey_dashboard');

-- Verifica que la vista existe
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'api' 
AND table_name = 'survey_statistics_summary';

-- Verifica los nuevos tipos de pregunta
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'api' 
AND table_name = 'survey_questions'
AND column_name = 'question_type';
```

### 3. Prueba Rápida

```sql
-- Obtener dashboard de una encuesta existente
SELECT api.get_survey_dashboard('TU-SURVEY-ID-AQUI'::uuid);

-- Ver resumen de todas las encuestas
SELECT * FROM api.survey_statistics_summary;
```

## 📋 Checklist de Validación

- [ ] Migración SQL ejecutada sin errores
- [ ] Funciones creadas: `calculate_question_statistics` y `get_survey_dashboard`
- [ ] Vista creada: `survey_statistics_summary`
- [ ] Índices creados en tablas
- [ ] Permisos configurados (RPC y SELECT grants)
- [ ] Tipos de pregunta extendidos (rating, boolean, number)

## 🎯 Uso Inmediato

### Desde la UI

1. **Dashboard Principal**: `https://tu-app.com/dashboard`
   - Verás tarjetas de encuestas en "Dashboards Dinámicos"
   
2. **Dashboard de Encuesta**: `https://tu-app.com/dashboard/[surveyId]`
   - Gráficos automáticos según preguntas
   
3. **Exportar Excel**: Click en botón "Exportar a Excel"

### Desde la API

```javascript
// Obtener dashboard
const dashboard = await fetch(`/api/surveys/${surveyId}/dashboard`);

// Obtener estadísticas
const stats = await fetch(`/api/surveys/${surveyId}/statistics`);

// Descargar Excel
window.location.href = `/api/surveys/${surveyId}/export`;
```

## 🔥 Tipos de Pregunta Nuevos

### Rating (Calificación)
```javascript
{
  question_type: "rating",
  options: ["1", "2", "3", "4", "5"]
}
```
**Visualización:** Barras + promedio + min/max

### Boolean (Sí/No)
```javascript
{
  question_type: "boolean"
}
```
**Visualización:** Gráfico de dona con porcentajes

### Number (Número)
```javascript
{
  question_type: "number",
  validation_rules: { min: 1, max: 100 }
}
```
**Visualización:** Barras + promedio + min/max

## 🐛 Si algo falla...

### Error: "función no existe"
```sql
-- Re-ejecuta la migración
\i database/dynamic-dashboard-migration.sql
```

### Error: "permiso denegado"
```sql
-- Verifica y re-aplica permisos
GRANT EXECUTE ON FUNCTION api.calculate_question_statistics TO authenticated, anon;
GRANT EXECUTE ON FUNCTION api.get_survey_dashboard TO authenticated, anon;
GRANT SELECT ON api.survey_statistics_summary TO authenticated, anon;
```

### No aparecen gráficos
1. Verifica que hay respuestas: `SELECT COUNT(*) FROM api.encuestas WHERE survey_id = 'id';`
2. Verifica que las preguntas están activas: `SELECT * FROM api.survey_questions WHERE is_active = true;`
3. Revisa la consola del navegador (F12)

## 📞 Soporte

- **Documentación completa**: Ver `DYNAMIC-DASHBOARD-GUIDE.md`
- **Migración SQL**: Ver `database/dynamic-dashboard-migration.sql`
- **Issues**: Abre un issue en GitHub

## ✅ Todo Listo

Si todos los checks pasaron, ya puedes:
- ✨ Crear encuestas con nuevos tipos de pregunta
- 📊 Ver dashboards dinámicos por encuesta
- 📥 Exportar a Excel con estructura adaptativa
- 📈 Obtener estadísticas en tiempo real

---

**¡Disfruta el nuevo sistema! 🎉**
