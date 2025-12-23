# 📁 Scripts de Base de Datos

Esta carpeta contiene los scripts SQL necesarios para configurar Supabase.

## 🚀 Setup Inicial (Recomendado)

### `setup-complete.sql`

**Script todo-en-uno para configuración inicial.**

Incluye:

- ✅ Creación de schemas
- ✅ Creación de tablas (encuestas y preguntas)
- ✅ Índices para performance
- ✅ Políticas RLS (Row Level Security)
- ✅ Permisos y grants
- ✅ Triggers para updated_at
- ✅ Verificación de la instalación

**Uso:**

1. Ve a Supabase → SQL Editor
2. Copia y pega el contenido completo
3. Ejecuta (F5)
4. Verifica que las tablas y políticas se crearon

---

## 🔧 Scripts Individuales

### `schema.sql`

Crea la tabla de encuestas (`api.encuestas`)

### `survey-questions-schema.sql`

Crea la tabla de preguntas dinámicas (`api.survey_questions`)

### `fix-permissions-simple.sql`

Script de corrección para problemas de permisos RLS.

**Cuándo usar:**

- Error: "permission denied for table survey_questions"
- Error: "No tienes permisos para ver las preguntas"

---

## 📋 Orden de Ejecución (si usas scripts individuales)

1. `schema.sql`
2. `survey-questions-schema.sql`
3. `fix-permissions-simple.sql` (si hay problemas de permisos)

---

## ⚠️ Notas Importantes

- **Siempre ejecuta en el SQL Editor de Supabase**, no en un cliente local
- Los scripts son **idempotentes** (puedes ejecutarlos múltiples veces sin problemas)
- Si usas `setup-complete.sql`, **no necesitas** ejecutar los demás scripts
- Después de ejecutar, verifica en **Authentication → Policies** que las políticas se crearon

---

## 🐛 Troubleshooting

### Error: "schema api does not exist"

**Solución:** Ejecuta `setup-complete.sql` completo

### Error: "relation api.survey_questions does not exist"

**Solución:** Ejecuta `setup-complete.sql` o `survey-questions-schema.sql`

### Error: "permission denied"

**Solución:** Ejecuta `fix-permissions-simple.sql`

---

## 📚 Más Información

Para instrucciones completas de instalación, consulta el [README principal](../README.md).
