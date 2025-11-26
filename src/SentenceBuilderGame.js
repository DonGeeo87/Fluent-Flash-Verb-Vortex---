import { PhraseGenerator } from './PhraseGenerator.js';

export class SentenceBuilderGame {
    constructor() {
        this.phraseGenerator = new PhraseGenerator();

        this.state = 'idle'; // idle, playing, showingResult
        this.currentSentence = null;
        this.currentWords = [];
        this.targetOrder = [];
        this.selectedOrder = [];

        this.score = 0;
        this.streak = 0;
        this.roundTimeMs = 20000;
        this.remainingMs = this.roundTimeMs;
        this.timerId = null;

        this.elements = {
            screen: null,
            targetSentence: null,
            wordPool: null,
            assembledSentence: null,
            startBtn: null,
            backBtn: null,
            nextBtn: null,
            statsScore: null,
            statsStreak: null,
            timerBar: null
        };
    }

    init(elements) {
        this.elements = { ...this.elements, ...elements };
        this.attachEvents();
        this.updateStats();
        this.resetRoundUI();
    }

    attachEvents() {
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.start());
        }
        if (this.elements.backBtn) {
            this.elements.backBtn.addEventListener('click', () => this.stop());
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.nextRound());
        }
    }

    start() {
        if (this.state === 'playing') return;
        this.score = 0;
        this.streak = 0;
        this.updateStats();
        this.nextRound();
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = true;
        }
    }

    stop() {
        this.state = 'idle';
        this.clearTimer();
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = false;
        }
    }

    nextRound() {
        this.clearTimer();
        this.state = 'playing';
        this.resetRoundUI();
        this.generateSentence();
        this.renderSentence();
        this.startTimer();
    }

    generateSentence() {
        const data = this.phraseGenerator.generatePhrase();
        const sentence = data.phrase.replace(/^\s+|\s+$/g, '');

        this.currentSentence = sentence;
        // Split conservando signos simples al final (.,!?)
        const words = sentence
            .replace(/[.?!]/g, '')
            .split(/\s+/)
            .filter(Boolean);

        // Guardar orden objetivo
        this.targetOrder = [...words];

        // Mezclar para el pool
        this.currentWords = this.shuffleArray(words);
        this.selectedOrder = [];
    }

    renderSentence() {
        if (this.elements.targetSentence) {
            this.elements.targetSentence.textContent = this.currentSentence;
        }

        if (!this.elements.wordPool || !this.elements.assembledSentence) return;
        this.elements.wordPool.innerHTML = '';
        this.elements.assembledSentence.innerHTML = '';

        this.currentWords.forEach((word, index) => {
            const card = document.createElement('button');
            card.className = 'sb-word-card';
            card.textContent = word;
            card.type = 'button';
            card.dataset.index = String(index);

            card.addEventListener('click', () => this.handleWordClick(index));

            this.elements.wordPool.appendChild(card);
        });
    }

    handleWordClick(index) {
        if (this.state !== 'playing') return;
        const word = this.currentWords[index];
        if (!word) return;

        // Marcar como usado
        this.currentWords[index] = null;
        const card = this.elements.wordPool?.querySelector(
            `.sb-word-card[data-index="${index}"]`
        );
        if (card) {
            card.disabled = true;
            card.classList.add('sb-word-card-used');
        }

        this.selectedOrder.push(word);
        this.renderAssembledSentence();

        // Si completó todas las palabras, validar
        if (this.selectedOrder.length === this.targetOrder.length) {
            this.checkAnswer();
        }
    }

    renderAssembledSentence() {
        if (!this.elements.assembledSentence) return;
        this.elements.assembledSentence.innerHTML = '';

        this.selectedOrder.forEach((word) => {
            const span = document.createElement('span');
            span.className = 'sb-assembled-word';
            span.textContent = word;
            this.elements.assembledSentence.appendChild(span);
        });
    }

    checkAnswer() {
        this.clearTimer();
        this.state = 'showingResult';

        const correct = this.selectedOrder.join(' ') === this.targetOrder.join(' ');

        if (correct) {
            this.streak++;
            const base = 100;
            const timeBonus = Math.max(
                0,
                Math.floor(this.remainingMs / 200)
            );
            const streakBonus = this.streak * 10;
            this.score += base + timeBonus + streakBonus;
            this.flashResult(true);
        } else {
            this.streak = 0;
            this.flashResult(false);
        }

        this.updateStats();

        // Avanzar automáticamente a la siguiente ronda
        setTimeout(() => {
            if (this.state !== 'idle') {
                this.nextRound();
            }
        }, 600);
    }

    flashResult(success) {
        if (!this.elements.screen) return;
        const cls = success ? 'sb-flash-success' : 'sb-flash-error';
        this.elements.screen.classList.remove(cls);
        void this.elements.screen.offsetWidth;
        this.elements.screen.classList.add(cls);
        setTimeout(() => {
            this.elements.screen && this.elements.screen.classList.remove(cls);
        }, 400);
    }

    startTimer() {
        this.remainingMs = this.roundTimeMs;
        this.updateTimerBar();

        this.timerId = setInterval(() => {
            this.remainingMs -= 100;
            if (this.remainingMs <= 0) {
                this.remainingMs = 0;
                this.updateTimerBar();
                this.clearTimer();
                if (this.state === 'playing') {
                    this.checkAnswer();
                }
            } else {
                this.updateTimerBar();
            }
        }, 100);
    }

    clearTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    updateTimerBar() {
        if (!this.elements.timerBar) return;
        const progress = this.remainingMs / this.roundTimeMs;
        this.elements.timerBar.style.width = `${Math.max(
            0,
            Math.min(1, progress)
        ) * 100}%`;
    }

    updateStats() {
        if (this.elements.statsScore) {
            this.elements.statsScore.textContent = this.score;
        }
        if (this.elements.statsStreak) {
            this.elements.statsStreak.textContent = this.streak;
        }
    }

    resetRoundUI() {
        if (this.elements.wordPool) this.elements.wordPool.innerHTML = '';
        if (this.elements.assembledSentence)
            this.elements.assembledSentence.innerHTML = '';
        if (this.elements.nextBtn) {
            this.elements.nextBtn.classList.add('hidden');
        }
        this.updateTimerBar();
    }

    shuffleArray(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }
}


