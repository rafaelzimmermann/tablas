// src/ui/components/GameSelectionComponent.js

import { Component } from '../../core/Component.js';
import { TRANSLATIONS } from '../translations.js';

export class GameSelectionComponent extends Component {
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
        // Game Selection
        this.container.querySelectorAll('.game-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const gameType = btn.dataset.game;
                this.gameState.setGameType(gameType);
                this.app.navigateTo('mode-level-screen');
            });
        });

        // Back to Start
        this.container.querySelector('#back-to-start-btn').addEventListener('click', () => {
            this.app.navigateTo('start-screen');
        });
    }

    applyTranslations() {
        const t = TRANSLATIONS[this.gameState.language];
        
        this.container.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (t[key]) el.textContent = t[key];
        });
    }
}
