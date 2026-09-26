// src/main.js

import { getUser, saveUser, saveScore, getLeaderboard } from './data.js';
import { MultiplicationGenerator } from './generator.js';
import { Timer, TIMER_MODES } from './timer.js';

// --- Translations ---
const TRANSLATIONS = {
    en: {
        title: 'Multiplication Speed Math',
        'name-placeholder': 'Enter your name',
        'difficulty-label': 'Select Difficulty:',
        'level1': 'Level 1 (1-9)',
        'level2': 'Level 2 (1-99)',
        'level3': 'Level 3 (1-999)',
        'bullet': 'Bullet (30s)',
        'blitz': 'Blitz (60s)',
        'rapid': 'Rapid (120s)',
        'time-prefix': 'Time: ',
        'score-prefix': 'Score: ',
        'game-over': 'Game Over!',
        'score-label': 'Score',
        'new-record': '🎉 New Personal Record!',
        'restart': 'Play Again',
        'leaderboard': 'View Leaderboard',
        'leaderboard-title': 'Leaderboard',
        'back': 'Back to Start',
        'no-scores': 'No scores yet!',
        'alert-name': 'Please enter your name to start playing!'
    },
    es: {
        title: 'Matemáticas de Velocidad: Multiplicación',
        'name-placeholder': 'Introduce tu nombre',
        'difficulty-label': 'Selecciona Dificultad:',
        'level1': 'Nivel 1 (1-9)',
        'level2': 'Nivel 2 (1-99)',
        'level3': 'Nivel 3 (1-999)',
        'bullet': 'Bala (30s)',
        'blitz': 'Blitz (60s)',
        'rapid': 'Rápido (120s)',
        'time-prefix': 'Tiempo: ',
        'score-prefix': 'Puntuación: ',
        'game-over': '¡Fin del juego!',
        'score-label': 'Puntos',
        'new-record': '🎉 ¡Nuevo récord personal!',
        'restart': 'Jugar de nuevo',
        'leaderboard': 'Ver clasificación',
        'leaderboard-title': 'Clasificación',
        'back': 'Volver al inicio',
        'no-scores': '¡Aún no hay puntuaciones!',
        'alert-name': '¡Por favor, introduce tu nombre para empezar!'
    }
};

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    countdown: document.getElementById('countdown-screen'),
    game: document.getElementById('game-screen'),
    results: document.getElementById('results-screen'),
    leaderboard: document.getElementById('leaderboard-screen')
};

const usernameInput = document.getElementById('username-input');
const langBtns = document.querySelectorAll('.lang-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const levelBtns = document.querySelectorAll('.level-btn');
const countdownDisplay = document.getElementById('countdown-display');
const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');
const questionDisplay = document.getElementById('question-display');
const answerInput = document.getElementById('answer-input');
const numberKeyboard = document.getElementById('number-keyboard');
const finalScoreDisplay = document.getElementById('final-score');
const newRecordMsg = document.getElementById('new-record-msg');
const restartBtn = document.getElementById('restart-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const backToStartBtn = document.getElementById('back-to-start-btn');

// State
let currentLanguage = 'en';
let currentUser = null;
let currentMode = null; 
let currentLevel = 1; 
let score = 0;
let generator = null;
let timer = null;

/**
 * Applies current translations to the DOM.
 */
function applyTranslations() {
    const t = TRANSLATIONS[currentLanguage];

    // Text content translations
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) el.textContent = t[key];
    });

    // Placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (t[key]) el.placeholder = t[key];
    });

    // Mode button translations
    document.querySelectorAll('[data-i18n-mode]').forEach(el => {
        const key = el.dataset.i18nMode;
        if (t[key]) el.textContent = t[key];
    });

    // Level button translations
    document.querySelectorAll('[data-i18n-level]').forEach(el => {
        const key = el.dataset.i18nLevel;
        if (t[key]) el.textContent = t[key];
    });

    // Prefixes (Time, Score)
    document.querySelectorAll('[data-i18n-prefix]').forEach(el => {
        const key = el.dataset.i18nPrefix;
        const prefix = t[key];
        // We need to preserve the numeric part if it's already there
        // In our case, they are updated via script, so we just store the prefix 
        // and re-apply it when the numeric value changes.
        el.dataset.currentPrefix = prefix;
    });

    // Update existing displays with new prefixes
    updateTimerDisplay();
    updateScoreDisplay();
}

/**
 * Switches the visible screen.
 */
function showScreen(screenId) {
    Object.values(screens).forEach(screen => screen.classList.remove('visible'));
    screens[screenId].classList.add('visible');
}

/**
 * Renders the leaderboard for a given mode.
 */
function renderLeaderboard(mode) {
    const entries = getLeaderboard(mode);
    leaderboardList.innerHTML = '';

    if (entries.length === 0) {
        const p = document.createElement('p');
        p.style.textAlign = 'center';
        p.style.padding = '20px';
        p.textContent = TRANSLATIONS[currentLanguage]['no-scores'];
        leaderboardList.appendChild(p);
        return;
    }

    entries.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'leaderboard-entry';
        div.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span class="name">${entry.username}</span>
            <span class="score">${entry.score}</span>
        `;
        leaderboardList.appendChild(div);
    });
}

/**
 * Starts the 5-second countdown.
 */
function startCountdown() {
    showScreen('countdown');
    let count = 5;
    countdownDisplay.textContent = count;

    const interval = setInterval(() => {
        count--;
        if (count <= 0) {
            clearInterval(interval);
            startGame();
        } else {
            countdownDisplay.textContent = count;
        }
    }, 1000);
}

/**
 * Initializes and starts the game session.
 */
function startGame() {
    score = 0;
    updateScoreDisplay();
    
    const modeKey = currentMode.toUpperCase();
    const modeConfig = TIMER_MODES[modeKey];
    
    updateTimerDisplay(modeConfig.duration);
    
    generator = new MultiplicationGenerator(
        { 1: 9, 2: 99, 3: 999 }[currentLevel]
    );
    
    timer = new Timer(
        (timeLeft) => {
            updateTimerDisplay(timeLeft);
        },
        () => {
            endGame();
        }
    );

    showScreen('game');
    nextQuestion();
    
    setTimeout(() => answerInput.focus(), 10);
    timer.start(modeConfig.duration);
}

function updateTimerDisplay(timeLeft) {
    const prefix = timerDisplay.dataset.currentPrefix || TRANSLATIONS[currentLanguage]['time-prefix'];
    timerDisplay.textContent = `${prefix}${timeLeft}s`;
}

function updateScoreDisplay() {
    const prefix = scoreDisplay.dataset.currentPrefix || TRANSLATIONS[currentLanguage]['score-prefix'];
    scoreDisplay.textContent = `${prefix}${score}`;
}

function nextQuestion() {
    const { a, b, answer } = generator.generate();
    questionDisplay.textContent = `${a} × ${b}`;
    answerInput.value = '';
    answerInput.dataset.answer = answer;
}

function endGame() {
    if (timer) timer.stop();
    showScreen('results');
    finalScoreDisplay.textContent = score;
    
    const user = getUser(currentUser);
    const isNewRecord = user && score > (user.highScores[currentMode] || 0);
    
    newRecordMsg.classList.toggle('hidden', !isNewRecord);
    
    saveScore(currentUser, score, currentMode);
}

// --- Event Listeners ---

// Language Selection
langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLanguage = btn.dataset.lang;
        applyTranslations();
    });
});

// Mode Selection
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const name = usernameInput.value.trim();
        if (!name) {
            alert(TRANSLATIONS[currentLanguage]['alert-name']);
            usernameInput.focus();
            return;
        }
        currentUser = name;
        saveUser(currentUser);
        currentMode = btn.dataset.mode;
        startCountdown();
    });
});

// Level Selection
levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLevel = parseInt(btn.dataset.level, 10);
    });
});

// Answer Input
answerInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    const correctAnswer = parseInt(e.target.dataset.answer, 10);
    
    if (val === correctAnswer) {
        score++;
        updateScoreDisplay();
        nextQuestion();
    }
});

// Number Keyboard
numberKeyboard.addEventListener('click', (e) => {
    if (!e.target.classList.contains('key')) return;

    const key = e.target.dataset.key;
    
    if (key === 'Backspace') {
        answerInput.value = answerInput.value.slice(0, -1);
    } else if (key === 'Clear') {
        answerInput.value = '';
    } else {
        answerInput.value += key;
    }
    
    answerInput.dispatchEvent(new Event('input'));
});

// Results Screen
restartBtn.addEventListener('click', () => {
    usernameInput.value = '';
    showScreen('start');
});

leaderboardBtn.addEventListener('click', () => {
    showScreen('leaderboard');
    const mode = currentMode || 'bullet';
    renderLeaderboard(mode);
    
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
});

// Leaderboard Filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderLeaderboard(mode);
    });
});

// Back to Start
backToStartBtn.addEventListener('click', () => {
    showScreen('start');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    console.log('Multiplication Speed Math initialized.');
});
