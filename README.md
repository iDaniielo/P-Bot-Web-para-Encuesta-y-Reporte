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
