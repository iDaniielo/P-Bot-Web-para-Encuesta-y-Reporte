# 📁 Estructura del Proyecto - NavidadSurvey

Esta guía documenta la estructura completa del proyecto y el propósito de cada archivo y directorio.

## 🌳 Árbol de Directorios

```
P-Bot-Web-para-Encuesta-y-Reporte/
│
├── app/                              # Next.js 14 App Router
│   ├── api/                          # API Routes (Serverless Functions)
│   │   └── encuestas/
│   │       └── route.ts              # Endpoint GET para obtener encuestas
│   │
│   ├── dashboard/                    # Página del Dashboard del CEO
│   │   └── page.tsx                  # Dashboard con KPIs y visualizaciones
│   │
│   ├── encuesta/                     # Página del Bot de Encuestas
│   │   └── page.tsx                  # Formulario de encuesta interactivo
│   │
│   ├── globals.css                   # Estilos globales y Tailwind
│   ├── layout.tsx                    # Layout principal de la app
│   └── page.tsx                      # Página de inicio (Home)
│
├── components/                       # Componentes reutilizables
│   └── SurveyBot.tsx                 # Componente del bot de encuestas
│
├── lib/                              # Utilidades y configuraciones
│   ├── supabase.ts                   # Cliente de Supabase
│   └── survey-config.ts              # Configuración dinámica de preguntas
│
├── types/                            # Definiciones de TypeScript
│   └── database.ts                   # Tipos para la base de datos
│
├── .env.example                      # Plantilla de variables de entorno
├── .eslintrc.json                    # Configuración de ESLint
├── .gitignore                        # Archivos ignorados por Git
├── docker-compose.yml                # Configuración de Docker Compose
├── Dockerfile                        # Imagen Docker de la aplicación
├── next.config.js                    # Configuración de Next.js
├── package.json                      # Dependencias y scripts
├── postcss.config.js                 # Configuración de PostCSS
├── README.md                         # Documentación principal
├── SETUP_GUIDE.md                    # Guía de configuración inicial
├── DOCKER_GUIDE.md                   # Guía de Docker
├── VERCEL_DEPLOYMENT.md              # Guía de despliegue en Vercel
├── supabase-schema.sql               # Script SQL para la base de datos
├── tailwind.config.ts                # Configuración de Tailwind CSS
└── tsconfig.json                     # Configuración de TypeScript
```

## 📄 Descripción de Archivos Clave

### `/app` - Next.js App Router

#### `app/layout.tsx`
**Propósito:** Layout raíz de la aplicación.
- Define el HTML y body base
- Importa estilos globales
- Configura metadata (SEO)

```tsx
// Uso: Se aplica automáticamente a todas las páginas
```

#### `app/page.tsx`
**Propósito:** Página de inicio (landing page).
- Muestra dos tarjetas principales:
  - Acceso a la encuesta
  - Acceso al dashboard
- Diseño centrado y responsivo

#### `app/globals.css`
**Propósito:** Estilos globales.
- Importa directivas de Tailwind
- Define variables CSS personalizadas
- Estilos base para toda la app

### `/app/encuesta` - Bot de Encuestas

#### `app/encuesta/page.tsx`
**Propósito:** Página que contiene el formulario de encuesta.
- Maneja la lógica de envío a Supabase
- Renderiza el componente `SurveyBot`
- Gestiona errores de envío

**Flujo:**
1. Usuario responde preguntas
2. Datos se validan con Zod
3. Se envían a Supabase vía el cliente
4. Muestra mensaje de éxito/error

### `/app/dashboard` - Dashboard CEO

#### `app/dashboard/page.tsx`
**Propósito:** Panel de visualización de métricas.
- Obtiene datos de la API `/api/encuestas`
- Calcula KPIs (total, top lugar)
- Renderiza gráficos con Recharts
- Tabla paginada de respuestas

**Características:**
- KPI Cards: Total de encuestas y lugar más popular
- Gráfico de barras: Distribución del presupuesto
- Tabla: Respuestas recientes con paginación

### `/app/api/encuestas` - API Routes

#### `app/api/encuestas/route.ts`
**Propósito:** Endpoint para obtener datos de encuestas.
- **Método:** GET
- **Response:** Array de encuestas en formato JSON
- Consulta Supabase directamente
- Ordena por fecha descendente

**Ejemplo de uso:**
```typescript
const response = await fetch('/api/encuestas');
const data = await response.json();
```

### `/components` - Componentes Reutilizables

#### `components/SurveyBot.tsx`
**Propósito:** Componente principal del bot de encuestas.

**Características:**
- ✅ Navegación paso a paso
- ✅ Barra de progreso visual
- ✅ Validación en tiempo real con React Hook Form
- ✅ Animaciones suaves con Framer Motion
- ✅ Renderizado dinámico de campos según configuración
- ✅ Soporte para múltiples tipos de input

**Props:**
- `onComplete`: Callback cuando se completa la encuesta

**Tipos de campo soportados:**
- `text`: Campo de texto
- `tel`: Teléfono
- `select`: Dropdown
- `radio`: Opciones múltiples

### `/lib` - Librerías y Utilidades

#### `lib/supabase.ts`
**Propósito:** Cliente configurado de Supabase.
- Inicializa la conexión con Supabase
- Usa variables de entorno
- Tipado con TypeScript

**Uso:**
```typescript
import { supabase } from '@/lib/supabase';
const { data } = await supabase.from('encuestas').select('*');
```

#### `lib/survey-config.ts`
**Propósito:** Configuración dinámica de la encuesta.

**Contiene:**
- `surveyQuestions`: Array de preguntas
- `surveySchema`: Validación con Zod
- `SurveyQuestion`: Interface de pregunta
- `SurveyFormData`: Tipo de datos del formulario

**Ventajas:**
- 100% reutilizable
- Fácil de modificar
- Validación centralizada

**Para agregar una pregunta:**
```typescript
{
  id: 'nueva_pregunta',
  type: 'text',
  question: '¿Tu pregunta?',
  validation: z.string().min(1),
}
```

### `/types` - Tipos de TypeScript

#### `types/database.ts`
**Propósito:** Definiciones de tipos para la base de datos.
- Interface `Database` para Supabase
- Tipos para `Row`, `Insert`, `Update`
- Type `Encuesta` exportado

**Beneficios:**
- Type safety en queries
- Autocompletado en el IDE
- Previene errores en tiempo de compilación

### Archivos de Configuración

#### `next.config.js`
**Propósito:** Configuración de Next.js.
```javascript
output: 'standalone'  // Para Docker optimizado
```

#### `tailwind.config.ts`
**Propósito:** Configuración de Tailwind CSS.
- Rutas de contenido
- Tema personalizado
- Plugins

#### `tsconfig.json`
**Propósito:** Configuración de TypeScript.
- Compiler options
- Path aliases (`@/*`)
- Strict mode habilitado

#### `package.json`
**Propósito:** Dependencias y scripts del proyecto.

**Scripts:**
- `dev`: Desarrollo local
- `build`: Construcción para producción
- `start`: Servidor de producción
- `lint`: Linter

**Dependencias principales:**
- `next`: Framework
- `react`: Librería UI
- `@supabase/supabase-js`: Cliente de Supabase
- `react-hook-form`: Manejo de formularios
- `zod`: Validación
- `recharts`: Gráficos
- `framer-motion`: Animaciones

#### `Dockerfile`
**Propósito:** Imagen Docker de la aplicación.

**Stages:**
1. `deps`: Instala dependencias
2. `builder`: Construye la aplicación
3. `runner`: Imagen final optimizada

**Características:**
- Multi-stage build
- Node Alpine (imagen ligera)
- Non-root user
- Puerto 3000 expuesto

#### `docker-compose.yml`
**Propósito:** Orquestación de contenedores.
- Servicio: `navidad-survey`
- Puerto: `3000:3000`
- Variables de entorno desde `.env`
- Red: `navidad-network`

#### `.gitignore`
**Propósito:** Archivos ignorados por Git.
- `node_modules/`
- `.next/`
- `.env*.local`
- Archivos de build

#### `.env.example`
**Propósito:** Plantilla de variables de entorno.
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DASHBOARD_PASSWORD`

### Scripts SQL

#### `supabase-schema.sql`
**Propósito:** Schema de la base de datos.

**Contiene:**
- Tabla `encuestas` con todos los campos
- Row Level Security (RLS) habilitado
- Políticas para insert y select públicos
- Índices para performance
- Datos de ejemplo (comentados)

**Campos:**
- `id`: UUID (PK)
- `created_at`: Timestamp
- `nombre`: Text
- `telefono`: Text
- `regalo`: Text
- `lugar_compra`: Text
- `gasto`: Text

## 🔄 Flujo de Datos

### Encuesta → Base de Datos

```
Usuario → SurveyBot → React Hook Form → Validación Zod
    → supabase.insert() → Tabla encuestas → Confirmación
```

### Dashboard ← Base de Datos

```
Dashboard page → fetch('/api/encuestas') → API Route
    → supabase.select() → Tabla encuestas → JSON Response
    → Cálculo de KPIs → Renderizado
```

## 🎨 Convenciones de Código

### Naming
- **Componentes:** PascalCase (`SurveyBot.tsx`)
- **Utilidades:** camelCase (`survey-config.ts`)
- **Tipos:** PascalCase (`SurveyFormData`)
- **Constantes:** camelCase o UPPER_CASE

### Estructura de Archivos
- Componentes React: `.tsx`
- Configuración: `.ts` o `.js`
- Estilos: `.css`

### Imports
- Usar alias `@/` para imports absolutos
- Agrupar imports por tipo (externos, internos, tipos)

## 📦 Build Output

Después de `npm run build`:

```
.next/
├── static/              # Assets estáticos
├── server/              # Código del servidor
│   ├── app/             # Pages y API routes
│   └── chunks/          # Chunks de código
└── standalone/          # Build standalone para Docker
```

## 🔐 Variables de Entorno

### Cliente (`NEXT_PUBLIC_*`)
- Se incluyen en el bundle del cliente
- Visibles en el navegador
- Usar para configuración pública

### Servidor (sin prefijo)
- Solo disponibles en el servidor
- No se exponen al cliente
- Usar para secretos

## 📚 Dependencias

### Producción
- `next`, `react`, `react-dom`: Core
- `@supabase/supabase-js`: Base de datos
- `react-hook-form`: Formularios
- `zod`, `@hookform/resolvers`: Validación
- `recharts`: Visualizaciones
- `framer-motion`: Animaciones
- `lucide-react`: Iconos

### Desarrollo
- `typescript`: Tipado
- `tailwindcss`: Estilos
- `eslint`: Linting
- `@types/*`: Type definitions

## 💡 Tips de Desarrollo

1. **Hot Reload:** `npm run dev` actualiza automáticamente
2. **Type Safety:** TypeScript previene errores
3. **Linting:** Ejecuta `npm run lint` antes de commit
4. **Build Local:** Prueba con `npm run build` antes de desplegar
5. **Logs:** Usa console.log en desarrollo, remove en producción

---

Para más información, consulta el README.md principal o las guías específicas.
