export class WordDropGame {
    constructor() {
        this.commonWords = [
            'run', 'play', 'read', 'jump', 'walk',
            'happy', 'blue', 'fast', 'slow', 'smart',
            'dog', 'cat', 'book', 'game', 'music',
            'ball', 'tree', 'water', 'school', 'pizza',
            'plane', 'river', 'planet', 'teacher', 'friend'
        ];

        this.bonusWords = [
            'dinosaur', 'umbrella', 'homework',
            'notebook', 'basketball', 'computer',
            'colorful', 'sandwich', 'backpack',
            'chocolate', 'adventure', 'sunflower'
        ];

        // "Bolsas" de palabras barajadas: recorremos todas antes de repetir
        this.wordBag = [];
        this.bonusWordBag = [];

        this.state = 'idle'; // idle, playing, paused
        this.columns = 6;
        this.rows = 10;
        this.grid = [];
        this.activeWords = [];
        this.tickInterval = null;
        this.tickMs = 900;
        this.level = 1;
        this.cleared = 0;
        this.lives = 3;
        this.score = 0;
        this.streak = 0;
        this.maxMultiplier = 5;

        this.elements = {
            screen: null,
            grid: null,
            input: null,
            startBtn: null,
            backBtn: null,
            statsScore: null,
            statsLives: null,
            statsLevel: null,
            statsStreak: null,
            statsMultiplier: null
        };
    }

    init(elements) {
        this.elements = { ...this.elements, ...elements };
        this.resetGrid();
        this.attachEvents();
        this.updateStats();
        this.renderGrid();
    }

    attachEvents() {
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.toggleStart());
        }
        if (this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', () => this.stop());
        }
        if (this.elements.input) {
            this.elements.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleWordSubmit();
                }
            });
        }
    }

    resetGrid() {
        this.grid = Array.from({ length: this.rows }, () =>
            Array.from({ length: this.columns }, () => null)
        );
        this.activeWords = [];
    }

    toggleStart() {
        if (this.state === 'playing') {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        this.state = 'playing';
        this.resetGrid();
        this.level = 1;
        this.cleared = 0;
        this.lives = 3;
        this.score = 0;
        this.streak = 0;
        this.tickMs = 900;
        this.updateStats();
        this.renderGrid();
        this.elements.input?.focus();

        if (this.tickInterval) clearInterval(this.tickInterval);
        this.tickInterval = setInterval(() => this.tick(), this.tickMs);

        if (this.elements.startBtn) {
            this.elements.startBtn.textContent = 'Pause';
        }
    }

    stop() {
        this.state = 'idle';
        if (this.tickInterval) clearInterval(this.tickInterval);
        this.tickInterval = null;
        if (this.elements.startBtn) {
            this.elements.startBtn.textContent = 'Start';
        }
    }

    tick() {
        if (this.state !== 'playing') return;

        // Mover palabras hacia abajo (apilando como Tetris)
        for (let row = this.rows - 2; row >= 0; row--) {
            for (let col = 0; col < this.columns; col++) {
                const cell = this.grid[row][col];
                if (!cell) continue;
                const newRow = row + 1;
                // Si la celda de abajo está libre, bajamos la palabra
                if (!this.grid[newRow][col]) {
                    this.grid[newRow][col] = cell;
                    this.grid[row][col] = null;
                }
                // Si hay algo debajo, se queda donde está (se apila)
            }
        }

        // Ajustar cantidad de palabras activas según progreso total
        const activeCount = this.getActiveCount();
        const targetActive = 1 + Math.floor(this.cleared / 8); // cada 8 aciertos aumenta una palabra simultánea
        if (activeCount < targetActive && Math.random() < 0.8) {
            this.spawnWord();
        }

        this.renderGrid();
    }

    spawnWord() {
        const useBonus = Math.random() < 0.25;
        const word = this.getNextWord(useBonus);

        const col = Math.floor(Math.random() * this.columns);
        if (this.grid[0][col]) {
            // Columna llena hasta arriba: perder una vida
            this.lives--;
            this.updateStats();
            if (this.lives <= 0) {
                this.gameOver();
            }
            return;
        }
        this.grid[0][col] = { text: word, bonus: useBonus };
    }

    handleWordSubmit() {
        if (!this.elements.input) return;
        const typed = this.elements.input.value.trim().toLowerCase();
        if (!typed) return;

        let removed = false;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const cell = this.grid[row][col];
                if (cell && cell.text.toLowerCase() === typed) {
                    this.grid[row][col] = null;
                    const base = cell.bonus ? 40 : 20;
                    this.score += base * this.getMultiplier();
                    this.cleared++;
                    removed = true;
                }
            }
        }

        if (removed) {
            this.streak++;
            this.maybeLevelUp();
            this.updateStats();
            this.renderGrid();
            this.flashGrid();
        } else {
            // intento fallido: resetea racha
            this.streak = 0;
            this.updateStats();
        }

        this.elements.input.value = '';
    }

    maybeLevelUp() {
        const nextLevel = Math.floor(this.cleared / 10) + 1;
        if (nextLevel > this.level) {
            this.level = nextLevel;
            this.tickMs = Math.max(300, this.tickMs - 80);
            if (this.tickInterval) {
                clearInterval(this.tickInterval);
                this.tickInterval = setInterval(() => this.tick(), this.tickMs);
            }
        }
    }

    getActiveCount() {
        let count = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                if (this.grid[row][col]) count++;
            }
        }
        return count;
    }

    /**
     * Devuelve la siguiente palabra de una bolsa barajada
     */
    getNextWord(useBonus) {
        const pool = useBonus ? this.bonusWords : this.commonWords;
        const bag = useBonus ? this.bonusWordBag : this.wordBag;

        if (bag.length === 0) {
            // Rellenar y barajar
            const copy = [...pool];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            bag.push(...copy);
        }

        return bag.pop();
    }

    getMultiplier() {
        const base = 1 + Math.floor(this.streak / 5);
        return Math.min(this.maxMultiplier, base);
    }

    updateStats() {
        if (this.elements.statsScore) {
            this.elements.statsScore.textContent = this.score;
        }
        if (this.elements.statsLives) {
            this.elements.statsLives.textContent = this.lives;
        }
        if (this.elements.statsLevel) {
            this.elements.statsLevel.textContent = this.level;
        }
        if (this.elements.statsStreak) {
            this.elements.statsStreak.textContent = this.streak;
        }
        if (this.elements.statsMultiplier) {
            this.elements.statsMultiplier.textContent = this.getMultiplier();
        }
    }

    renderGrid() {
        if (!this.elements.grid) return;
        this.elements.grid.innerHTML = '';

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const cell = document.createElement('div');
                cell.className = 'worddrop-cell';
                const data = this.grid[row][col];
                if (data) {
                    cell.textContent = data.text;
                    cell.classList.add('worddrop-cell-filled');
                    if (data.bonus) {
                        cell.classList.add('bonus');
                    }
                }
                this.elements.grid.appendChild(cell);
            }
        }
    }

    flashGrid() {
        if (!this.elements.grid) return;
        this.elements.grid.classList.remove('worddrop-flash');
        void this.elements.grid.offsetWidth; // reflow
        this.elements.grid.classList.add('worddrop-flash');
    }

    gameOver() {
        this.stop();
        alert(`WordDrop terminado. Puntuación: ${this.score}`);
    }
}


