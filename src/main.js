// src/main.js

import { getUser, saveUser, saveScore, getLeaderboard } from './data.js';
import { MultiplicationGenerator } from './generator.js';
import { Timer, TIMER_MODES } from './timer.js';

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    countdown: document.getElementById('countdown-screen'),
    game: document.getElementById('game-screen'),
    results: document.getElementById('results-screen'),
    leaderboard: document.getElementById('leaderboard-screen')
};

const usernameInput = document.getElementById('username-input');
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
let currentUser = null;
let currentMode = null; // 'bullet', 'blitz', or 'rapid'
let currentLevel = 1; // 1, 2, or 3
let score = 0;
let generator = null;
let timer = null;

/**
 * Switches the visible screen.
 * @param {string} screenId 
 */
function showScreen(screenId) {
    Object.values(screens).forEach(screen => screen.classList.remove('visible'));
    screens[screenId].classList.add('visible');
}

/**
 * Renders the leaderboard for a given mode.
 * @param {string} mode 
 */
function renderLeaderboard(mode) {
    const entries = getLeaderboard(mode);
    leaderboardList.innerHTML = '';

    if (entries.length === 0) {
        leaderboardList.innerHTML = '<p style="text-align:center; padding: 20px;">No scores yet!</p>';
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
    scoreDisplay.textContent = `Score: ${score}`;
    
    const modeKey = currentMode.toUpperCase();
    const modeConfig = TIMER_MODES[modeKey];
    
    const maxFactors = { 1: 9, 2: 99, 3: 999 };
    const maxFactor = maxFactors[currentLevel];

    timerDisplay.textContent = `Time: ${modeConfig.duration}s`;
    
    generator = new MultiplicationGenerator(maxFactor);
    timer = new Timer(
        (timeLeft) => {
            timerDisplay.textContent = `Time: ${timeLeft}s`;
        },
        () => {
            endGame();
        }
    );

    showScreen('game');
    nextQuestion();
    
    // Ensure input is focused
    setTimeout(() => answerInput.focus(), 10);
    
    timer.start(modeConfig.duration);
}

/**
 * Generates the next question and updates the UI.
 */
function nextQuestion() {
    const { a, b, answer } = generator.generate();
    questionDisplay.textContent = `${a} × ${b}`;
    answerInput.value = '';
    answerInput.dataset.answer = answer;
}

/**
 * Ends the current game session and shows results.
 */
function endGame() {
    if (timer) timer.stop();
    showScreen('results');
    finalScoreDisplay.textContent = score;
    
    const user = getUser(currentUser);
    const modeKey = currentMode.toUpperCase();
    
    // Check if it's a new personal record for this mode
    const isNewRecord = user && score > (user.highScores[currentMode] || 0);
    
    if (isNewRecord) {
        newRecordMsg.classList.remove('hidden');
    } else {
        newRecordMsg.classList.add('hidden');
    }
    
    saveScore(currentUser, score, currentMode);
}

// --- Event Listeners ---

// Mode Selection
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const name = usernameInput.value.trim();
        if (!name) {
            alert('Please enter your name to start playing!');
            usernameInput.focus();
            return;
        }
        currentUser = name;
        saveUser(currentUser);
        currentMode = btn.dataset.mode; // 'bullet', 'blitz', or 'rapid'
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

// Answer Input (Real-time checking)
answerInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    const correctAnswer = parseInt(e.target.dataset.answer, 10);
    
    if (val === correctAnswer) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
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
        // Check if there is a limit on length maybe? Not strictly needed for this game
        answerInput.value += key;
    }
    
    // Manually trigger 'input' event so existing logic handles it
    answerInput.dispatchEvent(new Event('input'));
});

// Results Screen
restartBtn.addEventListener('click', () => {
    usernameInput.value = '';
    showScreen('start');
});

leaderboardBtn.addEventListener('click', () => {
    showScreen('leaderboard');
    // Default to current mode if available, otherwise bullet
    const mode = currentMode || 'bullet';
    renderLeaderboard(mode);
    
    // Update active class on filters
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
    // Ready to go
    console.log('Multiplication Speed Math initialized.');
});
