/**
 * AudioSynthesizer.js
 * Sintetizador de audio usando Web Audio API
 * Genera efectos de sonido sin assets externos
 */

export class AudioSynthesizer {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;
    }

    /**
     * Inicializa el contexto de audio
     * Debe ser llamado después de una interacción del usuario
     */
    async init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3; // Volumen general al 30%
            this.masterGain.connect(this.audioContext.destination);
            this.initialized = true;
        } catch (error) {
            console.warn('Audio context initialization failed:', error);
            this.initialized = false;
        }
    }

    /**
     * Reproduce un tono de onda cuadrada (para tecla correcta)
     * @param {number} frequency - Frecuencia en Hz
     * @param {number} duration - Duración en segundos
     */
    playCorrectTone(frequency = 440, duration = 0.1) {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.value = frequency;

        // Envelope: ataque rápido, decaimiento suave
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Reproduce un tono de onda de sierra (para tecla incorrecta)
     * @param {number} frequency - Frecuencia base en Hz
     * @param {number} duration - Duración en segundos
     */
    playIncorrectTone(frequency = 220, duration = 0.15) {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.value = frequency;

        // Envelope más agresivo para el error
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Reproduce un sweep ascendente (para frase completada)
     * @param {number} startFreq - Frecuencia inicial en Hz
     * @param {number} endFreq - Frecuencia final en Hz
     * @param {number} duration - Duración en segundos
     */
    playSuccessSweep(startFreq = 200, endFreq = 800, duration = 0.3) {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            endFreq,
            this.audioContext.currentTime + duration
        );

        // Envelope con sustain
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.25, now + duration * 0.7);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Reproduce un tono de advertencia (para tiempo agotándose)
     * @param {number} frequency - Frecuencia en Hz
     * @param {number} duration - Duración en segundos
     */
    playWarningTone(frequency = 330, duration = 0.2) {
        if (!this.initialized) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Ajusta el volumen maestro
     * @param {number} volume - Volumen entre 0 y 1
     */
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Limpia recursos
     */
    dispose() {
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.initialized = false;
    }
}




