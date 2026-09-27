// src/ui/components/LeaderboardComponent.js

import { Component } from '../../core/Component.js';
import { TRANSLATIONS } from '../translations.js';
import { getLeaderboard } from '../../data.js';
import { getCompositeKey } from '../../data.js';

export class LeaderboardComponent extends Component {
    constructor(container, gameState, app) {
        super(container, gameState);
        this.app = app;
    }

    mount() {
        super.mount();
        this.setupEventListeners();
        this.renderLeaderboard();
    }

    setupEventListeners() {
        const filterBtns = this.container.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderLeaderboard(btn.dataset.mode);
            });
        });

        const backToStartBtn = this.container.querySelector('#back-to-start-btn');
        if (backToStartBtn) {
            backToStartBtn.addEventListener('click', () => {
                this.app.navigateTo('start-screen');
            });
        }
    }

    renderLeaderboard(mode = null) {
        // If mode is not provided, use current mode from gameState
        const targetMode = mode || this.gameState.mode;
        const compositeKey = getCompositeKey(this.gameState.gameType, targetMode, this.gameState.level);
        
        const entries = getLeaderboard(compositeKey);
        const listContainer = this.container.querySelector('#leaderboard-list');
        listContainer.innerHTML = '';

        if (entries.length === 0) {
            const p = document.createElement('p');
            p.style.textAlign = 'center';
            p.style.padding = '20px';
            p.textContent = TRANSLATIONS[this.gameState.language]['no-scores'];
            listContainer.appendChild(p);
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
            listContainer.appendChild(div);
        });
    }

    render() {
        // HTML is already in index.html
    }
}
