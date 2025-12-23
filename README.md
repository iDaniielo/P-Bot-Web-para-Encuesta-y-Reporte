# 🎄 Bot de Encuestas + Dashboard CEO

Sistema web completo de encuestas navideñas con dashboard administrativo, desarrollado con Next.js, Tailwind CSS y Supabase.

## 📋 Tabla de Contenidos

- [Stack Tecnológico](#-stack-tecnológico)
- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Configuración e Instalación](#-configuración-e-instalación)
- [Desarrollo Local](#-desarrollo-local)
- [Docker](#-docker)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Seguridad](#-seguridad)
- [Despliegue en Vercel](#-despliegue-en-vercel)

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Validación**: Zod + React Hook Form
- **Base de Datos**: Supabase (PostgreSQL en la nube - Free Tier)
- **UI**: Lucide Icons, Recharts
- **Animaciones**: Framer Motion
- **Containerización**: Docker
- **Despliegue**: Vercel (recomendado)

## ✨ Características

### 📝 Módulo de Encuesta (Frontend Público)

- **Diseño Mobile-First**: Interfaz limpia y minimalista optimizada para móviles
- **Formulario Paso a Paso**: Experiencia conversacional con barra de progreso
- **Validación Estricta**: 
  - Teléfono: Regex para México `/^\d{10}$/` (exactamente 10 dígitos)
  - Mensajes de error claros e inmediatos
  - Feedback visual en tiempo real
- **UX Mejorada**: 
  - Pantalla de "Gracias" al completar
  - Opción de enviar otra respuesta
  - Animaciones suaves con Framer Motion

### 📊 Dashboard CEO (Frontend Admin)

- **Privacidad CRÍTICA**: Teléfonos enmascarados (ej: `55****6789`)
- **KPIs Calculados**:
  - Total de respuestas
  - Top 3 Regalos más populares (por frecuencia)
  - Top 3 Lugares de compra (por frecuencia)
  - Gasto promedio (formato moneda MXN)
- **Visualizaciones**:
  - Gráfico de distribución de presupuesto (Recharts)
  - Tabla con últimas 10 respuestas ordenadas por fecha
- **Actualización en Tiempo Real**

## 📦 Requisitos Previos

- Node.js 20+ 
- npm o yarn
- Docker y Docker Compose (opcional, para desarrollo con contenedores)
- Cuenta de Supabase (gratuita)

## 🔧 Configuración e Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/iDaniielo/P-Bot-Web-para-Encuesta-y-Reporte.git
cd P-Bot-Web-para-Encuesta-y-Reporte
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. En el SQL Editor de Supabase, ejecuta el script `supabase-schema.sql`
4. Ve a Settings > API y copia:
   - `Project URL` (URL del proyecto)
   - `anon/public key` (Clave anónima)

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Actualiza con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

## 💻 Desarrollo Local

### Opción 1: Ejecutar con Node.js

```bash
# Modo desarrollo con hot reload
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### Opción 2: Build de Producción Local

```bash
# Construir la aplicación
npm run build

# Ejecutar en modo producción
npm start
```

## 🐳 Docker

### Desarrollo con Docker

```bash
# Construir la imagen
docker build -t encuesta-navidad .

# Ejecutar el contenedor
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=tu_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key \
  encuesta-navidad
```

### Usando Docker Compose

```bash
# Crear archivo .env con tus variables
cp .env.example .env

# Construir y ejecutar
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 📁 Estructura del Proyecto

```
.
├── app/
│   ├── api/
│   │   └── encuestas/
│   │       └── route.ts          # API endpoint para obtener encuestas
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard CEO con KPIs y phone masking
│   ├── encuesta/
│   │   └── page.tsx               # Página del formulario de encuesta
│   ├── globals.css                # Estilos globales con Tailwind
│   ├── layout.tsx                 # Layout principal de la app
│   └── page.tsx                   # Página de inicio
├── components/
│   └── SurveyBot.tsx              # Componente del bot de encuestas paso a paso
├── lib/
│   ├── supabase.ts                # Cliente configurado de Supabase
│   └── survey-config.ts           # Configuración de preguntas y validaciones
├── types/
│   └── database.ts                # Tipos TypeScript para la DB
├── supabase-schema.sql            # Script SQL para crear la tabla
├── Dockerfile                     # Imagen Docker optimizada multi-stage
├── docker-compose.yml             # Orquestación de contenedores
├── .env.example                   # Plantilla de variables de entorno
└── package.json                   # Dependencias del proyecto
```

## 🔐 Seguridad

### Implementación Actual (Desarrollo/Demo)

- ✅ **Row Level Security (RLS)** habilitado en Supabase
- ✅ **Enmascaramiento de teléfonos** en el Dashboard (`55****6789`)
- ✅ **Variables de entorno** para credenciales
- ✅ **Validación client-side** con Zod
- ⚠️ Políticas RLS permisivas para demo (INSERT y SELECT públicos)

### Recomendaciones para Producción

Para un entorno de producción real, deberías implementar:

#### 1. Autenticación y Autorización
- **Implementar autenticación** usando Supabase Auth o NextAuth.js
- **2FA (Two-Factor Authentication)** obligatorio para acceso al dashboard
- **Roles y permisos**: Separar roles de usuario (público) y administrador (CEO)
- **Sesiones seguras** con tokens JWT y refresh tokens

#### 2. Políticas RLS Estrictas

```sql
-- Ejemplo de política para solo inserción pública
CREATE POLICY "Allow public inserts only" ON public.encuestas
    FOR INSERT
    WITH CHECK (true);

-- Lectura solo para usuarios autenticados con rol admin
CREATE POLICY "Admin read only" ON public.encuestas
    FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');
```

#### 3. Protección de Datos Sensibles
- **Cifrado en reposo**: Habilitar cifrado a nivel de base de datos
- **Cifrado en tránsito**: Asegurar HTTPS en todas las comunicaciones
- **Anonimización adicional**: Considerar hash de teléfonos en lugar de almacenamiento directo
- **Auditoría**: Logs de acceso a datos sensibles

#### 4. Rate Limiting y Protección DDoS
- **Rate limiting** en endpoints de API
- **Cloudflare** o similar para protección DDoS
- **CAPTCHA** en el formulario para prevenir spam

#### 5. Monitoreo y Alertas
- **Logging centralizado** (Sentry, LogRocket)
- **Alertas** de acceso no autorizado
- **Backups automáticos** de la base de datos

#### 6. Cumplimiento Legal
- **GDPR/LOPD** si opera en EU/España
- **Ley Federal de Protección de Datos** (México)
- **Políticas de privacidad** claras
- **Consentimiento explícito** para recolección de datos

## ☁️ Despliegue en Vercel

### Paso a Paso

1. **Push a GitHub**
   ```bash
   git push origin main
   ```

2. **Conectar con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js

3. **Configurar Variables de Entorno**
   En el panel de Vercel, añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**
   - Vercel construirá y desplegará automáticamente
   - Cada push a `main` activará un nuevo deploy

### Deploy Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

## 🎯 Uso

### Encuesta
1. Navega a `/encuesta`
2. Completa el formulario paso a paso
3. Valida que tu teléfono sea de 10 dígitos
4. Recibe confirmación de envío

### Dashboard
1. Navega a `/dashboard`
2. Visualiza KPIs en tiempo real
3. Consulta Top 3 regalos y lugares
4. Revisa últimas 10 respuestas (teléfonos enmascarados)

## 🧪 Testing

```bash
# Linting
npm run lint

# Build (verifica errores de tipos)
npm run build
```

## 📝 Licencia

ISC

## 👨‍💻 Autor

Daniel (@iDaniielo)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Nota**: Este proyecto fue desarrollado como prueba técnica para demostrar habilidades en:
- Next.js con App Router
- Integración con Supabase
- Validación de formularios
- Visualización de datos
- Docker y despliegue en la nube
- Mejores prácticas de seguridad

Hecho con ❤️ para la temporada navideña 🎄
