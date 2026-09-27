// src/ui/components/ModeLevelSelectionComponent.js

import { Component } from '../../core/Component.js';
import { TRANSLATIONS } from '../translations.js';

export class ModeLevelSelectionComponent extends Component {
    constructor(container, gameState, app) {
        super(container, gameState);
        this.app = app;
    }

    mount() {
        super.mount();
        this.setupEventListeners();
    }

    render() {
        this.applyTranslations();
    }

    setupEventListeners() {
        // Mode Selection
        this.container.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.gameState.setMode(mode);
                
                this.container.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
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

        // Start Game
        this.container.querySelector('#start-game-btn').addEventListener('click', () => {
            if (this.gameState.mode && this.gameState.level) {
                 // In a real app, we'd transition to countdown
                 this.app.navigateTo('countdown');
            } else {
                 alert(TRANSLATIONS[this.gameState.language]['alert-name']);
            }
        });

        // Back to Games
        this.container.querySelector('#back-to-games-btn').addEventListener('click', () => {
            this.app.navigateTo('game-selection-screen');
        });
    }

    applyTranslations() {
        const t = TRANSLATIONS[this.gameState.language];
        
        this.container.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (t[key]) el.textContent = t[key];
        });

        this.container.querySelectorAll('[data-i18n-mode]').forEach(el => {
            const key = el.dataset.i18nMode;
            if (t[key]) el.textContent = t[key];
        });

        this.container.querySelectorAll('[data-i18n-level]').forEach(el => {
            const key = el.dataset.i18nLevel;
            if (t[key]) el.textContent = t[key];
        });
    }
}
