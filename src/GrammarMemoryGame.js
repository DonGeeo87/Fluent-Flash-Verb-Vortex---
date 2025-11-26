/**
 * GrammarMemoryGame.js
 * Juego de memoria con parejas gramaticales
 */

export class GrammarMemoryGame {
    constructor() {
        this.state = 'idle'; // idle | playing | showingResult

        // Tipos de parejas gramaticales
        this.pairTypes = {
            pronounsToBe: [
                { left: 'I', right: 'am' },
                { left: 'She', right: 'is' },
                { left: 'He', right: 'is' },
                { left: 'It', right: 'is' },
                { left: 'We', right: 'are' },
                { left: 'They', right: 'are' },
                { left: 'You', right: 'are' }
            ],
            irregularVerbs: [
                { left: 'go', right: 'went' },
                { left: 'eat', right: 'ate' },
                { left: 'see', right: 'saw' },
                { left: 'make', right: 'made' },
                { left: 'take', right: 'took' },
                { left: 'come', right: 'came' },
                { left: 'do', right: 'did' },
                { left: 'have', right: 'had' },
                { left: 'write', right: 'wrote' },
                { left: 'read', right: 'read' }
            ],
            contractions: [
                { left: 'I am', right: "I'm" },
                { left: 'You are', right: "You're" },
                { left: 'We are', right: "We're" },
                { left: 'They are', right: "They're" },
                { left: 'He is', right: "He's" },
                { left: 'She is', right: "She's" },
                { left: 'It is', right: "It's" }
            ],
            opposites: [
                { left: 'big', right: 'small' },
                { left: 'hot', right: 'cold' },
                { left: 'fast', right: 'slow' },
                { left: 'happy', right: 'sad' },
                { left: 'good', right: 'bad' },
                { left: 'up', right: 'down' },
                { left: 'in', right: 'out' }
            ]
        };

        this.currentPairs = [];
        this.cards = []; // Array de {id, text, pairId, flipped, matched}
        this.selectedCards = []; // Índices de las 2 tarjetas seleccionadas
        this.matchesFound = 0;
        this.totalPairs = 8;

        this.score = 0;
        this.streak = 0;
        this.roundTimeMs = 60000; // 60 segundos por ronda
        this.remainingMs = this.roundTimeMs;
        this.timerId = null;
        this.canFlip = true;

        this.elements = {
            screen: null,
            grid: null,
            startBtn: null,
            backBtn: null,
            scoreEl: null,
            streakEl: null,
            timerFill: null,
            matchesEl: null
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
        this.canFlip = true;
        this.selectedCards = [];
        this.matchesFound = 0;
        this.resetRoundUI();
        this.generatePairs();
        this.createCards();
        this.renderGrid();
        this.startTimer();
    }

    generatePairs() {
        // Seleccionar tipo de parejas (rotar entre tipos)
        const allPairs = [
            ...this.pairTypes.pronounsToBe,
            ...this.pairTypes.irregularVerbs,
            ...this.pairTypes.contractions,
            ...this.pairTypes.opposites
        ];

        // Mezclar y tomar 8 parejas
        const shuffled = this.shuffleArray([...allPairs]);
        this.currentPairs = shuffled.slice(0, this.totalPairs);
    }

    createCards() {
        this.cards = [];
        let cardId = 0;

        // Crear 2 tarjetas por cada pareja (left y right)
        this.currentPairs.forEach((pair, pairIndex) => {
            // Tarjeta izquierda
            this.cards.push({
                id: cardId++,
                text: pair.left,
                pairId: pairIndex,
                flipped: false,
                matched: false,
                side: 'left'
            });

            // Tarjeta derecha
            this.cards.push({
                id: cardId++,
                text: pair.right,
                pairId: pairIndex,
                flipped: false,
                matched: false,
                side: 'right'
            });
        });

        // Mezclar las tarjetas
        this.cards = this.shuffleArray(this.cards);
    }

    renderGrid() {
        if (!this.elements.grid) return;
        this.elements.grid.innerHTML = '';

        this.cards.forEach((card, index) => {
            const cardEl = document.createElement('button');
            cardEl.type = 'button';
            cardEl.className = 'gm-card';
            cardEl.dataset.index = String(index);
            cardEl.dataset.pairId = String(card.pairId);

            if (card.flipped || card.matched) {
                cardEl.textContent = card.text;
                cardEl.classList.add('gm-card-flipped');
                if (card.matched) {
                    cardEl.classList.add('gm-card-matched');
                }
            } else {
                cardEl.textContent = '?';
                cardEl.classList.add('gm-card-back');
            }

            if (!card.matched) {
                cardEl.addEventListener('click', () => this.handleCardClick(index));
            }

            this.elements.grid.appendChild(cardEl);
        });
    }

    handleCardClick(index) {
        if (this.state !== 'playing' || !this.canFlip) return;
        const card = this.cards[index];
        if (!card || card.flipped || card.matched) return;

        // Voltear la tarjeta
        card.flipped = true;
        this.selectedCards.push(index);
        this.renderGrid();

        // Si hay 2 tarjetas seleccionadas, verificar match
        if (this.selectedCards.length === 2) {
            this.canFlip = false;
            setTimeout(() => this.checkMatch(), 800);
        }
    }

    checkMatch() {
        const [idx1, idx2] = this.selectedCards;
        const card1 = this.cards[idx1];
        const card2 = this.cards[idx2];

        if (card1.pairId === card2.pairId && card1.side !== card2.side) {
            // Match correcto
            card1.matched = true;
            card2.matched = true;
            this.matchesFound++;
            this.streak++;
            const base = 100;
            const timeBonus = Math.max(0, Math.floor(this.remainingMs / 500));
            const streakBonus = this.streak * 15;
            this.score += base + timeBonus + streakBonus;
            this.flashResult(true);
        } else {
            // No match
            card1.flipped = false;
            card2.flipped = false;
            this.streak = 0;
            this.flashResult(false);
        }

        this.selectedCards = [];
        this.canFlip = true;
        this.updateStats();
        this.renderGrid();

        // Si completó todas las parejas, siguiente ronda
        if (this.matchesFound >= this.totalPairs) {
            setTimeout(() => this.nextRound(), 1200);
        }
    }

    flashResult(success) {
        if (!this.elements.screen) return;
        const cls = success ? 'gm-flash-success' : 'gm-flash-error';
        this.elements.screen.classList.add(cls);
        setTimeout(() => {
            this.elements.screen && this.elements.screen.classList.remove(cls);
        }, 400);
    }

    startTimer() {
        this.remainingMs = this.roundTimeMs;
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
        this.updateStats();
        // Mostrar todas las tarjetas
        this.cards.forEach(card => {
            card.flipped = true;
        });
        this.renderGrid();
        // Siguiente ronda después de un delay
        setTimeout(() => this.nextRound(), 2000);
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
        if (this.elements.matchesEl) {
            this.elements.matchesEl.textContent = `${this.matchesFound}/${this.totalPairs}`;
        }
    }

    updateTimer() {
        if (!this.elements.timerFill) return;
        const ratio = Math.max(0, Math.min(1, this.remainingMs / this.roundTimeMs));
        this.elements.timerFill.style.width = `${ratio * 100}%`;
    }

    resetRoundUI() {
        if (this.elements.grid) this.elements.grid.innerHTML = '';
        if (this.elements.timerFill) this.elements.timerFill.style.width = '100%';
        if (this.elements.matchesEl) this.elements.matchesEl.textContent = '0/8';
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

