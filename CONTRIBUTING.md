# Contributing to P-Bot

## 🎯 Arquitectura del Proyecto

### Flujo de Datos

```
Usuario → Encuesta (StepForm) → Supabase → Dashboard
```

1. **Usuario completa encuesta** → `app/encuesta/page.tsx`
2. **Datos se validan** → `components/StepForm.tsx`
3. **Se guardan en DB** → Supabase `survey_responses`
4. **CEO ve datos** → `app/dashboard/page.tsx`

### Estructura de Carpetas

```
app/                    # Rutas Next.js (App Router)
├── dashboard/         # Dashboard CEO (solo lectura)
├── encuesta/          # Formulario de encuesta (escritura)
├── layout.tsx         # Layout raíz con metadata
└── page.tsx           # Página de inicio

components/            # Componentes React reutilizables
└── StepForm.tsx       # Componente principal de formulario

lib/                   # Lógica de negocio y configuración
├── supabase.ts        # Cliente Supabase
├── types.ts           # Definiciones TypeScript
└── surveyConfig.ts    # Configuración de campos (JSON)

database/              # Scripts SQL
└── schema.sql         # Schema y migraciones
```

## 🛠️ Desarrollo Local

### Prerequisitos

- Node.js 20+
- npm o yarn
- Git

### Setup

```bash
# Clonar el repo
git clone https://github.com/iDaniielo/P-Bot-Web-para-Encuesta-y-Reporte.git
cd P-Bot-Web-para-Encuesta-y-Reporte

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

### Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Ejecutar build de producción
npm run lint     # Linter (cuando esté configurado)
```

## ✨ Añadir Nuevas Funcionalidades

### 1. Añadir un Nuevo Campo a la Encuesta

**Paso 1**: Actualizar configuración en `lib/surveyConfig.ts`

```typescript
export const surveyFields: FormField[] = [
  // ... campos existentes
  {
    name: 'nuevo_campo',
    label: '¿Tu nueva pregunta?',
    type: 'text',
    required: true,
  },
];
```

**Paso 2**: Actualizar tipos en `lib/types.ts`

```typescript
export interface SurveyResponse {
  id?: number;
  nombre: string;
  telefono: string;
  regalo: string;
  lugar: string;
  gasto: number;
  nuevo_campo: string;  // Añadir aquí
  created_at?: string;
}
```

**Paso 3**: Actualizar schema SQL en `database/schema.sql`

```sql
ALTER TABLE survey_responses 
ADD COLUMN nuevo_campo VARCHAR(255) NOT NULL;
```

**Paso 4**: Actualizar dashboard para mostrar el nuevo campo (opcional)

Edita `app/dashboard/page.tsx` para mostrar la nueva columna.

### 2. Añadir una Nueva Página

**Paso 1**: Crear directorio y archivo

```bash
mkdir -p app/nueva-pagina
touch app/nueva-pagina/page.tsx
```

**Paso 2**: Crear el componente

```typescript
export default function NuevaPaginaPage() {
  return (
    <div>
      <h1>Nueva Página</h1>
    </div>
  );
}
```

**Paso 3**: Añadir link en la navegación (ej: `app/page.tsx`)

### 3. Añadir un Nuevo Componente

**Paso 1**: Crear archivo en `components/`

```bash
touch components/MiComponente.tsx
```

**Paso 2**: Implementar el componente

```typescript
'use client';

interface MiComponenteProps {
  // Props aquí
}

export default function MiComponente({ }: MiComponenteProps) {
  return (
    <div>
      {/* Contenido */}
    </div>
  );
}
```

**Paso 3**: Importar y usar donde se necesite

## 🎨 Guía de Estilos

### Código

- **TypeScript**: Usar tipos estrictos, evitar `any`
- **Componentes**: Funcionales con hooks
- **Naming**: camelCase para variables, PascalCase para componentes
- **Imports**: Ordenados (externos, internos, relativos)

### UI/UX

- **Responsive**: Mobile-first design
- **Dark Mode**: Soportar tema oscuro
- **Accesibilidad**: ARIA labels, keyboard navigation
- **Tailwind**: Usar clases utility-first

### Ejemplo de Componente Bien Estructurado

```typescript
'use client';

import { useState } from 'react';
import { MiTipo } from '@/lib/types';

interface MiComponenteProps {
  titulo: string;
  onSubmit: (data: MiTipo) => void;
}

export default function MiComponente({ titulo, onSubmit }: MiComponenteProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // Lógica aquí
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">{titulo}</h2>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Cargando...' : 'Enviar'}
      </button>
    </div>
  );
}
```

## 🧪 Testing

### Testing Manual

1. Completa el flujo completo de la encuesta
2. Verifica que los datos aparecen en el dashboard
3. Prueba en diferentes navegadores
4. Prueba en móvil y desktop
5. Prueba dark mode

### Checklist Antes de Commit

- [ ] El código compila sin errores (`npm run build`)
- [ ] TypeScript no tiene errores (`npx tsc --noEmit`)
- [ ] La funcionalidad funciona en desarrollo
- [ ] No hay console.logs olvidados
- [ ] Los cambios están documentados

## 📝 Commits

### Formato de Mensajes

```
tipo(scope): descripción corta

Descripción larga opcional
```

**Tipos**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no código)
- `refactor`: Refactorización
- `test`: Añadir tests
- `chore`: Mantenimiento

**Ejemplos**:
```
feat(survey): añadir campo email a la encuesta
fix(dashboard): corregir cálculo de gasto promedio
docs(readme): actualizar instrucciones de instalación
```

## 🔍 Debugging

### Problemas Comunes

**"Module not found"**
```bash
rm -rf node_modules .next
npm install
```

**"Supabase error"**
```bash
# Verificar .env.local
cat .env.local
```

**Build fallido**
```bash
# Limpiar cache
rm -rf .next
npm run build
```

### Herramientas

- **React DevTools**: Para inspeccionar componentes
- **Network Tab**: Para ver requests a Supabase
- **Console**: Para ver errores y logs

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Pull Requests

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/mi-feature`)
3. Commit tus cambios (`git commit -m 'feat: añadir feature'`)
4. Push a la rama (`git push origin feature/mi-feature`)
5. Abre un Pull Request

### PR Checklist

- [ ] El código compila
- [ ] La funcionalidad está probada
- [ ] La documentación está actualizada
- [ ] Los commits siguen el formato
- [ ] No hay conflictos con main

## 🙏 Gracias por Contribuir!

Tu contribución hace que P-Bot sea mejor para todos. Si tienes preguntas, no dudes en abrir un issue.
