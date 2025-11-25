/**
 * InputHandler.js
 * Maneja la entrada del usuario y valida carácter a carácter
 */

export class InputHandler {
    constructor(game) {
        this.game = game;
        this.inputElement = null;
        this.currentPhrase = '';
        this.currentIndex = 0;
        this.isActive = false;
    }

    /**
     * Inicializa el handler con el elemento de input
     */
    init(inputElement) {
        this.inputElement = inputElement;
        this.setupEventListeners();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        if (!this.inputElement) return;

        // Captura de teclas
        this.inputElement.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.inputElement.addEventListener('input', (e) => this.handleInput(e));
        this.inputElement.addEventListener('paste', (e) => {
            e.preventDefault(); // Prevenir pegado
        });
    }

    /**
     * Maneja el evento keydown
     */
    handleKeyDown(e) {
        if (!this.isActive) return;

        // Prevenir comportamiento por defecto de teclas especiales
        if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
            e.preventDefault();
        }

        // Backspace: retroceder solo si hay caracteres escritos
        if (e.key === 'Backspace' && this.currentIndex > 0) {
            e.preventDefault();
            this.handleBackspace();
        }
    }

    /**
     * Maneja el evento input (captura cada carácter)
     */
    handleInput(e) {
        if (!this.isActive) return;

        const inputValue = e.target.value;
        const expectedChar = this.currentPhrase[this.currentIndex];

        if (!expectedChar) {
            e.target.value = '';
            return;
        }

        // Obtener el último carácter ingresado
        const lastChar = inputValue[inputValue.length - 1];

        if (lastChar === expectedChar) {
            this.handleCorrectChar();
        } else {
            this.handleIncorrectChar();
        }

        // Mantener el input sincronizado
        e.target.value = this.currentPhrase.substring(0, this.currentIndex);
    }

    /**
     * Maneja un carácter correcto
     */
    handleCorrectChar() {
        this.currentIndex++;
        this.game.onCorrectChar(this.currentIndex - 1);
        
        // Verificar si la frase está completa
        if (this.currentIndex >= this.currentPhrase.length) {
            this.game.onPhraseComplete();
        }
    }

    /**
     * Maneja un carácter incorrecto
     */
    handleIncorrectChar() {
        this.game.onIncorrectChar(this.currentIndex);
    }

    /**
     * Maneja el backspace
     */
    handleBackspace() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.game.onCharRemoved(this.currentIndex);
        }
    }

    /**
     * Establece una nueva frase para escribir
     */
    setPhrase(phrase) {
        this.currentPhrase = phrase;
        this.currentIndex = 0;
        
        if (this.inputElement) {
            this.inputElement.value = '';
            this.inputElement.focus();
        }
    }

    /**
     * Activa el handler
     */
    activate() {
        this.isActive = true;
        if (this.inputElement) {
            this.inputElement.disabled = false;
            this.inputElement.focus();
        }
    }

    /**
     * Desactiva el handler
     */
    deactivate() {
        this.isActive = false;
        if (this.inputElement) {
            this.inputElement.disabled = true;
            this.inputElement.blur();
        }
    }

    /**
     * Reinicia el estado
     */
    reset() {
        this.currentPhrase = '';
        this.currentIndex = 0;
        if (this.inputElement) {
            this.inputElement.value = '';
        }
    }

    /**
     * Obtiene el progreso actual (0-1)
     */
    getProgress() {
        if (!this.currentPhrase || this.currentPhrase.length === 0) return 0;
        return this.currentIndex / this.currentPhrase.length;
    }
}




