/**
 * main.js
 * Punto de entrada principal: conecta las pantallas y los juegos de The GG Arcade
 */

import { Game } from './Game.js';
import { WordDropGame } from './WordDropGame.js';
import { SentenceBuilderGame } from './SentenceBuilderGame.js';
import { VerbLabGame } from './VerbLabGame.js';
import { GrammarMemoryGame } from './GrammarMemoryGame.js';

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const elements = {
        // Home
        homeScreen: document.getElementById('homeScreen'),
        nicknameInput: document.getElementById('nicknameInput'),
        homeStartVerbBtn: document.getElementById('homeStartVerbBtn'),
        homeStartWordDropBtn: document.getElementById('homeStartWordDropBtn'),
        homeStartSentenceBtn: document.getElementById('homeStartSentenceBtn'),
        homeStartVerbLabBtn: document.getElementById('homeStartVerbLabBtn'),
        homeStartMemoryBtn: document.getElementById('homeStartMemoryBtn'),
        leaderboardList: document.getElementById('leaderboardList'),
        // Verb Vortex
        verbVortexScreen: document.getElementById('verbVortexScreen'),
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
        overlayStartBtn: document.getElementById('overlayStartBtn'),
        level: document.getElementById('levelBadge'),
        timerCountdown: document.getElementById('timerCountdown'),
        timerBarFill: document.getElementById('timerBarFill'),
        // Word Drop
        wordDropScreen: document.getElementById('wordDropScreen'),
        wdScore: document.getElementById('wdScore'),
        wdLives: document.getElementById('wdLives'),
        wdLevel: document.getElementById('wdLevel'),
        wdStreak: document.getElementById('wdStreak'),
        wdMultiplier: document.getElementById('wdMultiplier'),
        wordDropGrid: document.getElementById('wordDropGrid'),
        wordDropStartBtn: document.getElementById('wordDropStartBtn'),
        wordDropBackBtn: document.getElementById('wordDropBackBtn'),
        wordDropInput: document.getElementById('wordDropInput'),
        // Sentence Builder Rush
        sentenceScreen: document.getElementById('sentenceScreen'),
        verbLabScreen: document.getElementById('verbLabScreen'),
        sbTargetSentence: document.getElementById('sbTargetSentence'),
        sbWordPool: document.getElementById('sbWordPool'),
        sbAssembledSentence: document.getElementById('sbAssembledSentence'),
        sbStartBtn: document.getElementById('sbStartBtn'),
        sbNextBtn: document.getElementById('sbNextBtn'),
        sbBackBtn: document.getElementById('sbBackBtn'),
        sbScore: document.getElementById('sbScore'),
        sbStreak: document.getElementById('sbStreak'),
        sbTimerFill: document.getElementById('sbTimerFill'),
        // Verb Lab
        vlPrompt: document.getElementById('vlPrompt'),
        vlOptions: document.getElementById('vlOptions'),
        vlStartBtn: document.getElementById('vlStartBtn'),
        vlNextBtn: document.getElementById('vlNextBtn'),
        vlBackBtn: document.getElementById('vlBackBtn'),
        vlScore: document.getElementById('vlScore'),
        vlStreak: document.getElementById('vlStreak'),
        vlTimerFill: document.getElementById('vlTimerFill'),
        // Grammar Memory Match
        memoryScreen: document.getElementById('memoryScreen'),
        gmGrid: document.getElementById('gmGrid'),
        gmStartBtn: document.getElementById('gmStartBtn'),
        gmBackBtn: document.getElementById('gmBackBtn'),
        gmScore: document.getElementById('gmScore'),
        gmStreak: document.getElementById('gmStreak'),
        gmMatches: document.getElementById('gmMatches'),
        gmTimerFill: document.getElementById('gmTimerFill')
    };

    // Validar elementos críticos (pantalla principal + Verb Vortex)
    const requiredKeys = [
        'homeScreen',
        'nicknameInput',
        'homeStartVerbBtn',
        'homeStartWordDropBtn',
        'verbVortexScreen',
        'phraseDisplay',
        'gameInput',
        'score',
        'lives',
        'streak',
        'vortexRing',
        'startBtn',
        'pauseBtn',
        'overlay',
        'overlayTitle',
        'overlayMessage',
        'overlayStartBtn',
        'level',
        'timerCountdown',
        'timerBarFill'
    ];

    const missing = requiredKeys.filter((key) => !elements[key]);
    if (missing.length > 0) {
        console.error('Faltan elementos en el DOM:', missing);
        return;
    }

    // Instanciar juegos
    const verbGame = new Game();
    verbGame.init({
        phraseDisplay: elements.phraseDisplay,
        gameInput: elements.gameInput,
        score: elements.score,
        lives: elements.lives,
        streak: elements.streak,
        vortexRing: elements.vortexRing,
        startBtn: elements.startBtn,
        pauseBtn: elements.pauseBtn,
        overlay: elements.overlay,
        overlayTitle: elements.overlayTitle,
        overlayMessage: elements.overlayMessage,
        levelBadge: elements.level,
        timerCountdown: elements.timerCountdown,
        timerBarFill: elements.timerBarFill
    });

    const wordDropGame = new WordDropGame();
    const sentenceGame = new SentenceBuilderGame();
    const verbLabGame = new VerbLabGame();
    const memoryGame = new GrammarMemoryGame();

    // Función de navegación entre pantallas
    const showScreen = (name) => {
        elements.homeScreen?.classList.toggle('hidden', name !== 'home');
        elements.verbVortexScreen?.classList.toggle('hidden', name !== 'verb');
        elements.wordDropScreen?.classList.toggle('hidden', name !== 'word');
        elements.sentenceScreen?.classList.toggle('hidden', name !== 'sentence');
        elements.verbLabScreen?.classList.toggle('hidden', name !== 'verblab');
        elements.memoryScreen?.classList.toggle('hidden', name !== 'memory');
    };

    // Prefill nickname (usar key separada del save del juego)
    const storedName = localStorage.getItem('ggarcade_playerName');
    if (storedName && elements.nicknameInput) {
        elements.nicknameInput.value = storedName;
    }

    // Leaderboard placeholder (se mejorará luego)
    if (elements.leaderboardList) {
        elements.leaderboardList.innerHTML = '<li><span class="leaderboard-name">Juega tu primera partida para ver puntajes aquí.</span></li>';
    }

    // Verb Vortex desde el home
    elements.homeStartVerbBtn?.addEventListener('click', () => {
        const nickname = (elements.nicknameInput.value || 'Player').trim();
        localStorage.setItem('ggarcade_playerName', nickname);
        if (verbGame.setPlayerName) {
            verbGame.setPlayerName(nickname);
        }
        showScreen('verb');
    });

    // Word Drop desde el home
    elements.homeStartWordDropBtn?.addEventListener('click', () => {
        const nickname = (elements.nicknameInput.value || 'Player').trim();
        localStorage.setItem('ggarcade_playerName', nickname);
        showScreen('word');

        if (!wordDropGame.elements || !wordDropGame.elements.screen) {
            wordDropGame.init({
                screen: elements.wordDropScreen,
                grid: elements.wordDropGrid,
                input: elements.wordDropInput,
                startBtn: elements.wordDropStartBtn,
                backBtn: elements.wordDropBackBtn,
                statsScore: elements.wdScore,
                statsLives: elements.wdLives,
                statsLevel: elements.wdLevel,
                statsStreak: elements.wdStreak,
                statsMultiplier: elements.wdMultiplier
            });

            if (elements.wordDropBackBtn && !elements.wordDropBackBtn.dataset.homeBound) {
                elements.wordDropBackBtn.dataset.homeBound = '1';
                elements.wordDropBackBtn.addEventListener('click', () => {
                    wordDropGame.stop();
                    showScreen('home');
                });
            }
        }
    });

    // Sentence Builder Rush desde el home
    elements.homeStartSentenceBtn?.addEventListener('click', () => {
        const nickname = (elements.nicknameInput.value || 'Player').trim();
        localStorage.setItem('ggarcade_playerName', nickname);
        showScreen('sentence');

        if (!sentenceGame.elements || !sentenceGame.elements.screen) {
            sentenceGame.init({
                screen: elements.sentenceScreen,
                targetSentence: elements.sbTargetSentence,
                wordPool: elements.sbWordPool,
                assembledSentence: elements.sbAssembledSentence,
                startBtn: elements.sbStartBtn,
                backBtn: elements.sbBackBtn,
                nextBtn: elements.sbNextBtn,
                statsScore: elements.sbScore,
                statsStreak: elements.sbStreak,
                timerBar: elements.sbTimerFill
            });

            elements.sbBackBtn?.addEventListener('click', () => {
                sentenceGame.stop();
                showScreen('home');
            });
        }
    });

    // Verb Lab desde el home
    elements.homeStartVerbLabBtn?.addEventListener('click', () => {
        const nickname = (elements.nicknameInput.value || 'Player').trim();
        localStorage.setItem('ggarcade_playerName', nickname);
        showScreen('verblab');

        if (!verbLabGame.elements || !verbLabGame.elements.screen) {
            verbLabGame.init({
                screen: elements.verbLabScreen,
                prompt: elements.vlPrompt,
                optionsContainer: elements.vlOptions,
                startBtn: elements.vlStartBtn,
                nextBtn: elements.vlNextBtn,
                backBtn: elements.vlBackBtn,
                scoreEl: elements.vlScore,
                streakEl: elements.vlStreak,
                timerFill: elements.vlTimerFill
            });

            elements.vlBackBtn?.addEventListener('click', () => {
                verbLabGame.stop();
                showScreen('home');
            });
        }
    });

    // Grammar Memory Match desde el home
    elements.homeStartMemoryBtn?.addEventListener('click', () => {
        const nickname = (elements.nicknameInput.value || 'Player').trim();
        localStorage.setItem('ggarcade_playerName', nickname);
        showScreen('memory');

        if (!memoryGame.elements || !memoryGame.elements.screen) {
            memoryGame.init({
                screen: elements.memoryScreen,
                grid: elements.gmGrid,
                startBtn: elements.gmStartBtn,
                backBtn: elements.gmBackBtn,
                scoreEl: elements.gmScore,
                streakEl: elements.gmStreak,
                matchesEl: elements.gmMatches,
                timerFill: elements.gmTimerFill
            });

            elements.gmBackBtn?.addEventListener('click', () => {
                memoryGame.stop();
                showScreen('home');
            });
        }
    });

    // Botón de inicio en overlay para Verb Vortex
    elements.overlayStartBtn?.addEventListener('click', () => {
        verbGame.startGame();
    });

    // Prevenir Enter de enviar formularios en el input de texto
    elements.gameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
        }
    });

    // Pausar Verb Vortex cuando la pestaña pierde foco
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && verbGame.state === 'playing') {
            verbGame.pauseGame();
        }
    });

    console.log('The GG Arcade initialized');
});


