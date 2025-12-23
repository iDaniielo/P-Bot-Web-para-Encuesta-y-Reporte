# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto!

## 📋 Antes de Empezar

1. Fork el repositorio
2. Clona tu fork localmente
3. Crea una rama para tu feature: `git checkout -b feature/mi-feature`
4. Configura tu entorno siguiendo el [README.md](README.md)

## 🔧 Configuración del Entorno de Desarrollo

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# Iniciar servidor de desarrollo
pnpm dev
```

## 📝 Convenciones de Código

- **TypeScript**: Todo el código debe estar tipado
- **ESLint**: Ejecuta `pnpm lint` antes de hacer commit
- **Formato**: Usa Prettier (configuración por defecto)
- **Componentes**: Usa functional components con hooks
- **Estilos**: Tailwind CSS (no CSS modules ni styled-components)

## 🌿 Estrategia de Branches

- `main`: Producción (código estable)
- `develop`: Desarrollo (features integradas)
- `feature/*`: Nuevas características
- `fix/*`: Corrección de bugs
- `docs/*`: Documentación

## ✅ Checklist antes de Pull Request

- [ ] El código compila sin errores (`pnpm build`)
- [ ] Pasa el linting (`pnpm lint`)
- [ ] Probado localmente
- [ ] Documentación actualizada (si aplica)
- [ ] Commit messages descriptivos

## 📤 Proceso de Pull Request

1. Push tu rama: `git push origin feature/mi-feature`
2. Abre un Pull Request en GitHub
3. Describe claramente los cambios realizados
4. Espera el code review
5. Aplica los cambios solicitados (si hay)
6. Una vez aprobado, se hará merge

## 🐛 Reportar Bugs

Abre un [issue](https://github.com/tu-usuario/P-Bot-Web-para-Encuesta-y-Reporte/issues) con:

- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots (si aplica)
- Entorno (OS, navegador, versión de Node)

## 💡 Sugerir Features

Abre un [issue](https://github.com/tu-usuario/P-Bot-Web-para-Encuesta-y-Reporte/issues) con:

- Descripción de la funcionalidad
- Caso de uso
- Posible implementación (opcional)
- Mockups o ejemplos (opcional)

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

¡Gracias por contribuir! 🎉
