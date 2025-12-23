# Guía de Configuración - NavidadSurvey

Esta guía te ayudará a configurar y ejecutar la aplicación NavidadSurvey desde cero.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Cuenta de Supabase (gratuita)
- Docker (opcional, para despliegue local)

## 🚀 Paso a Paso

### 1. Configuración de Supabase

#### 1.1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y regístrate/inicia sesión
2. Haz clic en "New Project"
3. Completa la información:
   - **Nombre del proyecto:** NavidadSurvey
   - **Database Password:** Guarda esta contraseña de forma segura
   - **Region:** Elige la más cercana a tus usuarios
   - **Pricing Plan:** Free tier es suficiente para empezar
4. Espera 2-3 minutos mientras se crea el proyecto

#### 1.2. Ejecutar el Script SQL

1. En tu proyecto de Supabase, ve al menú lateral y selecciona **SQL Editor**
2. Haz clic en **"New Query"**
3. Copia y pega el contenido del archivo `supabase-schema.sql`
4. Haz clic en **"Run"** (o presiona Ctrl/Cmd + Enter)
5. Verifica que aparezca el mensaje: "Success. No rows returned"

#### 1.3. Verificar la Tabla Creada

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver la tabla `encuestas` con todos los campos
3. La tabla debe tener las siguientes columnas:
   - id (uuid)
   - created_at (timestamptz)
   - nombre (text)
   - telefono (text)
   - regalo (text)
   - lugar_compra (text)
   - gasto (text)

#### 1.4. Obtener las Credenciales

1. Ve a **Settings** > **API** en el menú lateral
2. Copia los siguientes valores:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** Una clave larga que empieza con `eyJ...`

### 2. Configuración del Proyecto

#### 2.1. Clonar o Descargar el Repositorio

```bash
# Si tienes git
git clone [url-del-repositorio]
cd P-Bot-Web-para-Encuesta-y-Reporte

# O descarga el ZIP y extráelo
```

#### 2.2. Instalar Dependencias

```bash
npm install
```

Este proceso puede tardar 2-3 minutos.

#### 2.3. Configurar Variables de Entorno

```bash
# Crea el archivo de configuración
cp .env.example .env.local
```

Abre `.env.local` en tu editor y reemplaza los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DASHBOARD_PASSWORD=admin123
```

### 3. Ejecutar la Aplicación

#### Opción A: Modo Desarrollo (Recomendado para Pruebas)

```bash
npm run dev
```

La aplicación estará disponible en: [http://localhost:3000](http://localhost:3000)

#### Opción B: Modo Producción Local

```bash
# Construir la aplicación
npm run build

# Iniciar el servidor
npm start
```

#### Opción C: Con Docker

```bash
# Asegúrate de tener un archivo .env con tus credenciales
cp .env.example .env

# Edita el .env con tus valores de Supabase

# Iniciar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f navidad-survey

# Detener
docker-compose down
```

### 4. Probar la Aplicación

#### 4.1. Página Principal

1. Abre [http://localhost:3000](http://localhost:3000)
2. Deberías ver dos tarjetas:
   - "Responder Encuesta"
   - "Dashboard CEO"

#### 4.2. Probar la Encuesta

1. Haz clic en **"Responder Encuesta"**
2. Completa el formulario paso a paso:
   - Nombre
   - Teléfono
   - Regalo
   - Lugar de compra
   - Gasto estimado
3. Haz clic en **"Enviar Encuesta"**
4. Deberías ver un mensaje de éxito

#### 4.3. Verificar en Supabase

1. Ve a tu proyecto en Supabase
2. Abre **Table Editor** > **encuestas**
3. Deberías ver tu respuesta registrada

#### 4.4. Ver el Dashboard

1. Vuelve a la página principal
2. Haz clic en **"Dashboard CEO"**
3. Deberías ver:
   - KPIs con el total de encuestas
   - Top lugar de compra
   - Gráfico de distribución del presupuesto
   - Tabla con las respuestas

## 🔧 Personalización

### Cambiar las Preguntas de la Encuesta

1. Abre `lib/survey-config.ts`
2. Modifica el array `surveyQuestions`
3. Ejemplo para agregar una nueva pregunta:

```typescript
{
  id: 'email',
  type: 'text',
  question: '¿Cuál es tu email?',
  placeholder: 'ejemplo@correo.com',
  validation: z.string().email('Email inválido'),
}
```

4. Actualiza el schema de Zod:

```typescript
export const surveySchema = z.object({
  // ... campos existentes
  email: z.string().email('Email inválido'),
});
```

5. Actualiza la base de datos en Supabase:

```sql
ALTER TABLE encuestas ADD COLUMN email TEXT;
```

### Cambiar los Colores del Tema

Edita `app/globals.css` o `tailwind.config.ts` para personalizar los colores.

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"

**Solución:** Verifica que el archivo `.env.local` existe y contiene las variables correctas.

### Error: "Failed to fetch"

**Solución:** 
1. Verifica que Supabase está funcionando
2. Revisa las políticas RLS en Supabase
3. Asegúrate de que las credenciales son correctas

### El gráfico no se muestra

**Solución:**
1. Asegúrate de tener al menos una encuesta respondida
2. Verifica la consola del navegador en busca de errores

### Error al construir con Docker

**Solución:**
1. Asegúrate de que el archivo `.env` existe
2. Verifica que Docker está ejecutándose
3. Prueba reconstruir: `docker-compose build --no-cache`

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de React Hook Form](https://react-hook-form.com/)
- [Documentación de Zod](https://zod.dev/)
- [Documentación de Recharts](https://recharts.org/)

## 💡 Consejos

1. **Desarrollo:** Usa `npm run dev` para ver cambios en tiempo real
2. **Depuración:** Abre las DevTools del navegador (F12) para ver errores
3. **Base de Datos:** Usa el Table Editor de Supabase para inspeccionar datos
4. **Logs:** Revisa la consola del terminal donde ejecutaste `npm run dev`

## 🎯 Próximos Pasos

1. Personaliza las preguntas según tus necesidades
2. Ajusta los estilos y colores
3. Agrega autenticación real para el dashboard
4. Implementa exportación de datos a CSV/Excel
5. Despliega en Vercel para producción

## 📞 Ayuda

Si necesitas ayuda adicional:
1. Revisa el archivo README.md principal
2. Consulta la documentación de las tecnologías usadas
3. Abre un issue en el repositorio

---

¡Listo! Ahora tienes tu aplicación NavidadSurvey funcionando. 🎄✨
