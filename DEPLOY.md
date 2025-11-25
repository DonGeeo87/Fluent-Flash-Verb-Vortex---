# 🚀 Guía de Deploy en Vercel

## Deploy Rápido (5 minutos)

### Paso 1: Preparar el Repositorio

Si aún no tienes el proyecto en GitHub:

```bash
# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit: Fluent Flash - The Verb Vortex"

# Crear rama main
git branch -M main

# Agregar remoto (reemplaza con tu URL)
git remote add origin https://github.com/tu-usuario/FluentFlash.git

# Subir al repositorio
git push -u origin main
```

### Paso 2: Deploy en Vercel

#### Método A: Desde la Web (Más Fácil)

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Conecta tu cuenta de GitHub si no lo has hecho
3. Haz clic en **"Add New Project"**
4. Selecciona el repositorio `FluentFlash`
5. Vercel detectará automáticamente:
   - Framework Preset: **Other**
   - Build Command: (ninguno necesario)
   - Output Directory: (raíz del proyecto)
6. Haz clic en **"Deploy"**
7. Espera 1-2 minutos
8. ¡Listo! Tu juego estará en línea

#### Método B: Con Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Iniciar sesión
vercel login

# Deploy (desde la raíz del proyecto)
vercel

# Seguir las instrucciones en pantalla
# - ¿Set up and deploy? Y
# - ¿Which scope? (tu cuenta)
# - ¿Link to existing project? N
# - ¿Project name? fluent-flash (o el que prefieras)
# - ¿Directory? ./
# - ¿Override settings? N

# Deploy a producción
vercel --prod
```

### Paso 3: Verificar el Deploy

1. Vercel te dará una URL como: `https://fluent-flash-xxx.vercel.app`
2. Abre la URL en tu navegador
3. Prueba el juego:
   - Haz clic en "Start Game"
   - Verifica que el audio funcione
   - Prueba escribir una frase

## 🔧 Configuración Actual

El proyecto ya incluye `vercel.json` con:

- ✅ Servicio de archivos estáticos
- ✅ Headers de caché optimizados
- ✅ Content-Type correcto para módulos ES6
- ✅ Rutas configuradas correctamente

## 📝 Personalización del Dominio

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Domains
3. Agrega tu dominio personalizado (ej: `fluentflash.tudominio.com`)
4. Sigue las instrucciones de DNS

## 🔄 Actualizaciones Futuras

Cada vez que hagas `git push` a la rama `main`:

- Vercel detectará los cambios automáticamente
- Creará un nuevo deploy
- Actualizará la URL de producción

También puedes hacer deploy manual:

```bash
vercel --prod
```

## 🐛 Solución de Problemas

### Error: "Module not found"

**Solución**: Verifica que todos los archivos `.js` estén en la carpeta `src/` y que `index.html` use rutas relativas correctas.

### Error: "CORS policy"

**Solución**: Vercel maneja CORS automáticamente. Si persiste, verifica que los módulos se carguen con `type="module"` en el HTML.

### El juego no carga

**Solución**: 
1. Abre la consola del navegador (F12)
2. Revisa errores en la pestaña Console
3. Verifica la pestaña Network para ver qué archivos no se cargan

### Audio no funciona

**Solución**: El audio requiere interacción del usuario. Asegúrate de que el usuario haga clic en "Start Game" primero.

## 📊 Monitoreo

Vercel proporciona:
- Analytics de visitas
- Logs en tiempo real
- Métricas de rendimiento
- Alertas de errores

Accede desde el Dashboard de tu proyecto.

## 🔐 Variables de Entorno

Este proyecto no requiere variables de entorno, pero si las necesitas en el futuro:

1. Ve a Settings → Environment Variables
2. Agrega las variables necesarias
3. Haz redeploy

## ✅ Checklist Pre-Deploy

- [ ] Todos los archivos están en el repositorio
- [ ] `vercel.json` está configurado
- [ ] `index.html` carga correctamente localmente
- [ ] Los módulos JavaScript se cargan sin errores
- [ ] El juego funciona en modo local

---

**Desarrollador**: Giorgio Interdonato Palacios  
**GitHub**: @DonGeeo87

