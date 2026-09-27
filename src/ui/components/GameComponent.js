// src/ui/components/GameComponent.js

import { Component } from '../../core/Component.js';
import { TRANSLATIONS } from '../translations.js';
import { TIMER_MODES } from '../../timer.js';
import { LearningService } from '../../logic/LearningService.js';
import { MultiplicationGenerator } from '../../logic/generators/MultiplicationGenerator.js';
import { AdditionGenerator } from '../../logic/generators/AdditionGenerator.js';
import { SubtractionGenerator } from '../../logic/generators/SubtractionGenerator.js';
import { DivisionGenerator } from '../../logic/generators/DivisionGenerator.js';
import { Timer } from '../../timer.js';
import { saveScore, getCompositeKey, getUser } from '../../data.js';

export class GameComponent extends Component {
    constructor(container, gameState, app) {
        super(container, gameState);
        this.app = app;
        this.timer = null;
        this.generator = null;
        this.currentQuestion = null;
    }

    mount() {
        super.mount();
        this.setupEventListeners();
        this.render();
    }

    activate() {
        this.setupGame();
    }

    setupGame() {
        const { gameType, mode, level, user } = this.gameState;
        
        const maxRange = level === 1 ? 9 : level === 2 ? 99 : 999;
        
        switch (gameType) {
            case 'multiplication':
                this.generator = new MultiplicationGenerator(maxRange);
                break;
            case 'sum':
                this.generator = new AdditionGenerator(maxRange);
                break;
            case 'subtraction':
                this.generator = new SubtractionGenerator(maxRange);
                break;
            case 'division':
                this.generator = new DivisionGenerator(maxRange);
                break;
            default:
                throw new Error(`Unknown game type: ${gameType}`);
        }

        const pool = LearningService.getPool(user, gameType);

        const modeConfig = TIMER_MODES[mode];
        this.timer = new Timer(
            (timeLeft) => this.updateTimerDisplay(timeLeft),
            () => this.endGame()
        );

        this.gameState.setScore(0);
        this.gameState.setIsGameActive(true);
        
        this.nextQuestion(pool);
        this.timer.start(modeConfig.duration);
    }

    nextQuestion(pool = []) {
        this.currentQuestion = this.generator.generate(pool);
        const { a, b, answer } = this.currentQuestion;
        
        let questionText = '';
        switch (this.gameState.gameType) {
            case 'multiplication': questionText = `${a} × ${b}`; break;
            case 'sum': questionText = `${a} + ${b}`; break;
            case 'subtraction': questionText = `${a} - ${b}`; break;
            case 'division': questionText = `${a} ÷ ${b}`; break;
        }
        
        this.container.querySelector('#question-display').textContent = questionText;
        const input = this.container.querySelector('#answer-input');
        input.value = '';
        input.dataset.answer = answer;
    }

    setupEventListeners() {
        const input = this.container.querySelector('#answer-input');
        
        input.addEventListener('input', (e) => {
            const valStr = e.target.value;
            const val = parseInt(valStr, 10);
            const correctAnswer = parseInt(e.target.dataset.answer, 10);
            
            if (val === correctAnswer) {
                this.handleCorrectAnswer();
            } else if (valStr.length >= String(correctAnswer).length && val !== correctAnswer) {
                // Heuristic: if they typed enough digits and it's wrong, it's a mistake.
                this.handleMistake(val, correctAnswer);
            }
        });

        // Also handle Enter key for completeness
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = parseInt(input.value, 10);
                const correctAnswer = parseInt(input.dataset.answer, 10);
                if (val === correctAnswer) {
                    this.handleCorrectAnswer();
                } else {
                    this.handleMistake(val, correctAnswer);
                }
            }
        });

        const keyboard = this.container.querySelector('#number-keyboard');
        if (keyboard) {
            keyboard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('key')) return;
                const key = e.target.dataset.key;
                if (key === 'Backspace') {
                    input.value = input.value.slice(0, -1);
                } else if (key === 'Clear') {
                    // If they clear, and they had something, it's a mistake
                    if (input.value !== '') {
                        this.handleMistake(parseInt(input.value, 10), parseInt(input.dataset.answer, 10));
                    }
                    input.value = '';
                } else {
                    input.value += key;
                }
                input.dispatchEvent(new Event('input'));
            });
        }
    }

    handleCorrectAnswer() {
        this.gameState.setScore(this.gameState.score + 1);
        this.updateScoreDisplay();
        
        const pool = LearningService.getPool(this.gameState.user, this.gameState.gameType);
        this.nextQuestion(pool);
    }

    handleMistake(enteredValue, correctAnswer) {
        // Avoid recording empty mistakes
        if (isNaN(enteredValue)) return;

        LearningService.recordFailure(this.gameState.user, this.gameState.gameType, {
            a: this.currentQuestion.a,
            b: this.currentQuestion.b,
            answer: correctAnswer
        });
        
        const input = this.container.querySelector('#answer-input');
        input.value = '';
        // Provide feedback: maybe a quick flash. For now, just clear it.
    }

    updateTimerDisplay(timeLeft) {
        const t = TRANSLATIONS[this.gameState.language];
        const prefix = t['time-prefix'] || 'Time: ';
        this.container.querySelector('#timer-display').textContent = `${prefix}${timeLeft}s`;
    }

    updateScoreDisplay() {
        const t = TRANSLATIONS[this.gameState.language];
        const prefix = t['score-prefix'] || 'Score: ';
        this.container.querySelector('#score-display').textContent = `${prefix}${this.gameState.score}`;
    }

    endGame() {
        if (this.timer) this.timer.stop();
        this.gameState.setIsGameActive(false);
        this.app.navigateTo('results');
        
        this.container.querySelector('#final-score').textContent = this.gameState.score;
    }

    render() {
        // The HTML is handled by containers in index.html
    }
}
