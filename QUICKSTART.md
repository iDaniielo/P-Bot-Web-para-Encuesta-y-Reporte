# Quick Start Guide

## 🚀 Configuración Rápida

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. En el SQL Editor, ejecuta el contenido de `database/schema.sql`
4. Copia tu URL y API Key:
   - Ve a Settings → API
   - Copia la "URL" y "anon public" key

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-aqui
```

### 3. Instalar y Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

## 🐳 Usando Docker

### Opción 1: Solo la aplicación (con Supabase en la nube)

```bash
# Construir imagen
docker build -t pbot-app .

# Ejecutar
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=tu-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key \
  pbot-app
```

### Opción 2: Todo con Docker Compose (app + PostgreSQL local)

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de Supabase
# O usar PostgreSQL local (configurado automáticamente)

# Ejecutar
docker-compose -f docker-compose.dev.yml up

# Acceder a:
# - App: http://localhost:3000
# - PostgreSQL: localhost:5432
```

## 📝 Personalizar la Encuesta

Edita `lib/surveyConfig.ts`:

```typescript
export const surveyFields: FormField[] = [
  {
    name: 'tu_campo',           // Nombre del campo en la DB
    label: '¿Tu pregunta?',     // Texto mostrado al usuario
    type: 'text',               // text | tel | number | select
    placeholder: 'Ej: ...',     // Texto de ayuda
    required: true,             // ¿Es obligatorio?
    options: ['A', 'B'],        // Solo para type: 'select'
    min: 0,                     // Solo para type: 'number'
    max: 100,                   // Solo para type: 'number'
  },
  // Añade más campos aquí...
];
```

**Importante**: Si añades o cambias campos, actualiza también:
1. La interfaz `SurveyResponse` en `lib/types.ts`
2. El schema SQL en `database/schema.sql`

## 🌐 Desplegar en Vercel

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Añade las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy! 🎉

## 🔍 Verificar que Todo Funciona

### ✅ Checklist

- [ ] La página de inicio carga (`http://localhost:3000`)
- [ ] Puedes navegar a la encuesta (`/encuesta`)
- [ ] El formulario paso a paso funciona
- [ ] Puedes enviar una respuesta
- [ ] La respuesta aparece en el dashboard (`/dashboard`)
- [ ] Los KPIs se actualizan correctamente

### 🐛 Problemas Comunes

**"Supabase client is not configured"**
→ Verifica que `.env.local` existe y tiene las variables correctas

**"Failed to fetch"**
→ Verifica que las políticas RLS en Supabase están configuradas

**Build errors con Tailwind**
→ Asegúrate de tener `@tailwindcss/postcss` instalado

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [README completo](./README.md)

## 💡 Tips

- La base de datos incluye políticas RLS que permiten lectura/escritura pública
- Para producción, considera añadir autenticación al dashboard
- Usa `docker-compose.dev.yml` para desarrollo local sin Supabase
- El formulario es completamente reutilizable para otras encuestas

## 🆘 Soporte

Si encuentras problemas:
1. Revisa el [README.md](./README.md) completo
2. Verifica la configuración de Supabase
3. Revisa los logs de la aplicación
4. Abre un issue en GitHub con detalles del error
