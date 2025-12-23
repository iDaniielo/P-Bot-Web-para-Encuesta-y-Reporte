# Guía de Configuración de Autenticación

## Descripción General

El sistema ahora cuenta con autenticación protegida para el dashboard mientras mantiene la encuesta completamente pública y accesible sin autenticación.

### Estructura de Rutas

- **`/encuesta`** - Pública, sin autenticación requerida
- **`/dashboard`** - Protegida, requiere iniciar sesión
- **`/login`** - Pública, página de inicio de sesión
- **`/signup`** - Pública, página de registro

## Configuración en Supabase

### 1. Habilitar Autenticación por Email

1. En el dashboard de Supabase, ve a **Authentication > Providers**
2. Busca **Email** y asegúrate de que está habilitado
3. Configura las siguientes opciones:
   - **Enable email signup**: Habilitado
   - **Confirm email**: Opcional (si lo deseas, los usuarios deberán confirmar su email)
   - **Double confirm changes**: Opcional

### 2. URLs de Redireccionamiento

En **Authentication > URL Configuration**, agrega las siguientes URLs de sitio autorizado:

```
http://localhost:3000
http://localhost:3000/auth/callback
https://tu-dominio.com
https://tu-dominio.com/auth/callback
```

### 3. Configurar SMTP (Opcional, para enviar emails)

Si deseas que los usuarios reciban emails de confirmación:

1. Ve a **Project Settings > Email Templates**
2. Configura un servicio SMTP externo o usa el SMTP de prueba de Supabase

## Variantes de Entorno

Asegúrate de que tu archivo `.env.local` contenga:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## Características Implementadas

### 1. Middleware de Autenticación

El archivo `middleware.ts` en la raíz del proyecto:

- Verifica si el usuario está autenticado al intentar acceder a `/dashboard`
- Redirige automáticamente a `/login` si no hay token válido
- Permite acceso a rutas públicas sin restricciones

### 2. Hook `useAuth`

Ubicado en `hooks/useAuth.ts`, proporciona:

- `user` - Objeto del usuario autenticado
- `loading` - Estado de carga
- `isAuthenticated` - Booleano indicando si está autenticado
- `logout()` - Función para cerrar sesión

### 3. Página de Login

- Ubicada en `app/login/page.tsx`
- Autentica contra Supabase usando email y contraseña
- Almacena el token en una cookie
- Redirige a `/dashboard` tras login exitoso

### 4. Página de Signup

- Ubicada en `app/signup/page.tsx`
- Permite crear nuevas cuentas
- Validación de contraseñas
- Redirige a login tras registro exitoso

### 5. Dashboard Actualizado

- Botón de "Cerrar Sesión" en la esquina superior derecha
- Muestra el email del usuario autenticado
- Requiere autenticación para acceder

## Flujo de Usuario

### Nuevo Usuario

1. Usuario intenta acceder a `/dashboard`
2. Middleware redirige a `/login`
3. Usuario hace clic en "Regístrate aquí"
4. Completa el formulario de registro en `/signup`
5. Crea su cuenta en Supabase
6. Es redirigido a `/login`
7. Inicia sesión con sus credenciales
8. Puede acceder al dashboard

### Usuario Existente

1. Usuario intenta acceder a `/dashboard`
2. Middleware redirige a `/login` (si no tiene token)
3. Inicia sesión con sus credenciales
4. Token se almacena en cookie
5. Accede al dashboard

### Encuesta Pública

- La ruta `/encuesta` es completamente pública
- No requiere autenticación
- Cualquier usuario puede responder sin registrarse

## Seguridad

### Consideraciones Actuales

- Tokens almacenados en cookies HTTP-only (recomendado)
- Validación en el middleware (servidor)
- Validación en el cliente con `useAuth` hook
- Cierre de sesión limpia con Supabase

### Mejoras Futuras Recomendadas

1. **Refresh Tokens**: Implementar rotación automática de tokens
2. **RLS (Row Level Security)**: Configurar en Supabase para limitar datos por usuario
3. **Rate Limiting**: Limitar intentos de login fallidos
4. **2FA**: Autenticación de dos factores
5. **Session Timeout**: Cerrar sesión tras inactividad

## Pruebas

### Localmente

```bash
npm run dev
```

1. Abre `http://localhost:3000/encuesta` - Debería funcionar sin login
2. Abre `http://localhost:3000/dashboard` - Debería redirigir a `/login`
3. Ve a `/signup` y crea una cuenta
4. Inicia sesión en `/login`
5. Ahora deberías poder ver `/dashboard`
6. Prueba "Cerrar Sesión"
7. Deberías ser redirigido a `/login`

## Solución de Problemas

### "No se puede iniciar sesión"

1. Verifica que Supabase está corriendo
2. Confirma que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son correctos
3. Revisa la consola para errores

### "Dashboard no protegido"

1. Verifica que `middleware.ts` existe en la raíz
2. Reinicia el servidor de desarrollo
3. Limpia cookies del navegador

### "Cookies no se guardan"

1. En desarrollo local, las cookies pueden no funcionar con `localhost`
2. Usa `127.0.0.1` en lugar de `localhost` si es necesario
3. Verifica las opciones de cookie en `middleware.ts`

## Estructura de Archivos

```
├── middleware.ts                 # Protección de rutas
├── hooks/
│   └── useAuth.ts               # Hook de autenticación
├── components/
│   └── ProtectedRoute.tsx        # Componente protegido (opcional)
└── app/
    ├── login/
    │   └── page.tsx             # Página de login
    ├── signup/
    │   └── page.tsx             # Página de signup
    ├── dashboard/
    │   └── page.tsx             # Dashboard protegido
    └── encuesta/
        └── page.tsx             # Encuesta pública
```

## Próximos Pasos

1. Configura Supabase según las instrucciones anteriores
2. Prueba el flujo de autenticación localmente
3. Ajusta las opciones de seguridad según tus necesidades
4. Considera implementar las mejoras futuras recomendadas
5. Despliega a producción

---

**Nota**: Asegúrate de revisar la documentación oficial de [Supabase Auth](https://supabase.com/docs/guides/auth) para más detalles sobre configuración avanzada.
