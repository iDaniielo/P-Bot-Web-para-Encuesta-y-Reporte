# 🔧 Guía para Arreglar los Dashboards Dinámicos

## 📋 Resumen del Problema

Los dashboards dinámicos mostraban el error "Error al cargar el dashboard" porque la función RPC `get_survey_dashboard` estaba definida en el schema `api` en lugar del schema `public`, y el cliente de Supabase busca funciones en el schema `public` por defecto.

## ✅ Solución Implementada

### 1. Cambios en el Código (Ya Aplicados)

✅ **API Route Mejorada** (`app/api/surveys/[surveyId]/dashboard/route.ts`):
- Ahora intenta usar la función RPC primero
- Si falla, construye el dashboard manualmente consultando la base de datos directamente
- **Resultado**: Los dashboards funcionarán incluso si no se aplica la migración de base de datos

✅ **Dashboard Principal Simplificado** (`app/dashboard/page.tsx`):
- Removido el dashboard antiguo (KPI cards, gráficos, tablas)
- Ahora solo muestra el selector de "Dashboards Dinámicos por Encuesta"
- Cada encuesta tiene su propio dashboard dedicado

### 2. Migración de Base de Datos (Opcional pero Recomendado)

Para mejorar el rendimiento, puedes aplicar la migración que crea las funciones RPC en el schema correcto.

#### Pasos para Aplicar la Migración:

1. **Accede a tu proyecto de Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto
   - Ve a **SQL Editor**

2. **Ejecuta el Script de Migración**
   - Abre el archivo `database/fix-dashboard-functions.sql`
   - Copia todo el contenido
   - Pégalo en el SQL Editor de Supabase
   - Haz clic en **Run**

3. **Verifica que la Migración fue Exitosa**
   ```sql
   -- Ejecuta esta consulta para verificar que las funciones existen
   SELECT routine_name, routine_schema
   FROM information_schema.routines
   WHERE routine_name IN ('get_survey_dashboard', 'calculate_question_statistics')
   AND routine_schema = 'public';
   ```

   Deberías ver dos funciones listadas en el schema `public`.

## 🎯 Lo Que Se Arregló

### ✅ Dashboard Dinámico Funcionando
- **Antes**: Error "Error al cargar el dashboard" / "Error al obtener el dashboard"
- **Ahora**: Dashboard carga correctamente con estadísticas por pregunta

### ✅ Dashboard Principal Limpio
- **Antes**: Dashboard principal tenía sección duplicada de KPIs y gráficos debajo del selector
- **Ahora**: Solo muestra el selector de "Dashboards Dinámicos por Encuesta"

### ✅ Navegación Mejorada
- Haz clic en cualquier encuesta en el selector
- Serás redirigido a `/dashboard/[surveyId]`
- Verás estadísticas detalladas con gráficos dinámicos

## 📊 Características del Dashboard Dinámico

Cada dashboard de encuesta muestra:

1. **Métricas Generales**:
   - Total de respuestas
   - Número de preguntas
   - Tasa de completitud
   - Última respuesta

2. **Estadísticas por Pregunta** (según el tipo):
   - **Checkbox/Radio/Select**: Gráficos de distribución
   - **Rating/Number**: Promedio, min, max con gráficos de barras
   - **Boolean**: Gráfico de dona con porcentajes Sí/No
   - **Text/Phone**: Lista de respuestas recientes

3. **Exportación a Excel**:
   - Botón para descargar archivo `.xlsx`
   - Incluye metadata, respuestas y estadísticas

## 🚀 ¿Necesitas Ayuda?

### Problema: "Error al cargar el dashboard" persiste

**Posibles causas**:
1. No hay respuestas para la encuesta
2. La encuesta no existe o no está activa
3. Problemas de permisos en la base de datos

**Solución**:
1. Verifica que la encuesta tenga al menos una respuesta
2. Confirma que el status de la encuesta es `'active'`
3. Revisa los logs del navegador (F12 > Console) para más detalles

### Problema: No se ven encuestas en el selector

**Causa**: No hay encuestas activas en el sistema

**Solución**:
1. Ve a `/dashboard/surveys`
2. Crea una nueva encuesta o activa una existente
3. Regresa al dashboard principal

## 📝 Notas Técnicas

### Fallback Automático
El código ahora tiene un sistema de fallback que:
1. Primero intenta usar la función RPC (más rápida)
2. Si falla, consulta la base de datos directamente (más lenta pero funciona siempre)
3. Construye las estadísticas en el servidor

### Performance
- **Con migración aplicada**: Consultas optimizadas usando funciones de base de datos
- **Sin migración**: Múltiples consultas pero aún funcional
- **Recomendación**: Aplica la migración para mejor rendimiento

### Compatibilidad
- Funciona con todas las encuestas existentes
- Compatible con todos los tipos de preguntas
- No se pierden datos durante la actualización

## 🎉 ¡Listo!

Los dashboards dinámicos ahora deberían funcionar correctamente. Si tienes algún problema, revisa los logs del navegador y del servidor para más información.
