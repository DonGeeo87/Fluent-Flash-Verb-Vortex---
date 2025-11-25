/**
 * Game.js
 * Motor principal del juego - gestiona el game loop, estado y coordinación
 */

import { PhraseGenerator } from './PhraseGenerator.js';
import { AudioSynthesizer } from './AudioSynthesizer.js';
import { InputHandler } from './InputHandler.js';
import { DifficultyManager } from './DifficultyManager.js';

export class Game {
    constructor() {
        // Módulos del juego
        this.phraseGenerator = new PhraseGenerator();
        this.audioSynthesizer = new AudioSynthesizer();
        this.difficultyManager = new DifficultyManager();
        this.inputHandler = null; // Se inicializa después

        // Estado del juego
        this.state = 'idle'; // idle, playing, paused, gameOver
        this.score = 0;
        this.lives = 3;
        this.streak = 0;
        this.currentPhrase = null;
        this.currentPhraseData = null;
        this.startTime = null;
        this.vortexTimer = null;
        this.vortexTimeLimit = 30000; // 30 segundos por defecto

        // Referencias DOM
        this.elements = {
            phraseDisplay: null,
            gameInput: null,
            score: null,
            lives: null,
            streak: null,
            vortexRing: null,
            startBtn: null,
            pauseBtn: null,
            overlay: null,
            overlayTitle: null,
            overlayMessage: null
        };

        // Callbacks para actualización de UI
        this.uiUpdateCallbacks = [];
    }

    /**
     * Inicializa el juego con referencias DOM
     */
    init(domElements) {
        this.elements = { ...this.elements, ...domElements };
        this.inputHandler = new InputHandler(this);
        this.inputHandler.init(this.elements.gameInput);

        // Cargar datos guardados
        this.loadGameData();

        // Configurar botones
        this.setupButtons();

        // Actualizar UI inicial
        this.updateUI();
    }

    /**
     * Configura los event listeners de los botones
     */
    setupButtons() {
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.startGame());
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        }
    }

    /**
     * Inicia el juego
     */
    async startGame() {
        if (this.state === 'playing') return;

        // Inicializar audio (requiere interacción del usuario)
        await this.audioSynthesizer.init();

        this.state = 'playing';
        this.score = 0;
        this.lives = 3;
        this.streak = 0;
        this.difficultyManager.reset();

        this.updateUI();
        this.hideOverlay();
        this.generateNewPhrase();
        this.inputHandler.activate();
    }

    /**
     * Pausa o reanuda el juego
     */
    togglePause() {
        if (this.state === 'playing') {
            this.pauseGame();
        } else if (this.state === 'paused') {
            this.resumeGame();
        }
    }

    /**
     * Pausa el juego
     */
    pauseGame() {
        if (this.state !== 'playing') return;

        this.state = 'paused';
        this.stopVortexTimer();
        this.inputHandler.deactivate();
        this.updateUI();
        this.showOverlay('⏸️ Juego Pausado', 'Haz clic en "Resume" para continuar\n\nO presiona el botón "Pause" nuevamente');
    }

    /**
     * Reanuda el juego
     */
    resumeGame() {
        if (this.state !== 'paused') return;

        this.state = 'playing';
        this.startVortexTimer();
        this.inputHandler.activate();
        this.hideOverlay();
    }

    /**
     * Genera una nueva frase y la muestra
     */
    generateNewPhrase() {
        const errorCounts = this.difficultyManager.getErrorCountsMap();
        const phraseData = this.phraseGenerator.generatePhrase(errorCounts);
        
        this.currentPhrase = phraseData.phrase;
        this.currentPhraseData = phraseData;
        this.startTime = Date.now();

        this.renderPhrase();
        this.startVortexTimer();
        this.inputHandler.setPhrase(this.currentPhrase);
    }

    /**
     * Renderiza la frase en el DOM
     */
    renderPhrase() {
        if (!this.elements.phraseDisplay) return;

        this.elements.phraseDisplay.innerHTML = '';
        
        if (!this.currentPhrase) {
            // Mostrar mensaje cuando no hay frase
            const placeholder = document.createElement('div');
            placeholder.className = 'phrase-placeholder';
            placeholder.innerHTML = '<p style="color: var(--text-secondary); font-size: 1.1rem;">Esperando frase...</p>';
            this.elements.phraseDisplay.appendChild(placeholder);
            return;
        }

        const chars = this.currentPhrase.split('');

        chars.forEach((char, index) => {
            const span = document.createElement('span');
            span.className = 'phrase-char pending';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.dataset.index = index;
            this.elements.phraseDisplay.appendChild(span);
        });
        
        // Marcar el primer carácter como actual
        if (chars.length > 0) {
            this.updateCharState(0, 'current');
        }
    }

    /**
     * Actualiza el estado visual de un carácter
     */
    updateCharState(index, state) {
        const charElement = this.elements.phraseDisplay?.querySelector(
            `[data-index="${index}"]`
        );
        
        if (!charElement) return;

        // Remover estados previos
        charElement.classList.remove('current', 'correct', 'incorrect', 'pending');

        // Aplicar nuevo estado
        if (state === 'current') {
            charElement.classList.add('current');
        } else if (state === 'correct') {
            charElement.classList.add('correct');
        } else if (state === 'incorrect') {
            charElement.classList.add('incorrect');
        } else {
            charElement.classList.add('pending');
        }
    }

    /**
     * Callback cuando se presiona un carácter correcto
     */
    onCorrectChar(index) {
        this.updateCharState(index, 'correct');
        if (index + 1 < this.currentPhrase.length) {
            this.updateCharState(index + 1, 'current');
        }
        this.audioSynthesizer.playCorrectTone(440 + (index * 10), 0.08);
    }

    /**
     * Callback cuando se presiona un carácter incorrecto
     */
    onIncorrectChar(index) {
        this.updateCharState(index, 'incorrect');
        this.audioSynthesizer.playIncorrectTone(220, 0.12);
        
        // Registrar error
        if (this.currentPhraseData) {
            this.difficultyManager.recordError(this.currentPhraseData.pattern);
        }
    }

    /**
     * Callback cuando se elimina un carácter (backspace)
     */
    onCharRemoved(index) {
        this.updateCharState(index, 'current');
        if (index > 0) {
            this.updateCharState(index - 1, 'pending');
        }
    }

    /**
     * Callback cuando se completa una frase
     */
    onPhraseComplete() {
        const completionTime = Date.now() - this.startTime;
        
        // Registrar tiempo de completado
        if (this.currentPhraseData) {
            this.difficultyManager.recordCompletionTime(
                this.currentPhraseData.pattern,
                completionTime
            );
        }

        // Calcular puntos
        const basePoints = 100;
        const timeBonus = Math.max(0, Math.floor((this.vortexTimeLimit - completionTime) / 100));
        const streakBonus = this.streak * 10;
        const points = basePoints + timeBonus + streakBonus;

        this.score += points;
        this.streak++;
        this.audioSynthesizer.playSuccessSweep(200, 800, 0.3);

        this.stopVortexTimer();
        this.updateUI();

        // Generar nueva frase después de un breve delay
        setTimeout(() => {
            if (this.state === 'playing') {
                this.generateNewPhrase();
            }
        }, 500);
    }

    /**
     * Inicia el temporizador del vórtice
     */
    startVortexTimer() {
        this.stopVortexTimer();

        const startTime = Date.now();
        const updateInterval = 50; // Actualizar cada 50ms

        this.vortexTimer = setInterval(() => {
            if (this.state !== 'playing') {
                this.stopVortexTimer();
                return;
            }

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, this.vortexTimeLimit - elapsed);
            const progress = remaining / this.vortexTimeLimit;

            this.updateVortexVisual(progress);

            // Advertencia cuando queda poco tiempo
            if (remaining < 5000 && remaining > 0 && Math.floor(remaining / 500) !== Math.floor((remaining + updateInterval) / 500)) {
                this.audioSynthesizer.playWarningTone(330, 0.15);
            }

            // Tiempo agotado
            if (remaining <= 0) {
                this.onTimeExpired();
            }
        }, updateInterval);
    }

    /**
     * Detiene el temporizador del vórtice
     */
    stopVortexTimer() {
        if (this.vortexTimer) {
            clearInterval(this.vortexTimer);
            this.vortexTimer = null;
        }
    }

    /**
     * Actualiza la visualización del vórtice
     */
    updateVortexVisual(progress) {
        if (!this.elements.vortexRing) return;

        const opacity = 0.3 + (1 - progress) * 0.7;
        const scale = 1 + (1 - progress) * 0.2;
        const colorIntensity = Math.min(255, 136 + (1 - progress) * 119);

        this.elements.vortexRing.style.opacity = opacity;
        this.elements.vortexRing.style.transform = `scale(${scale})`;
        this.elements.vortexRing.style.boxShadow = `0 0 ${30 + (1 - progress) * 50}px rgba(0, ${colorIntensity}, 136, ${opacity})`;
    }

    /**
     * Callback cuando se agota el tiempo
     */
    onTimeExpired() {
        this.stopVortexTimer();
        this.lives--;

        // Registrar error por tiempo
        if (this.currentPhraseData) {
            this.difficultyManager.recordError(this.currentPhraseData.pattern);
        }

        this.streak = 0;
        this.updateUI();

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Continuar con nueva frase
            setTimeout(() => {
                if (this.state === 'playing') {
                    this.generateNewPhrase();
                }
            }, 1000);
        }
    }

    /**
     * Termina el juego
     */
    gameOver() {
        this.state = 'gameOver';
        this.stopVortexTimer();
        this.inputHandler.deactivate();
        this.saveGameData();

        const finalScore = this.score;
        const stats = this.difficultyManager.getStats();

        const gameOverMessage = `
            <div class="game-over-stats">
                <p class="final-score">🎯 Puntuación Final: <strong>${finalScore}</strong></p>
                <p>📚 Patrones practicados: <strong>${stats.patternsWithErrors}</strong></p>
                <p>📊 Dificultad alcanzada: <strong>${stats.overallDifficulty}/10</strong></p>
                ${stats.topProblemPatterns.length > 0 ? `
                    <div class="problem-patterns">
                        <p>🔍 Patrones para practicar más:</p>
                        <ul>
                            ${stats.topProblemPatterns.map(p => `<li>• ${p.pattern}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.showOverlay('🏁 Juego Terminado', gameOverMessage);

        // Agregar botón de jugar de nuevo en el overlay
        const overlayContent = this.elements.overlay?.querySelector('.overlay-content');
        if (overlayContent && !overlayContent.querySelector('#gameOverRestartBtn')) {
            const restartBtn = document.createElement('button');
            restartBtn.id = 'gameOverRestartBtn';
            restartBtn.className = 'btn btn-primary btn-large';
            restartBtn.textContent = '🔄 Jugar de Nuevo';
            restartBtn.style.marginTop = '24px';
            restartBtn.addEventListener('click', () => {
                this.startGame();
            });
            overlayContent.appendChild(restartBtn);
        }

        // Habilitar botón de inicio
        if (this.elements.startBtn) {
            this.elements.startBtn.textContent = 'Play Again';
        }
    }

    /**
     * Actualiza la UI con el estado actual
     */
    updateUI() {
        if (this.elements.score) {
            this.elements.score.textContent = this.score;
        }
        if (this.elements.lives) {
            this.elements.lives.textContent = this.lives;
        }
        if (this.elements.streak) {
            this.elements.streak.textContent = this.streak;
        }

        // Actualizar botones
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = this.state === 'playing';
        }
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.disabled = this.state !== 'playing' && this.state !== 'paused';
            this.elements.pauseBtn.textContent = this.state === 'paused' ? 'Resume' : 'Pause';
        }

        // Ejecutar callbacks de actualización
        this.uiUpdateCallbacks.forEach(callback => callback(this));
    }

    /**
     * Muestra el overlay con mensaje
     */
    showOverlay(title, message, isInstructions = false) {
        if (this.elements.overlay) {
            this.elements.overlay.classList.remove('hidden');
            
            const overlayContent = this.elements.overlay.querySelector('.overlay-content');
            
            // Si es mensaje simple (no instrucciones), actualizar contenido
            if (!isInstructions && overlayContent && this.elements.overlayMessage) {
                // Si el mensaje contiene HTML, usar directamente
                if (message.includes('<')) {
                    this.elements.overlayMessage.innerHTML = message;
                } else {
                    // Formato simple para mensajes de texto plano
                    this.elements.overlayMessage.innerHTML = message.split('\n').map(line => 
                        line.trim() ? `<p style="margin: 8px 0;">${line}</p>` : ''
                    ).join('');
                }
            }
        }
        if (this.elements.overlayTitle) {
            this.elements.overlayTitle.textContent = title;
        }
    }

    /**
     * Oculta el overlay
     */
    hideOverlay() {
        if (this.elements.overlay) {
            this.elements.overlay.classList.add('hidden');
        }
    }

    /**
     * Guarda los datos del juego en localStorage
     */
    saveGameData() {
        try {
            const data = {
                score: this.score,
                difficultyData: this.difficultyManager.exportData(),
                timestamp: Date.now()
            };
            localStorage.setItem('fluentFlash_data', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save game data:', error);
        }
    }

    /**
     * Carga los datos del juego desde localStorage
     */
    loadGameData() {
        try {
            const dataStr = localStorage.getItem('fluentFlash_data');
            if (dataStr) {
                const data = JSON.parse(dataStr);
                if (data.difficultyData) {
                    this.difficultyManager.importData(data.difficultyData);
                }
            }
        } catch (error) {
            console.warn('Failed to load game data:', error);
        }
    }
}




