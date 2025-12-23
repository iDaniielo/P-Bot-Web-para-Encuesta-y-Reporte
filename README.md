# NavidadSurvey - Aplicación Web de Encuestas Navideñas

Una aplicación web moderna construida con Next.js 14, TypeScript y Supabase para recolectar y visualizar datos de encuestas navideñas.

## 📚 Documentación

- 🚀 **[Quick Start](QUICK_START.md)** - ¡Empieza en 5 minutos!
- 📖 **[Setup Guide](SETUP_GUIDE.md)** - Guía detallada de configuración
- 🏗️ **[Architecture](ARCHITECTURE.md)** - Diagrama y explicación de la arquitectura
- 📁 **[Project Structure](PROJECT_STRUCTURE.md)** - Estructura de carpetas y archivos
- 🐳 **[Docker Guide](DOCKER_GUIDE.md)** - Guía completa de Docker
- ☁️ **[Vercel Deployment](VERCEL_DEPLOYMENT.md)** - Despliegue en producción
- 📦 **[Deliverables](DELIVERABLES.md)** - Resumen de entregables

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL)
- **Estado/Validación:** React Hook Form + Zod
- **Visualización:** Recharts
- **Animaciones:** Framer Motion
- **Iconos:** Lucide React
- **Despliegue:** Vercel (Producción) y Docker (Local)

## 📁 Estructura del Proyecto

```
/
├── app/
│   ├── api/
│   │   └── encuestas/
│   │       └── route.ts          # API endpoint para obtener encuestas
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard del CEO con KPIs
│   ├── encuesta/
│   │   └── page.tsx               # Página de la encuesta
│   ├── globals.css                # Estilos globales
│   ├── layout.tsx                 # Layout principal
│   └── page.tsx                   # Página de inicio
├── components/
│   └── SurveyBot.tsx              # Componente del bot de encuestas
├── lib/
│   ├── supabase.ts                # Cliente de Supabase
│   └── survey-config.ts           # Configuración dinámica de preguntas
├── types/
│   └── database.ts                # Tipos de TypeScript para la DB
├── supabase-schema.sql            # Script SQL para crear la tabla
├── Dockerfile                     # Configuración Docker
├── docker-compose.yml             # Orquestación Docker
├── .env.example                   # Plantilla de variables de entorno
└── package.json                   # Dependencias del proyecto
```

## 🛠️ Configuración Inicial

### 1. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. En el SQL Editor, ejecuta el script `supabase-schema.sql`
4. Obtén las credenciales del proyecto:
   - Ve a Settings > API
   - Copia `Project URL` y `anon/public key`

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Actualiza con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
DASHBOARD_PASSWORD=admin123
```

### 3. Instalar Dependencias

```bash
npm install
```

## 🚀 Desarrollo Local

### Opción 1: Ejecutar con Node.js

```bash
# Modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### Opción 2: Ejecutar con Docker

```bash
# Construir la imagen
docker build -t navidad-survey .

# Ejecutar el contenedor
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=tu_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key \
  navidad-survey

# O usar Docker Compose
docker-compose up
```

## 🎯 Funcionalidades

### 1. Bot de Encuestas (`/encuesta`)

- **Interfaz conversacional paso a paso**
- **Preguntas dinámicas** configuradas en `lib/survey-config.ts`
- **Validación en tiempo real** con React Hook Form y Zod
- **Barra de progreso** visual
- **Animaciones suaves** con Framer Motion
- **Diseño responsive** optimizado para móviles

#### Preguntas Actuales:

1. ¿Cuál es tu nombre?
2. ¿Cuál es tu número de teléfono?
3. ¿Qué vas a regalar esta Navidad?
4. ¿Dónde comprarás los regalos?
5. ¿Cuánto planeas gastar en total?

### 2. Dashboard del CEO (`/dashboard`)

- **KPIs en tiempo real:**
  - Total de encuestas
  - Top lugar de compra
- **Gráfico de distribución** del presupuesto (Recharts)
- **Tabla paginada** con respuestas recientes
- **Actualización automática** de datos

## 🔧 Configuración Dinámica

### Agregar/Modificar Preguntas

Edita el archivo `lib/survey-config.ts`:

```typescript
export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'nueva_pregunta',
    type: 'text', // 'text' | 'tel' | 'select' | 'radio'
    question: '¿Tu pregunta aquí?',
    placeholder: 'Placeholder opcional',
    options: ['Opción 1', 'Opción 2'], // Solo para select/radio
    validation: z.string().min(1, 'Mensaje de error'),
  },
  // ... más preguntas
];
```

No olvides actualizar el schema de Zod y el tipo de la base de datos.

## 📊 Base de Datos

### Estructura de la Tabla `encuestas`

| Campo        | Tipo      | Descripción                    |
|--------------|-----------|--------------------------------|
| id           | UUID      | Identificador único            |
| created_at   | Timestamp | Fecha de creación              |
| nombre       | Text      | Nombre del participante        |
| telefono     | Text      | Número de teléfono             |
| regalo       | Text      | Tipo de regalo                 |
| lugar_compra | Text      | Lugar de compra                |
| gasto        | Text      | Rango de gasto                 |

## 🚢 Despliegue

### Desplegar en Vercel

1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno en Vercel
3. Vercel detectará automáticamente Next.js y desplegará

### Desplegar con Docker

```bash
# Producción
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en Supabase
- **Variables de entorno** para credenciales sensibles
- **Validación del lado del cliente y servidor**
- **Políticas de Supabase** para control de acceso

## 📝 Scripts Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Construir para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar linter
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.

## 📧 Soporte

Si encuentras algún problema o tienes preguntas, por favor abre un issue en GitHub.

---

Hecho con ❤️ para la temporada navideña 🎄
# P-Bot-Web-para-Encuesta-y-Reporte

Sistema de encuestas paso a paso con dashboard CEO desarrollado con Next.js App Router, Tailwind CSS y Supabase.

## 🚀 Características

- **Bot Encuesta**: Formulario paso a paso dinámico y reutilizable basado en JSON
  - Campos: Nombre, Teléfono, Regalo, Lugar, Gasto
  - Validación en tiempo real
  - Barra de progreso
  - Diseño responsive y accesible

- **Dashboard CEO**: Vista administrativa con KPIs y datos
  - Total de respuestas
  - Gasto promedio
  - Tabla de datos con todas las respuestas
  - Actualización en tiempo real

- **Infraestructura**: Completamente dockerizado
  - Dockerfile para producción
  - docker-compose para desarrollo local
  - Base de datos PostgreSQL incluida

## 📋 Requisitos Previos

- Node.js 20 o superior
- npm o yarn
- Docker y Docker Compose (opcional, para desarrollo con contenedores)
- Cuenta de Supabase (o usar PostgreSQL local)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/iDaniielo/P-Bot-Web-para-Encuesta-y-Reporte.git
cd P-Bot-Web-para-Encuesta-y-Reporte
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 4. Configurar la base de datos

#### Opción A: Usando Supabase (Recomendado)

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. En el SQL Editor, ejecuta el script `database/schema.sql`
4. Copia la URL y la clave anónima a tu archivo `.env.local`

#### Opción B: Usando PostgreSQL local

1. Instala PostgreSQL localmente
2. Crea una base de datos: `createdb pbot_db`
3. Ejecuta el script: `psql -d pbot_db -f database/schema.sql`
4. Configura las variables de entorno para conectarte a tu base de datos local

## 🚀 Desarrollo

### Desarrollo local (sin Docker)

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Desarrollo con Docker

#### Usando docker-compose.dev.yml (recomendado para desarrollo)

```bash
docker-compose -f docker-compose.dev.yml up
```

#### Usando docker-compose.yml (build completo)

```bash
docker-compose up --build
```

La aplicación y PostgreSQL estarán disponibles en:
- App: [http://localhost:3000](http://localhost:3000)
- PostgreSQL: localhost:5432

## 🏗️ Build para Producción

### Build local

```bash
npm run build
npm start
```

### Build con Docker

```bash
docker build -t pbot-app .
docker run -p 3000:3000 --env-file .env.local pbot-app
```

## 📦 Despliegue en Vercel

1. Haz push de tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Despliega

## 🗂️ Estructura del Proyecto

```
.
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard CEO
│   ├── encuesta/          # Página de encuesta
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   └── StepForm.tsx       # Formulario paso a paso
├── lib/                   # Utilidades y configuración
│   ├── supabase.ts        # Cliente de Supabase
│   ├── types.ts           # Tipos TypeScript
│   └── surveyConfig.ts    # Configuración de la encuesta (JSON)
├── database/              # Scripts SQL
│   └── schema.sql         # Schema de la base de datos
├── Dockerfile             # Imagen Docker para producción
├── docker-compose.yml     # Orquestación para desarrollo
├── docker-compose.dev.yml # Versión dev optimizada
└── next.config.ts         # Configuración de Next.js
```

## 🔄 Modificar la Encuesta

Para modificar los campos de la encuesta, edita el archivo `lib/surveyConfig.ts`:

```typescript
export const surveyFields: FormField[] = [
  {
    name: 'campo_personalizado',
    label: '¿Tu pregunta personalizada?',
    type: 'text', // text, tel, number, select
    placeholder: 'Texto de ejemplo',
    required: true,
  },
  // Agrega más campos aquí...
];
```

El formulario se actualizará automáticamente con los nuevos campos.

## 🎨 Tecnologías Utilizadas

- **Next.js 15**: Framework React con App Router
- **React 19**: Biblioteca UI
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utility-first
- **Supabase**: Base de datos y backend
- **Docker**: Contenedorización
- **PostgreSQL**: Base de datos relacional

## 📊 Base de Datos

La tabla `survey_responses` contiene:

- `id`: Identificador único (auto-generado)
- `nombre`: Nombre del encuestado
- `telefono`: Teléfono del encuestado
- `regalo`: Tipo de regalo preferido
- `lugar`: Lugar de compra preferido
- `gasto`: Cantidad típica de gasto (€)
- `created_at`: Fecha de creación

## 🔒 Seguridad

- Row Level Security (RLS) habilitado en Supabase
- Políticas de acceso configuradas para lectura y escritura pública
- Variables de entorno para credenciales sensibles
- Validación de datos en cliente y servidor

## 📝 Licencia

ISC

## 👥 Autor

Daniel (@iDaniielo)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o PR para sugerencias.
