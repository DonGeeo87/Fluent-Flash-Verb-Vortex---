# The GG Arcade: The Grammar Game Arcade

Colección de minijuegos web de alto rendimiento para practicar mecanografía y gramática del idioma inglés. El primer modo disponible es **Verb Vortex**, centrado en estructuras verbales.

## 🎯 Características

- **Generación Procedural de Frases**: Sistema que crea frases gramaticales dinámicamente
- **Detección Carácter a Carácter**: Validación en tiempo real de cada tecla presionada
- **Audio Sintetizado**: Efectos de sonido generados con Web Audio API (sin assets)
- **Dificultad Adaptativa**: El juego se ajusta según tus errores, priorizando patrones problemáticos
- **Diseño Minimalista**: Interfaz tipo terminal con efectos visuales sutiles
- **Sin Dependencias Externas**: Código puro HTML5, CSS3 y JavaScript ES6+

## 🚀 Inicio Rápido

### Desarrollo Local

1. Clona o descarga el proyecto
2. Abre `index.html` en un navegador moderno
3. Desde el home de **The GG Arcade**, elige el modo que quieras jugar

**Nota**: El audio requiere interacción del usuario (política del navegador), por lo que se inicializa al iniciar el juego.

### Deploy en Vercel

#### Opción 1: Deploy desde GitHub (Recomendado)

1. **Preparar el repositorio:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: The GG Arcade"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/TheGGArcade.git
   git push -u origin main
   ```

2. **Conectar con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub
   - Haz clic en "Add New Project"
   - Importa tu repositorio `FluentFlash`
   - Vercel detectará automáticamente la configuración
   - Haz clic en "Deploy"

3. **¡Listo!** Tu juego estará disponible en una URL como `https://fluent-flash.vercel.app`

#### Opción 2: Deploy con Vercel CLI

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Iniciar sesión:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Deploy a producción:**
   ```bash
   vercel --prod
   ```

#### Configuración

El proyecto incluye `vercel.json` con:
- Configuración para servir archivos estáticos
- Headers de caché optimizados
- Content-Type correcto para módulos JavaScript

No se requiere build step, Vercel sirve los archivos directamente.

## 📁 Estructura del Proyecto

```
TheGGArcade/
├── index.html              # Estructura HTML principal
├── style.css               # Estilos minimalistas tipo terminal
├── vercel.json             # Configuración de Vercel
├── package.json            # Configuración del proyecto
├── .gitignore             # Archivos a ignorar en Git
├── src/
│   ├── main.js             # Punto de entrada - inicialización
│   ├── Game.js             # Motor principal del juego
│   ├── PhraseGenerator.js  # Generación procedural de frases
│   ├── InputHandler.js     # Manejo de entrada carácter a carácter
│   ├── AudioSynthesizer.js # Sintetizador de audio (Web Audio API)
│   └── DifficultyManager.js # Gestión de dificultad adaptativa
└── README.md
```

## 🎮 Cómo Jugar

1. **Iniciar**: Presiona "Start Game"
2. **Escribir**: Escribe la frase que aparece en pantalla, carácter por carácter
3. **Tiempo**: Completa la frase antes de que se agote el tiempo del vórtice
4. **Errores**: Si cometes un error, el carácter se marca en rojo y debes corregirlo
5. **Puntos**: Ganas puntos por completar frases rápidamente y mantener rachas
6. **Vidas**: Tienes 3 vidas; se pierde una si se agota el tiempo

## 🎨 Patrones Gramaticales

El juego incluye los siguientes patrones:

- **Past Simple Regular**: "I walked the dog yesterday."
- **Past Simple Irregular**: "She went to the store."
- **Present Perfect**: "They have studied English."
- **Past Continuous**: "We were playing soccer."
- **Third Conditional**: "If I had known, I would have gone."

## 🔧 Arquitectura Técnica

### Módulos Principales

#### `Game.js` - Motor Principal
- Gestiona el estado del juego (idle, playing, paused, gameOver)
- Coordina todos los módulos
- Maneja el temporizador del vórtice
- Calcula puntuación y vidas

#### `PhraseGenerator.js` - Generador de Frases
- Arrays de sujetos, verbos, objetos y complementos
- Plantillas gramaticales predefinidas
- Selección ponderada basada en errores previos
- Cálculo de dificultad por patrón

#### `InputHandler.js` - Manejo de Entrada
- Event listeners para `keydown` e `input`
- Validación carácter a carácter
- Manejo de backspace
- Sincronización con el estado visual

#### `AudioSynthesizer.js` - Sintetizador de Audio
- Inicialización del AudioContext
- Generación de tonos (square, sawtooth, sine)
- Efectos: correcto, incorrecto, éxito, advertencia
- Control de volumen maestro

#### `DifficultyManager.js` - Gestión de Dificultad
- Mapa de errores por patrón gramatical
- Historial de tiempos de completado
- Cálculo de dificultad general
- Estadísticas de rendimiento

## 🎵 Sistema de Audio

Todos los efectos de sonido se generan proceduralmente:

- **Tecla Correcta**: Onda cuadrada a 440Hz, corta y sutil
- **Tecla Incorrecta**: Onda de sierra a 220Hz, ligeramente disonante
- **Frase Completada**: Sweep ascendente de 200Hz a 800Hz
- **Advertencia de Tiempo**: Onda triangular a 330Hz cuando queda poco tiempo

## 📊 Sistema de Puntuación

- **Puntos Base**: 100 por frase completada
- **Bonus de Tiempo**: Puntos adicionales por completar rápidamente
- **Bonus de Rachas**: 10 puntos por cada racha consecutiva
- **Pérdida de Vida**: Se pierde una vida si se agota el tiempo

## 💾 Persistencia

El juego guarda automáticamente:
- Estadísticas de dificultad por patrón
- Tiempos de completado
- Historial de errores recientes

Los datos se almacenan en `localStorage` y se cargan al iniciar el juego.

## 🎯 Dificultad Adaptativa

El sistema de dificultad adaptativa:

1. **Registra Errores**: Cada error se asocia al patrón gramatical correspondiente
2. **Calcula Pesos**: Los patrones con más errores tienen mayor probabilidad de aparecer
3. **Ajusta Dificultad**: El tiempo límite y la complejidad se ajustan según el rendimiento
4. **Proporciona Feedback**: Muestra estadísticas de patrones problemáticos

## 🔒 Requisitos del Navegador

- Navegador moderno con soporte para:
  - ES6+ (módulos JavaScript)
  - Web Audio API
  - CSS Grid y Flexbox
  - localStorage

Probado en:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🛠️ Desarrollo

### Estructura Modular

El código está organizado en módulos ES6 independientes:
- Cada módulo tiene una responsabilidad única
- Fácil de extender y mantener
- Sin dependencias externas

### Extensión

Para agregar nuevos patrones gramaticales:

1. Agregar verbos al objeto `verbs` en `PhraseGenerator.js`
2. Crear un nuevo patrón en el array `grammarPatterns`
3. Definir el template de la frase

Ejemplo:
```javascript
{
    name: 'Future Perfect',
    template: (s, v, o, c) => `${s} will have ${v} ${o}${c ? ' ' + c : ''}.`,
    verbType: 'futurePerfect',
    verbSubtype: 'regular'
}
```

## 📝 Notas de Diseño

- **Minimalismo**: Interfaz limpia sin distracciones
- **Feedback Visual**: Colores y animaciones sutiles para guiar al usuario
- **Rendimiento**: Optimizado para 60 FPS, sin lag en la detección de entrada
- **Accesibilidad**: Contraste adecuado, feedback claro de errores

## 🐛 Solución de Problemas

**El audio no funciona:**
- Asegúrate de hacer clic en "Start Game" (requiere interacción del usuario)
- Verifica que tu navegador soporte Web Audio API

**El input no responde:**
- Verifica que el campo de input tenga el foco
- Asegúrate de que el juego esté en estado "playing"

**Las frases no se generan:**
- Revisa la consola del navegador para errores
- Verifica que todos los módulos se carguen correctamente

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo y personal.

---

**Desarrollador**: Giorgio Interdonato Palacios  
**GitHub**: @DonGeeo87




