export class VerbLabGame {
    constructor() {
        this.state = 'idle'; // idle | playing | showingResult

        this.verbs = [
            { base: 'go', past: 'went', pp: 'gone', ing: 'going' },
            { base: 'eat', past: 'ate', pp: 'eaten', ing: 'eating' },
            { base: 'do', past: 'did', pp: 'done', ing: 'doing' },
            { base: 'have', past: 'had', pp: 'had', ing: 'having' },
            { base: 'make', past: 'made', pp: 'made', ing: 'making' },
            { base: 'play', past: 'played', pp: 'played', ing: 'playing' },
            { base: 'watch', past: 'watched', pp: 'watched', ing: 'watching' },
            { base: 'read', past: 'read', pp: 'read', ing: 'reading' },
            { base: 'write', past: 'wrote', pp: 'written', ing: 'writing' },
            { base: 'see', past: 'saw', pp: 'seen', ing: 'seeing' }
        ];

        this.currentVerb = null;
        this.currentForm = 'past'; // 'past' | 'pp' | 'ing'
        this.options = [];

        this.score = 0;
        this.streak = 0;
        this.timePerRoundMs = 12000;
        this.remainingMs = this.timePerRoundMs;
        this.timerId = null;

        this.elements = {
            screen: null,
            prompt: null,
            optionsContainer: null,
            startBtn: null,
            nextBtn: null,
            backBtn: null,
            scoreEl: null,
            streakEl: null,
            timerFill: null
        };
    }

    init(elements) {
        this.elements = { ...this.elements, ...elements };
        this.attachEvents();
        this.updateStats();
        this.resetRoundUI();
    }

    attachEvents() {
        this.elements.startBtn?.addEventListener('click', () => this.start());
        this.elements.nextBtn?.addEventListener('click', () => this.nextRound());
        this.elements.backBtn?.addEventListener('click', () => this.stop());
    }

    start() {
        if (this.state === 'playing') return;
        this.score = 0;
        this.streak = 0;
        this.updateStats();
        this.nextRound();
        if (this.elements.startBtn) this.elements.startBtn.disabled = true;
    }

    stop() {
        this.state = 'idle';
        this.clearTimer();
        if (this.elements.startBtn) this.elements.startBtn.disabled = false;
    }

    nextRound() {
        this.clearTimer();
        this.state = 'playing';
        this.resetRoundUI();
        this.pickVerbAndForm();
        this.renderRound();
        this.startTimer();
    }

    pickVerbAndForm() {
        this.currentVerb = this.verbs[Math.floor(Math.random() * this.verbs.length)];
        const forms = ['past', 'pp', 'ing'];
        this.currentForm = forms[Math.floor(Math.random() * forms.length)];

        const correct = this.currentVerb[this.currentForm];

        // Construir bolsa de distractores del mismo tipo
        const candidates = this.verbs
            .filter(v => v !== this.currentVerb)
            .map(v => v[this.currentForm]);

        // Barajar candidates
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }

        const needed = 2;
        const distractors = candidates.slice(0, needed);
        this.options = this.shuffleArray([correct, ...distractors]);
    }

    renderRound() {
        const { prompt, optionsContainer } = this.elements;
        if (!prompt || !optionsContainer || !this.currentVerb) return;

        const labelMap = {
            past: 'Past Simple',
            pp: 'Past Participle',
            ing: 'Gerund (-ing)'
        };

        prompt.textContent = `Selecciona la forma "${labelMap[this.currentForm]}" de "${this.currentVerb.base}"`;

        optionsContainer.innerHTML = '';
        this.options.forEach((form) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'vl-card';
            btn.textContent = form;
            btn.addEventListener('click', () => this.handleChoice(btn, form));
            optionsContainer.appendChild(btn);
        });
    }

    handleChoice(button, choice) {
        if (this.state !== 'playing') return;

        this.clearTimer();
        this.state = 'showingResult';

        const correct = this.currentVerb[this.currentForm];
        const isCorrect = choice === correct;

        if (isCorrect) {
            button.classList.add('vl-card-correct');
            this.streak++;
            const base = 80;
            const timeBonus = Math.max(0, Math.floor(this.remainingMs / 250));
            const streakBonus = this.streak * 10;
            this.score += base + timeBonus + streakBonus;
        } else {
            button.classList.add('vl-card-wrong');
            this.streak = 0;
            // marcar también la correcta
            const btnCorrect = this.elements.optionsContainer?.querySelector(
                `.vl-card:not(.vl-card-wrong)`
            );
            if (btnCorrect) btnCorrect.classList.add('vl-card-correct');
        }

        this.updateStats();

        // Avanzar automáticamente a la siguiente ronda
        setTimeout(() => {
            if (this.state !== 'idle') {
                this.nextRound();
            }
        }, 600);
    }

    startTimer() {
        this.remainingMs = this.timePerRoundMs;
        this.updateTimer();

        this.timerId = setInterval(() => {
            this.remainingMs -= 100;
            if (this.remainingMs <= 0) {
                this.remainingMs = 0;
                this.updateTimer();
                this.clearTimer();
                if (this.state === 'playing') {
                    this.handleTimeout();
                }
            } else {
                this.updateTimer();
            }
        }, 100);
    }

    handleTimeout() {
        this.state = 'showingResult';
        this.streak = 0;
        // marcar correcta
        const correct = this.currentVerb?.[this.currentForm];
        const buttons = this.elements.optionsContainer?.querySelectorAll('.vl-card') || [];
        buttons.forEach((btn) => {
            if (btn.textContent === correct) {
                btn.classList.add('vl-card-correct');
            }
        });
        this.updateStats();
        setTimeout(() => {
            if (this.state !== 'idle') {
                this.nextRound();
            }
        }, 600);
    }

    clearTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    updateStats() {
        if (this.elements.scoreEl) {
            this.elements.scoreEl.textContent = this.score;
        }
        if (this.elements.streakEl) {
            this.elements.streakEl.textContent = this.streak;
        }
    }

    updateTimer() {
        if (!this.elements.timerFill) return;
        const ratio = Math.max(0, Math.min(1, this.remainingMs / this.timePerRoundMs));
        this.elements.timerFill.style.width = `${ratio * 100}%`;
    }

    resetRoundUI() {
        this.elements.optionsContainer && (this.elements.optionsContainer.innerHTML = '');
        this.elements.prompt && (this.elements.prompt.textContent = 'Pulsa "Start" para comenzar.');
        this.elements.timerFill && (this.elements.timerFill.style.width = '100%');
        this.elements.nextBtn && this.elements.nextBtn.classList.add('hidden');
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


