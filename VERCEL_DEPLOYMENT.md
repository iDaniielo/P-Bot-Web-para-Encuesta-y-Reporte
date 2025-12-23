# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar la aplicación NavidadSurvey en Vercel de forma gratuita.

## 🚀 Despliegue Rápido

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. **Acceder a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Crea una cuenta o inicia sesión (puedes usar tu cuenta de GitHub)

2. **Importar el Proyecto**
   - Haz clic en "Add New..." → "Project"
   - Selecciona "Import Git Repository"
   - Busca y selecciona tu repositorio: `P-Bot-Web-para-Encuesta-y-Reporte`
   - Haz clic en "Import"

3. **Configurar el Proyecto**
   - **Framework Preset:** Next.js (detectado automáticamente)
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (automático)
   - **Output Directory:** `.next` (automático)

4. **Configurar Variables de Entorno**
   
   En la sección "Environment Variables", agrega:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = tu_clave_anon_key_aqui
   DASHBOARD_PASSWORD = admin123
   ```
   
   ⚠️ **Importante:** Usa tus credenciales reales de Supabase

5. **Desplegar**
   - Haz clic en "Deploy"
   - Espera 2-3 minutos mientras Vercel construye y despliega tu aplicación
   - ¡Listo! Tu aplicación estará disponible en una URL como: `https://tu-proyecto.vercel.app`

### Opción 2: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel

# Seguir las instrucciones en pantalla
# Cuando pregunte por variables de entorno, agrégalas manualmente
```

## 🔧 Configuración Avanzada

### Configurar Dominio Personalizado

1. En tu proyecto de Vercel, ve a "Settings" → "Domains"
2. Haz clic en "Add"
3. Ingresa tu dominio (ej: `navidadsurvey.com`)
4. Sigue las instrucciones para configurar los DNS

### Variables de Entorno por Ambiente

Vercel permite configurar variables para diferentes ambientes:

- **Production:** Variables para producción
- **Preview:** Variables para ramas de preview
- **Development:** Variables para desarrollo local

Para configurar:
1. Ve a "Settings" → "Environment Variables"
2. Selecciona el ambiente apropiado al agregar cada variable

### Actualizar Variables de Entorno

1. Ve a "Settings" → "Environment Variables"
2. Edita la variable que necesites
3. **Importante:** Debes redesplegar para que los cambios tomen efecto
4. Ve a "Deployments" → selecciona el último deployment → "Redeploy"

## 🔄 Actualizaciones Automáticas

Vercel se integra con tu repositorio de GitHub:

- **Cada push a `main`:** Despliega automáticamente a producción
- **Cada push a otras ramas:** Crea un preview deployment
- **Pull Requests:** Crea previews automáticos con URLs únicas

### Configurar Ramas de Despliegue

1. Ve a "Settings" → "Git"
2. En "Production Branch", puedes cambiar la rama de producción
3. Activa/desactiva "Automatic Deployments from Git"

## 📊 Monitoreo y Analytics

### Ver Logs de Despliegue

1. Ve a "Deployments"
2. Haz clic en un deployment
3. Ve a "Building" para ver logs de construcción
4. Ve a "Functions" para ver logs de las API routes

### Analytics

Vercel ofrece analytics gratuitos:

1. Ve a la pestaña "Analytics"
2. Verás métricas de:
   - Visitas
   - Performance
   - Core Web Vitals

### Speed Insights

Para activar Speed Insights:

```bash
npm install @vercel/speed-insights
```

Agrega al layout:

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## 🔒 Seguridad

### Proteger el Dashboard

El dashboard actualmente es público. Para protegerlo:

#### Opción 1: Middleware de Next.js

Crea `middleware.ts` en la raíz:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const auth = request.headers.get('authorization');
    
    if (!auth || auth !== `Bearer ${process.env.DASHBOARD_PASSWORD}`) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      });
    }
  }
  
  return NextResponse.next();
}
```

#### Opción 2: Vercel Password Protection

1. Upgrade a plan Pro de Vercel
2. Ve a "Settings" → "Password Protection"
3. Activa y configura una contraseña

### Variables de Entorno Sensibles

- Nunca expongas `DASHBOARD_PASSWORD` en el cliente
- Usa Vercel Environment Variables para credenciales
- Rota las claves regularmente

## 🎯 Optimización

### Configurar Headers de Caché

Crea `next.config.js` con headers personalizados:

```javascript
module.exports = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### Image Optimization

Vercel optimiza imágenes automáticamente. Usa el componente `Image` de Next.js:

```tsx
import Image from 'next/image';

<Image src="/logo.png" width={200} height={200} alt="Logo" />
```

### Edge Functions

Para mejor performance global, algunas rutas pueden ejecutarse en Edge:

```tsx
export const runtime = 'edge';
```

## 🐛 Solución de Problemas

### Error: "Build failed"

**Revisar:**
1. Logs de build en Vercel
2. Variables de entorno configuradas
3. Que `package.json` tenga los scripts correctos

**Solución común:**
```bash
# Verificar build localmente
npm run build
```

### Error: "Function execution timed out"

**Solución:**
- Vercel tiene límite de 10s para Hobby plan
- Optimiza queries a Supabase
- Considera upgrade a Pro para 60s

### Variables de entorno no funcionan

**Verificar:**
1. Nombres correctos con `NEXT_PUBLIC_` para cliente
2. Sin `NEXT_PUBLIC_` para server-side
3. Redesplegar después de cambios

### Problemas con Supabase

**Revisar:**
1. URLs correctas en variables de entorno
2. Políticas RLS en Supabase
3. Que el proyecto de Supabase esté activo

## 📈 Escalabilidad

### Límites del Plan Free

- 100 GB bandwidth/mes
- 100 deployments/día
- Serverless Function Execution: 100 GB-Hrs

### Cuándo Actualizar

Considera el plan Pro si:
- Tienes más de 10k visitas/mes
- Necesitas funciones con más de 10s de ejecución
- Requieres protección con password
- Necesitas analytics avanzados

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## 💡 Tips Pro

1. **Preview Deployments:** Usa para probar cambios antes de producción
2. **Rollback:** Puedes volver a cualquier deployment anterior en 1 clic
3. **Custom 404:** Personaliza `app/not-found.tsx`
4. **Redirects:** Configura en `next.config.js`
5. **API Routes:** Se convierten automáticamente en Serverless Functions

## 🎉 Próximos Pasos

1. ✅ Desplegar la aplicación
2. ✅ Configurar dominio personalizado
3. ✅ Activar analytics
4. ✅ Configurar notificaciones de deployment
5. ✅ Documentar URL de producción en README

---

¿Problemas con el despliegue? Revisa los logs en Vercel o consulta la documentación oficial.
