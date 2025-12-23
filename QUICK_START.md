# 🚀 Quick Start - NavidadSurvey

¡Empieza en 5 minutos! Esta guía te ayudará a tener la aplicación funcionando rápidamente.

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/iDaniielo/P-Bot-Web-para-Encuesta-y-Reporte.git
cd P-Bot-Web-para-Encuesta-y-Reporte
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

⏱️ Esto tomará 1-2 minutos.

### 3️⃣ Configurar Supabase

#### Opción A: Crear Proyecto Nuevo (Recomendado)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (toma ~2 minutos)
3. Ve a **SQL Editor** → **New Query**
4. Copia y pega el contenido de `supabase-schema.sql`
5. Haz clic en **Run** (Ctrl/Cmd + Enter)

#### Opción B: Usar Credenciales de Prueba (Solo para desarrollo)

Si solo quieres ver cómo funciona la app localmente sin base de datos real, puedes usar credenciales de prueba (los datos no se guardarán).

### 4️⃣ Obtener Credenciales

En tu proyecto de Supabase:
1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (clave larga)

### 5️⃣ Configurar Variables de Entorno

```bash
# Crea el archivo
cp .env.example .env.local

# Edita con tu editor favorito
nano .env.local
# o
code .env.local
```

Pega tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DASHBOARD_PASSWORD=admin123
```

### 6️⃣ Iniciar la Aplicación

```bash
npm run dev
```

🎉 **¡Listo!** Abre [http://localhost:3000](http://localhost:3000)

## 🎯 Probar la Aplicación

### Test 1: Responder Encuesta

1. Haz clic en **"Responder Encuesta"**
2. Completa las 5 preguntas
3. Haz clic en **"Enviar Encuesta"**
4. Verás un mensaje de éxito ✅

### Test 2: Ver Dashboard

1. Vuelve al inicio
2. Haz clic en **"Dashboard CEO"**
3. Verás:
   - Total de encuestas
   - Lugar de compra más popular
   - Gráfico de distribución del presupuesto
   - Tabla con tus respuestas

### Test 3: Verificar en Supabase

1. Ve a tu proyecto en Supabase
2. Abre **Table Editor** → **encuestas**
3. Verás tu respuesta guardada 🎉

## 🐳 Alternativa: Usar Docker

Si prefieres Docker (requiere Docker instalado):

```bash
# Configurar variables
cp .env.example .env
nano .env  # Editar con tus credenciales

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

Abre [http://localhost:3000](http://localhost:3000)

## 📱 URLs de la Aplicación

- **Home**: [http://localhost:3000](http://localhost:3000)
- **Encuesta**: [http://localhost:3000/encuesta](http://localhost:3000/encuesta)
- **Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 🎨 Personalizar

### Cambiar las Preguntas

Edita `lib/survey-config.ts`:

```typescript
export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'mi_pregunta',
    type: 'text',
    question: '¿Tu pregunta aquí?',
    placeholder: 'Escribe aquí...',
    validation: z.string().min(1, 'Campo requerido'),
  },
  // ... más preguntas
];
```

⚠️ **Importante**: Si agregas nuevos campos, actualiza:
1. El `surveySchema` en el mismo archivo
2. La tabla en Supabase (agrega la columna)
3. El tipo `database.ts` si usas TypeScript

### Cambiar Colores

Edita `tailwind.config.ts` o usa las clases de Tailwind directamente en los componentes.

### Agregar Logo

1. Coloca tu logo en la carpeta `public/`
2. Úsalo con `<Image src="/logo.png" />` de Next.js

## 🐛 Solución Rápida de Problemas

### Error: "Missing Supabase environment variables"

✅ **Solución**: Asegúrate de que `.env.local` existe y tiene las variables correctas.

### Error: "Failed to fetch"

✅ **Solución**: 
- Verifica que Supabase esté funcionando
- Revisa las credenciales en `.env.local`
- Asegúrate de haber ejecutado el script SQL

### La app no arranca

✅ **Solución**:
```bash
# Limpia e reinstala
rm -rf node_modules .next
npm install
npm run dev
```

### Puerto 3000 ocupado

✅ **Solución**:
```bash
# Usar otro puerto
PORT=3001 npm run dev
```

## 📚 Siguientes Pasos

Una vez que tengas la app funcionando:

1. ✅ Lee el **README.md** para entender la arquitectura
2. ✅ Consulta **SETUP_GUIDE.md** para configuración avanzada
3. ✅ Revisa **PROJECT_STRUCTURE.md** para entender el código
4. ✅ Lee **VERCEL_DEPLOYMENT.md** para desplegar en producción
5. ✅ Usa **DOCKER_GUIDE.md** si trabajas con Docker

## 💡 Tips

- **Desarrollo**: Usa `npm run dev` - los cambios se reflejan automáticamente
- **Debugging**: Abre las DevTools del navegador (F12) para ver errores
- **Base de Datos**: Usa el Table Editor de Supabase para ver los datos
- **Logs**: Mira la terminal donde ejecutaste `npm run dev`

## 🆘 ¿Necesitas Ayuda?

1. Revisa la sección de [Solución de Problemas](#-solución-rápida-de-problemas)
2. Consulta **SETUP_GUIDE.md** para más detalles
3. Verifica que Node.js 18+ esté instalado: `node --version`
4. Asegúrate de que npm funciona: `npm --version`

## 🎓 Aprende Más

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ✅ Checklist de Inicio

- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Proyecto de Supabase creado
- [ ] Script SQL ejecutado
- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Aplicación iniciada (`npm run dev`)
- [ ] Primera encuesta completada
- [ ] Dashboard visualizado

¡Una vez completes todo, estás listo para empezar a personalizar! 🎉

---

**Tiempo estimado**: 5-10 minutos  
**Nivel**: Principiante  
**Requisitos**: Node.js 18+, cuenta de Supabase (gratis)
