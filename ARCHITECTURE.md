# 🏗️ Arquitectura - NavidadSurvey

Este documento explica la arquitectura técnica de la aplicación.

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NAVEGADOR WEB                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   Home Page  │  │Survey Bot UI │  │   CEO Dashboard     │   │
│  │   (/)        │  │ (/encuesta)  │  │   (/dashboard)      │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 14 APP ROUTER                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Server-Side Rendering (SSR)                 │   │
│  │              Static Site Generation (SSG)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────┐  ┌───────────────────────────────────┐   │
│  │  React Components│  │   API Routes                      │   │
│  │  - SurveyBot     │  │   /api/encuestas (GET)            │   │
│  │  - Dashboard     │  │   - Fetch survey data             │   │
│  │  - UI Elements   │  │   - Server-side logic             │   │
│  └──────────────────┘  └───────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         @supabase/supabase-js                            │   │
│  │         - Type-safe queries                              │   │
│  │         - Real-time subscriptions (optional)             │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                         │   │
│  │              - Table: encuestas                          │   │
│  │              - Row Level Security (RLS)                  │   │
│  │              - Indexes for performance                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              REST API (Auto-generated)                   │   │
│  │              - CRUD operations                           │   │
│  │              - Authentication (optional)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### Encuesta (Survey Flow)

```
Usuario completa formulario
         │
         ▼
React Hook Form valida con Zod
         │
         ▼
SurveyBot component
         │
         ▼
supabase.from('encuestas').insert()
         │
         ▼
Supabase REST API
         │
         ▼
PostgreSQL Database
         │
         ▼
Success Response
         │
         ▼
Usuario ve confirmación
```

### Dashboard (Data Visualization Flow)

```
Dashboard page carga
         │
         ▼
fetch('/api/encuestas')
         │
         ▼
API Route (Next.js)
         │
         ▼
supabase.from('encuestas').select()
         │
         ▼
Supabase REST API
         │
         ▼
PostgreSQL Database
         │
         ▼
JSON Response
         │
         ▼
React State actualizado
         │
         ▼
UI re-renderiza (KPIs, Charts, Table)
```

## 🏛️ Capas de la Aplicación

### 1. Capa de Presentación (Frontend)

**Tecnologías**: React, Next.js, Tailwind CSS, Framer Motion

**Responsabilidades**:
- Renderizado de UI
- Interacción del usuario
- Validación del lado del cliente
- Animaciones y transiciones
- Responsive design

**Componentes Principales**:
- `app/page.tsx` - Landing page
- `app/encuesta/page.tsx` - Survey page
- `app/dashboard/page.tsx` - Dashboard page
- `components/SurveyBot.tsx` - Survey form component

### 2. Capa de Lógica de Negocio

**Tecnologías**: TypeScript, Zod, React Hook Form

**Responsabilidades**:
- Validación de datos
- Transformación de datos
- Cálculo de KPIs
- Lógica de navegación del formulario

**Archivos Clave**:
- `lib/survey-config.ts` - Configuración y validación
- Hooks de React Hook Form
- Custom hooks para lógica de negocio

### 3. Capa de API (Backend)

**Tecnologías**: Next.js API Routes

**Responsabilidades**:
- Endpoints REST
- Server-side logic
- Proxy a Supabase (si es necesario)

**Rutas**:
- `app/api/encuestas/route.ts` - GET endpoint

### 4. Capa de Datos (Database)

**Tecnologías**: Supabase (PostgreSQL)

**Responsabilidades**:
- Persistencia de datos
- Queries SQL
- Row Level Security
- Índices y optimización

**Schema**:
- Tabla `encuestas` con 7 campos

## 🔐 Seguridad

### Row Level Security (RLS)

```sql
-- Permite inserts públicos (para encuestas)
CREATE POLICY "Allow public inserts" ON encuestas
    FOR INSERT WITH CHECK (true);

-- Permite lecturas públicas (para dashboard demo)
-- ⚠️ En producción, restringir a usuarios autenticados
CREATE POLICY "Allow public reads" ON encuestas
    FOR SELECT USING (true);
```

### Variables de Entorno

```
CLIENT-SIDE (NEXT_PUBLIC_*)
├── NEXT_PUBLIC_SUPABASE_URL       # URL pública
└── NEXT_PUBLIC_SUPABASE_ANON_KEY  # Clave pública

SERVER-SIDE
└── DASHBOARD_PASSWORD              # Password del dashboard
```

## 📦 Componentes y Módulos

### Core Modules

```
lib/
├── supabase.ts          # Supabase client singleton
└── survey-config.ts     # Survey configuration & validation

types/
└── database.ts          # TypeScript type definitions

components/
└── SurveyBot.tsx        # Main survey component
```

### Pages (Next.js App Router)

```
app/
├── page.tsx             # Home page (/)
├── encuesta/
│   └── page.tsx         # Survey page (/encuesta)
├── dashboard/
│   └── page.tsx         # Dashboard (/dashboard)
└── api/
    └── encuestas/
        └── route.ts     # API endpoint
```

## 🚀 Deployment Architecture

### Development

```
Local Machine
├── npm run dev (Port 3000)
├── Hot Module Replacement
└── Development Server
```

### Docker Local

```
Docker Container
├── Multi-stage build
├── Alpine Linux
├── Node.js 18
└── Port 3000 exposed
```

### Production (Vercel)

```
Vercel Edge Network
├── CDN Distribution
├── Serverless Functions
│   ├── API Routes
│   └── Server Components
├── Static Assets
└── Automatic Scaling
```

## 🔄 Estado y Cache

### Client State

- **React State**: `useState` para UI state local
- **Form State**: React Hook Form para formularios
- **No global state manager**: No necesario para esta app simple

### Server State

- **No caching**: Datos frescos en cada request
- **Opcional**: Implementar SWR o React Query para caching

## 📊 Rendimiento

### Optimizaciones Implementadas

1. **Next.js Optimizations**:
   - Automatic code splitting
   - Image optimization (si se usan)
   - Font optimization

2. **Database**:
   - Índices en campos frecuentemente consultados
   - Selección específica de columnas

3. **Docker**:
   - Multi-stage build (reduce tamaño)
   - Standalone output
   - Alpine Linux base

### Métricas Esperadas

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90

## 🔌 Integraciones

### Actuales

- ✅ Supabase (Database)
- ✅ Vercel (Hosting)
- ✅ Docker (Containerization)

### Posibles Futuras

- 🔄 Authentication (Supabase Auth, NextAuth.js)
- 🔄 Analytics (Vercel Analytics, Google Analytics)
- 🔄 Monitoring (Sentry, LogRocket)
- 🔄 Email (SendGrid, Resend)
- 🔄 Export (CSV, Excel)

## 🌐 Networking

### API Endpoints

```
GET  /                    # Home page
GET  /encuesta            # Survey page
GET  /dashboard           # Dashboard page
GET  /api/encuestas       # Fetch all surveys
```

### External Services

```
Application → Supabase REST API
            → Supabase Realtime (optional)
```

## 🧪 Testing Strategy (Recomendado)

```
Unit Tests
├── Components (Jest + React Testing Library)
├── Utilities (Jest)
└── Validation schemas (Zod)

Integration Tests
├── API Routes (Supertest)
└── Database queries (Supabase)

E2E Tests
└── User flows (Playwright, Cypress)
```

## 📈 Escalabilidad

### Horizontal Scaling

- ✅ **Stateless**: La app es completamente stateless
- ✅ **Serverless**: Las API routes escalan automáticamente
- ✅ **CDN**: Assets servidos desde CDN

### Vertical Scaling

- **Database**: Supabase Pro permite más conexiones
- **Compute**: Vercel Pro aumenta límites de función

### Límites Actuales (Free Tier)

- Supabase: 500 MB database, 2 GB bandwidth
- Vercel: 100 GB bandwidth, 100 deployments/día

## 💡 Mejores Prácticas Implementadas

1. ✅ **TypeScript**: Type safety en todo el código
2. ✅ **ESLint**: Linting configurado
3. ✅ **Git**: Version control
4. ✅ **Env Variables**: Configuración externalizada
5. ✅ **Component Structure**: Separación de concerns
6. ✅ **Error Handling**: Try-catch en operaciones críticas
7. ✅ **Documentation**: Múltiples guías

---

Esta arquitectura está diseñada para:
- 🚀 Ser fácil de entender y mantener
- 📈 Escalar según necesidades
- 🔒 Ser segura por defecto
- 💰 Ser económica (free tier viable)
- 🔧 Ser fácil de modificar y extender
