# NavidadSurvey - Aplicación Web de Encuestas Navideñas

Una aplicación web moderna construida con Next.js 14, TypeScript y Supabase para recolectar y visualizar datos de encuestas navideñas.

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