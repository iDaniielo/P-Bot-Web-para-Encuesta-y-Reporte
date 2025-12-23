# Guía de Docker - NavidadSurvey

Esta guía te ayudará a ejecutar la aplicación NavidadSurvey usando Docker.

## 📋 Requisitos

- Docker Desktop instalado (para Windows/Mac) o Docker Engine (para Linux)
- Docker Compose (incluido en Docker Desktop)
- Credenciales de Supabase configuradas

## 🚀 Configuración Rápida

### 1. Preparar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales reales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_key_aqui
DASHBOARD_PASSWORD=tu_password_seguro
```

### 2. Construir y Ejecutar con Docker Compose

```bash
# Iniciar la aplicación en segundo plano
docker-compose up -d

# Ver los logs en tiempo real
docker-compose logs -f

# Detener la aplicación
docker-compose down
```

La aplicación estará disponible en: [http://localhost:3000](http://localhost:3000)

## 🔧 Comandos Útiles

### Ver el Estado de los Contenedores

```bash
docker-compose ps
```

### Ver Logs

```bash
# Ver todos los logs
docker-compose logs

# Ver logs en tiempo real
docker-compose logs -f navidad-survey

# Ver las últimas 50 líneas
docker-compose logs --tail=50 navidad-survey
```

### Reiniciar la Aplicación

```bash
docker-compose restart
```

### Detener la Aplicación

```bash
# Detener pero mantener los contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores e imágenes
docker-compose down --rmi all
```

### Reconstruir la Imagen

Si haces cambios en el código:

```bash
# Reconstruir sin caché
docker-compose build --no-cache

# Reconstruir y reiniciar
docker-compose up -d --build
```

## 🐳 Uso Avanzado de Docker

### Construir Imagen Manualmente

```bash
# Construir la imagen
docker build -t navidad-survey:latest .

# Ver las imágenes
docker images
```

### Ejecutar sin Docker Compose

```bash
# Ejecutar el contenedor
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon \
  -e DASHBOARD_PASSWORD=admin123 \
  --name navidad-survey-app \
  navidad-survey:latest

# Ver logs
docker logs -f navidad-survey-app

# Detener y eliminar
docker stop navidad-survey-app
docker rm navidad-survey-app
```

### Acceder al Contenedor

```bash
# Ejecutar shell en el contenedor
docker-compose exec navidad-survey sh

# O con el contenedor directo
docker exec -it navidad-survey-app sh
```

### Inspeccionar el Contenedor

```bash
# Ver detalles del contenedor
docker inspect navidad-survey-app

# Ver uso de recursos
docker stats navidad-survey-app
```

## 📊 Optimización de la Imagen

### Tamaño de la Imagen

La imagen está optimizada usando:

- **Multi-stage build**: Reduce el tamaño final
- **Node Alpine**: Imagen base ligera
- **Standalone output**: Solo archivos necesarios

Verificar el tamaño:

```bash
docker images navidad-survey
```

### Limpieza de Recursos

```bash
# Eliminar imágenes no utilizadas
docker image prune

# Eliminar contenedores detenidos
docker container prune

# Limpieza completa
docker system prune -a
```

## 🔒 Seguridad

### Variables de Entorno Seguras

**Nunca** commits el archivo `.env` al repositorio. Usa:

- `.env.example` como plantilla
- Variables de entorno del sistema en producción
- Secrets de Docker Swarm/Kubernetes para producción

### Actualizar Dependencias

```bash
# Reconstruir con dependencias actualizadas
docker-compose build --no-cache --pull
```

## 🚀 Despliegue en Producción

### Docker Swarm

```bash
# Inicializar swarm
docker swarm init

# Desplegar stack
docker stack deploy -c docker-compose.yml navidad-survey

# Ver servicios
docker service ls

# Escalar la aplicación
docker service scale navidad-survey_navidad-survey=3
```

### Docker con Reverse Proxy (Nginx)

Ejemplo de configuración Nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to Docker daemon"

**Solución:** Asegúrate de que Docker Desktop está ejecutándose.

```bash
# En Linux, iniciar Docker
sudo systemctl start docker
```

### Error: "Port 3000 is already in use"

**Solución:** Cambia el puerto en `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Usar puerto 3001 en lugar de 3000
```

### Error: "Build failed"

**Solución:** Reconstruir sin caché:

```bash
docker-compose build --no-cache
```

### La aplicación no arranca

**Verificar:**

1. Variables de entorno están configuradas correctamente
2. Ver logs: `docker-compose logs`
3. Verificar estado: `docker-compose ps`

### Cambios en el código no se reflejan

**Solución:** Reconstruir la imagen:

```bash
docker-compose up -d --build
```

## 📝 Mejores Prácticas

1. **Siempre usar .env para variables sensibles**
2. **Mantener las imágenes actualizadas**
3. **Usar tags específicos en producción**
4. **Monitorear logs regularmente**
5. **Hacer backup de datos antes de actualizaciones**

## 🔄 Actualizaciones

### Actualizar la Aplicación

```bash
# Detener la aplicación
docker-compose down

# Obtener cambios del repositorio
git pull

# Reconstruir y reiniciar
docker-compose up -d --build
```

### Actualizar Imagen Base de Node

Editar `Dockerfile` y cambiar:

```dockerfile
FROM node:20-alpine AS deps
```

Luego reconstruir:

```bash
docker-compose build --no-cache
```

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Best practices for Docker](https://docs.docker.com/develop/dev-best-practices/)

## 💡 Tips

1. **Desarrollo:** Usa `npm run dev` fuera de Docker para hot-reload
2. **Producción:** Usa Docker para consistencia entre entornos
3. **CI/CD:** Integra Docker en tu pipeline de GitHub Actions
4. **Monitoreo:** Considera usar Portainer para gestión visual de Docker

---

¿Necesitas ayuda? Consulta los logs con `docker-compose logs` o abre un issue en GitHub.
