// src/ui/components/StartScreenComponent.js

import { Component } from '../../core/Component.js';
import { TRANSLATIONS } from '../translations.js';

export class StartScreenComponent extends Component {
    constructor(container, gameState, app) {
        super(container, gameState);
        this.app = app;
    }

    mount() {
        super.mount();
        this.setupEventListeners();
        this.applyTranslations();
    }

    setupEventListeners() {
        // Language selection
        this.container.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.gameState.setLanguage(lang);
                this.applyTranslations();
                
                // update active class
                this.container.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Username input
        const usernameInput = this.container.querySelector('#username-input');
        usernameInput.addEventListener('input', () => {
            const name = usernameInput.value.trim();
            if (name) {
                this.gameState.setUser(name);
            } else {
                this.gameState.setUser(null);
            }
            this.updateStartButtonState();
        });

        // Mode Selection
        this.container.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.gameState.setMode(mode);
                
                this.container.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.updateStartButtonState();
            });
        });

        // Level Selection
        this.container.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.dataset.level, 10);
                this.gameState.setLevel(level);
                
                this.container.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Start Button
        this.container.querySelector('#start-game-btn').addEventListener('click', () => {
            if (this.gameState.user && this.gameState.mode) {
                this.app.navigateTo('countdown');
                // We would probably trigger a countdown component here
            }
        });

        // Continue Button
        this.container.querySelector('#continue-btn').addEventListener('click', () => {
            if (this.gameState.user) {
                this.app.navigateTo('game-selection-screen');
            } else {
                alert(TRANSLATIONS[this.gameState.language]['alert-name']);
            }
        });

        // View Leaderboard
        this.container.querySelector('#view-leaderboard-btn').addEventListener('click', () => {
            this.app.navigateTo('leaderboard');
        });
    }

    applyTranslations() {
        const t = TRANSLATIONS[this.gameState.language];
        
        // Text content
        this.container.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (t[key]) el.textContent = t[key];
        });

        // Placeholder
        this.container.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (t[key]) el.placeholder = t[key];
        });

        // Instruction
        const instruction = this.container.querySelector('.instruction');
        if (instruction) {
            instruction.textContent = t['start-instruction'];
        }
    }

    updateStartButtonState() {
        // Not strictly needed if we use the alert, but good practice
    }
}
