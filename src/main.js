/**
 * main.js
 * Punto de entrada principal - inicializa el juego
 */

import { Game } from './Game.js';

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias DOM
    const elements = {
        phraseDisplay: document.getElementById('phraseDisplay'),
        gameInput: document.getElementById('gameInput'),
        score: document.getElementById('score'),
        lives: document.getElementById('lives'),
        streak: document.getElementById('streak'),
        vortexRing: document.getElementById('vortexRing'),
        startBtn: document.getElementById('startBtn'),
        pauseBtn: document.getElementById('pauseBtn'),
        overlay: document.getElementById('gameOverlay'),
        overlayTitle: document.getElementById('overlayTitle'),
        overlayMessage: document.getElementById('overlayMessage'),
        overlayStartBtn: document.getElementById('overlayStartBtn')
    };

    // Verificar que todos los elementos existen
    const missingElements = Object.entries(elements)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

    if (missingElements.length > 0) {
        console.error('Missing DOM elements:', missingElements);
        return;
    }

    // Crear e inicializar el juego
    const game = new Game();
    game.init(elements);

    // Conectar el botón del overlay para iniciar el juego
    if (elements.overlayStartBtn) {
        elements.overlayStartBtn.addEventListener('click', () => {
            game.startGame();
        });
    }

    // Prevenir comportamiento por defecto de teclas en el input
    elements.gameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
        }
    });

    // Manejar visibilidad de la página (pausar cuando se oculta)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game.state === 'playing') {
            game.pauseGame();
        }
    });

    console.log('Fluent Flash: The Verb Vortex initialized');
});




