# 🚀 Supabase CLI - Guía de Migraciones

Este proyecto usa **Supabase CLI** para gestionar migraciones de base de datos de forma profesional.

---

## 📦 Instalación

### 1. Instalar Supabase CLI

**Windows (PowerShell como administrador):**
```powershell
scoop install supabase
```

O con npm:
```bash
npm install -g supabase
```

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

Verifica la instalación:
```bash
supabase --version
```

---

## 🔧 Configuración Inicial

### 2. Vincular tu proyecto

```bash
# Desde la raíz del proyecto
supabase link --project-ref ykhrhzckfklnoakldncq
```

Te pedirá tu **contraseña de base de datos**. Encuéntrala en:
- [Supabase Dashboard](https://app.supabase.com/project/ykhrhzckfklnoakldncq/settings/database)
- Settings → Database → Database password

💡 **Tip**: Guarda la contraseña en un gestor de contraseñas.

---

## 🚀 Aplicar Migraciones

### 3. Push a producción

Después de hacer push a tu rama en GitHub y que Vercel despliegue:

```bash
# Aplicar migraciones a tu base de datos remota
supabase db push
```

Esto ejecutará automáticamente:
- ✅ Creación de schema `api`
- ✅ Tablas `encuestas` y `survey_questions`
- ✅ Índices de performance
- ✅ Políticas RLS
- ✅ Permisos

---

## 🔄 Flujo de Trabajo

### Desarrollo → Staging → Producción

```bash
# 1. Hacer cambios en tu código
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...

# 2. Si necesitas crear una nueva migración
supabase migration new nombre_de_migracion

# 3. Editar el archivo SQL generado en supabase/migrations/

# 4. Commit y push
git add .
git commit -m "feat: nueva migración"
git push origin feature/nueva-funcionalidad

# 5. Después del deploy en Vercel, aplicar migraciones
supabase db push
```

---

## 📁 Estructura de Migraciones

```
supabase/
├── config.toml                          # Configuración del proyecto
└── migrations/
    └── 20260108000000_initial_setup.sql # Migración inicial
```

Las migraciones se ejecutan **en orden cronológico** basado en el timestamp del nombre del archivo.

---

## 🛠️ Comandos Útiles

### Crear nueva migración
```bash
supabase migration new nombre_descriptivo
```

### Ver estado de migraciones
```bash
supabase migration list
```

### Aplicar migraciones pendientes
```bash
supabase db push
```

### Traer el schema remoto (reverse migration)
```bash
supabase db pull
```

### Resetear base de datos local (si usas Supabase local)
```bash
supabase db reset
```

---

## 🎯 Primera Ejecución (Setup Inicial)

### Paso a paso:

1. **Instalar CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Vincular proyecto**:
   ```bash
   supabase link --project-ref ykhrhzckfklnoakldncq
   ```

3. **Aplicar migraciones**:
   ```bash
   supabase db push
   ```

4. **Verificar**:
   - Ve a [Supabase Dashboard](https://app.supabase.com/project/ykhrhzckfklnoakldncq/editor)
   - Deberías ver las tablas `api.encuestas` y `api.survey_questions`

---

## 🔐 Seguridad

### Variables de entorno necesarias:

Solo necesitas las que ya tienes:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ykhrhzckfklnoakldncq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**NO necesitas** `SUPABASE_SERVICE_ROLE_KEY` con este método.

---

## 🐛 Troubleshooting

### "Project ref does not match linked project"
```bash
supabase link --project-ref ykhrhzckfklnoakldncq
```

### "Database password incorrect"
1. Ve a [Database Settings](https://app.supabase.com/project/ykhrhzckfklnoakldncq/settings/database)
2. Resetea la contraseña si es necesario
3. Vuelve a intentar `supabase link`

### "Migration already applied"
Las migraciones son **idempotentes**. Si ya están aplicadas, no pasa nada.

### Ver logs de error
```bash
supabase db push --debug
```

---

## 📚 Recursos

- [Documentación oficial de Supabase CLI](https://supabase.com/docs/guides/cli)
- [Guía de migraciones](https://supabase.com/docs/guides/cli/local-development)
- [Dashboard del proyecto](https://app.supabase.com/project/ykhrhzckfklnoakldncq)

---

## ✅ Ventajas de este método

✅ **Versionado**: Todas las migraciones están en Git  
✅ **Rollback**: Puedes revertir cambios fácilmente  
✅ **CI/CD**: Se integra con GitHub Actions  
✅ **Seguro**: No expones service role keys  
✅ **Profesional**: Estándar de la industria  

---

## 🎉 ¡Listo!

Después de ejecutar `supabase db push`:

1. ✅ Tablas creadas
2. ✅ Políticas configuradas
3. ✅ Permisos establecidos

Ahora puedes:
- Crear usuarios en Authentication
- Iniciar sesión en `/login`
- Gestionar preguntas desde `/dashboard`
