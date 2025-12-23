# 🎄 Survey Bot - Encuesta Navideña + Dashboard CEO

Sistema completo de encuestas con chatbot interactivo y dashboard de análisis. Construido con Next.js 15, Tailwind CSS 4, y Supabase.

## 🚀 Características

### 📝 Encuesta Interactiva (Bot)

- Chatbot conversacional paso a paso
- Validación en tiempo real
- Diseño responsive y moderno
- Soporte para múltiples tipos de preguntas (texto, teléfono, selección múltiple)

### 📊 Dashboard CEO

- Métricas y estadísticas en tiempo real
- Gráficos interactivos (Recharts)
- Exportación a Excel
- Gestión dinámica de preguntas
- Autenticación segura con Supabase

### 🎨 Gestión de Preguntas

- Sistema CRUD completo
- Reordenamiento drag & drop
- Preguntas dinámicas configurables
- Validación y sanitización automática

## 📋 Requisitos Previos

- **Node.js** 18+
- **pnpm** (recomendado) o npm
- Cuenta en **Supabase** (gratuita)

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/P-Bot-Web-para-Encuesta-y-Reporte.git
cd P-Bot-Web-para-Encuesta-y-Reporte
```

### 2. Instalar Dependencias

```bash
pnpm install
# o
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**Para obtener estas credenciales:**

1. Ve a [Supabase](https://app.supabase.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Settings** → **API**
4. Copia `Project URL` y `anon public` key

### 4. Configurar la Base de Datos

Ve al **SQL Editor** en Supabase y ejecuta el siguiente script completo:

```sql
-- 1. Crear schema API
CREATE SCHEMA IF NOT EXISTS api;

-- 2. Crear tabla de encuestas
CREATE TABLE IF NOT EXISTS api.encuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    regalo TEXT[] NOT NULL,
    regalo_otro TEXT,
    lugar_compra TEXT NOT NULL,
    gasto TEXT NOT NULL
);

-- 3. Crear tabla de preguntas dinámicas
CREATE TABLE IF NOT EXISTS api.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_key TEXT NOT NULL UNIQUE,
    question_type TEXT NOT NULL CHECK (question_type IN ('text', 'phone', 'checkbox', 'radio', 'select')),
    options JSONB,
    validation_rules JSONB,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON api.survey_questions(order_index);
CREATE INDEX IF NOT EXISTS idx_survey_questions_active ON api.survey_questions(is_active);

-- 5. Habilitar RLS
ALTER TABLE api.encuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.survey_questions ENABLE ROW LEVEL SECURITY;

-- 6. Políticas para encuestas
CREATE POLICY "allow_public_insert_encuestas" ON api.encuestas
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "allow_authenticated_select_encuestas" ON api.encuestas
    FOR SELECT TO authenticated USING (true);

-- 7. Políticas para preguntas
CREATE POLICY "allow_all_select_questions" ON api.survey_questions
    FOR SELECT USING (true);

CREATE POLICY "allow_authenticated_insert_questions" ON api.survey_questions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "allow_authenticated_update_questions" ON api.survey_questions
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete_questions" ON api.survey_questions
    FOR DELETE TO authenticated USING (true);

-- 8. Permisos del schema
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT ALL ON api.survey_questions TO authenticated;
GRANT SELECT ON api.survey_questions TO anon;
GRANT ALL ON api.encuestas TO authenticated;
GRANT INSERT ON api.encuestas TO anon;
```

### 5. Crear Usuario Administrador

1. Ve a **Authentication** → **Users** en Supabase
2. Click en **Add User** → **Create new user**
3. Ingresa email y contraseña
4. Guarda estas credenciales para iniciar sesión

### 6. Iniciar el Servidor de Desarrollo

```bash
pnpm dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── encuestas/route.ts      # API de encuestas
│   │   └── questions/route.ts      # API de preguntas
│   ├── dashboard/page.tsx           # Dashboard CEO
│   ├── encuesta/page.tsx            # Formulario de encuesta
│   ├── login/page.tsx               # Página de login
│   └── signup/page.tsx              # Página de registro
├── components/
│   ├── QuestionManager.tsx          # Gestión de preguntas
│   ├── StepForm.tsx                 # Formulario por pasos
│   └── SurveyBot.tsx                # Chatbot de encuesta
├── database/
│   └── *.sql                        # Scripts de base de datos
├── hooks/
│   └── useAuth.ts                   # Hook de autenticación
├── lib/
│   ├── supabase-browser.ts          # Cliente Supabase (navegador)
│   ├── supabase-server.ts           # Cliente Supabase (servidor)
│   ├── excel-export.ts              # Exportación Excel
│   └── types.ts                     # Tipos TypeScript
├── types/
│   └── database.ts                  # Tipos de base de datos
└── middleware.ts                    # Middleware de auth
```

## 🔐 Autenticación

El sistema usa **Supabase Auth** con Row Level Security (RLS):

- **Rutas públicas**: `/`, `/encuesta`, `/login`, `/signup`
- **Rutas protegidas**: `/dashboard` (requiere autenticación)

### Iniciar Sesión

1. Ve a `/login`
2. Usa las credenciales del usuario creado en Supabase
3. Serás redirigido al dashboard

## 📊 Uso del Dashboard

### Ver Estadísticas

- Accede a `/dashboard`
- Visualiza métricas en tiempo real
- Filtra por fechas y categorías

### Gestionar Preguntas

1. Click en **⚙️ Gestión de Preguntas**
2. Agrega nuevas preguntas con **+ Nueva Pregunta**
3. Edita, reordena o elimina preguntas existentes
4. Los cambios se reflejan inmediatamente en el formulario

### Exportar Datos

- Click en **Descargar Excel** en el dashboard
- Se descarga un archivo con todas las respuestas

## 🎨 Personalización

### Cambiar Preguntas de la Encuesta

Las preguntas se gestionan desde el dashboard en **Gestión de Preguntas**.

### Modificar Estilos

Los estilos usan **Tailwind CSS 4**. Edita:

- `app/globals.css` - Estilos globales
- Componentes individuales - Clases Tailwind inline

## � Seguridad y Protección de Datos Sensibles

### 📞 Protección de Números Telefónicos

El sistema recolecta números telefónicos como datos de contacto. Para proteger esta información sensible:

#### ✅ Implementación Actual (Desarrollo)

**Enmascaramiento Visual en el Dashboard:**

```typescript
// app/dashboard/page.tsx
const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 6) return phone;
  const first2 = phone.substring(0, 2);
  const last4 = phone.substring(phone.length - 4);
  return `${first2}****${last4}`; // Ejemplo: 5551234567 → 55****4567
};
```

**Características actuales:**

- ✅ Teléfonos enmascarados en todas las tablas del dashboard
- ✅ Solo se muestran primeros 2 y últimos 4 dígitos
- ✅ Validación estricta de formato (10 dígitos para México)
- ⚠️ Datos completos accesibles desde la base de datos (modo desarrollo)

#### 🚀 Protección en Producción

Para un entorno de producción con datos reales, **DEBES** implementar:

##### 1. Cifrado en Base de Datos

```sql
-- Instalar extensión de cifrado
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Cifrar columna de teléfonos
ALTER TABLE encuestas
ALTER COLUMN telefono
TYPE bytea USING pgp_sym_encrypt(telefono, current_setting('app.encryption_key'));

-- Vista con descifrado controlado
CREATE VIEW encuestas_admin AS
SELECT
  id,
  nombre,
  pgp_sym_decrypt(telefono::bytea, current_setting('app.encryption_key')) as telefono,
  regalo, lugar_compra, gasto, created_at
FROM encuestas;

-- Revocar acceso directo
REVOKE ALL ON encuestas FROM public;
GRANT SELECT ON encuestas_admin TO authenticated;
```

##### 2. Separación de Datos Sensibles

```sql
-- Tabla principal (datos no sensibles)
CREATE TABLE encuestas_anonimas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono_id UUID REFERENCES datos_sensibles(id),
  regalo TEXT[],
  lugar_compra TEXT,
  gasto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla separada con acceso ultra-restringido
CREATE TABLE datos_sensibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefono_encrypted BYTEA,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS estricto
CREATE POLICY "Solo admins con rol específico"
ON datos_sensibles FOR SELECT
USING (auth.jwt() ->> 'role' = 'super_admin');
```

##### 3. Hashing para Anonimización (Alternativa)

```typescript
// lib/crypto.ts
import { createHmac } from "crypto";

export function hashPhone(phone: string): string {
  const secret = process.env.PHONE_HASH_SECRET!;
  return createHmac("sha256", secret)
    .update(phone)
    .digest("hex")
    .substring(0, 16);
}

// Uso: Almacenar hash en lugar del teléfono real
// Permite detectar duplicados sin exponer datos
```

##### 4. Auditoría de Accesos

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;

  // Log de accesos a datos sensibles
  if (url.startsWith("/api/encuestas")) {
    console.log({
      timestamp: new Date().toISOString(),
      action: "ACCESS_SENSITIVE_DATA",
      user: request.headers.get("x-user-email"),
      ip: request.ip || request.headers.get("x-forwarded-for"),
    });
  }

  return NextResponse.next();
}
```

##### 5. Retención Limitada (GDPR/LFPDPPP)

```sql
-- Eliminación automática de datos antiguos
CREATE OR REPLACE FUNCTION eliminar_datos_antiguos()
RETURNS void AS $$
BEGIN
  DELETE FROM encuestas
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Programar ejecución mensual con pg_cron
SELECT cron.schedule(
  'eliminar-datos-viejos',
  '0 0 1 * *',
  'SELECT eliminar_datos_antiguos()'
);
```

### 🛡️ Otras Medidas de Seguridad para Producción

#### Autenticación Robusta

- ✅ **Ya implementado**: Login con Supabase Auth
- 🔜 **Recomendado**: 2FA (Two-Factor Authentication)
- 🔜 **Roles granulares**: Super Admin, Admin, Viewer

#### Políticas RLS Estrictas

```sql
-- Solo inserción pública (encuesta)
CREATE POLICY "Public inserts only" ON encuestas
  FOR INSERT WITH CHECK (true);

-- Lectura solo para admins autenticados
CREATE POLICY "Authenticated admins only" ON encuestas
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'role' = 'admin'
  );
```

#### Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 encuestas por hora
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }
}
```

#### Monitoreo y Alertas

- **Sentry** para errores en producción
- **Logs centralizados** (CloudWatch, Datadog)
- **Alertas** de acceso sospechoso
- **Backups automáticos** diarios

### 📋 Cumplimiento Legal

Para operar con datos personales en producción:

#### México: LFPDPPP

- ✅ Aviso de Privacidad accesible
- ✅ Consentimiento explícito para recolección
- ✅ Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)
- ✅ Periodo de retención definido

#### Europa: GDPR

- ✅ Base legal para procesamiento
- ✅ Derecho al olvido
- ✅ Portabilidad de datos
- ✅ Data Protection Officer (si aplica)

#### Plantilla de Aviso de Privacidad

```markdown
### Tratamiento de Datos de Contacto

**Datos recolectados:** Nombre y número telefónico

**Finalidad:** Contacto para seguimiento de encuesta navideña

**Seguridad:**

- Almacenamiento cifrado en base de datos
- Enmascaramiento en interfaces administrativas
- Acceso restringido solo a personal autorizado

**Retención:** Los datos se conservan por [período] y se eliminan automáticamente

**Tus derechos:**

- Acceso a tus datos
- Rectificación de información incorrecta
- Cancelación (eliminación)
- Oposición al tratamiento

**Contacto:** [email de privacidad]
```

## �🚢 Despliegue

### Vercel (Recomendado)

1. Push tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático ✅

### Docker

```bash
# Desarrollo
docker-compose up

# Producción
docker-compose -f docker-compose.yml up -d
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Iniciar producción
pnpm start

# Linting
pnpm lint
```

## 🐛 Solución de Problemas

### Error: "permission denied for table survey_questions"

**Solución:**

1. Ejecuta `fix-permissions-simple.sql` en Supabase SQL Editor
2. Refresca tu navegador (F5)
3. Limpia cookies si es necesario (F12 → Application → Cookies → Clear)

### Error: "No tienes permisos para ver las preguntas"

**Causa:** Las políticas RLS no están configuradas.

**Solución:**

1. Ve a Supabase → SQL Editor
2. Ejecuta el script SQL completo del paso 4 de instalación
3. Verifica que se crearon las políticas en Authentication → Policies

### No aparecen preguntas en la encuesta

**Solución:**

1. Ve al Dashboard → Gestión de Preguntas
2. Crea al menos una pregunta
3. Asegúrate de marcarla como "activa"

## 📚 Tecnologías

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Autenticación**: Supabase Auth + @supabase/ssr
- **Gráficos**: [Recharts](https://recharts.org/)
- **Íconos**: [Lucide React](https://lucide.dev/)
- **Exportación**: [XLSX](https://docs.sheetjs.com/)
- **Lenguaje**: TypeScript

## 📄 Licencia

ISC

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa la sección de **Solución de Problemas**
2. Verifica que ejecutaste el script SQL completo
3. Asegúrate de que las variables de entorno están configuradas
4. Verifica que tienes un usuario creado en Supabase Authentication

---

Desarrollado con ❤️ para encuestas navideñas
