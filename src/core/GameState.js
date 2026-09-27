// src/core/GameState.js

/**
 * Centralized state for the math games application.
 */
export class GameState {
  constructor() {
    this.user = null;
    this.language = "en";
    this.gameType = "multiplication";
    this.mode = "blitz"; // 'bullet', 'blitz', 'rapid'
    this.level = 1;
    this.score = 0;
    this.isGameActive = false;
    this.listeners = [];
    this.result = null;
  }

  /**
   * Sets the current user.
   * @param {string|null} username
   */
  setUser(username) {
    this.user = username;
    this.notify();
  }

  /**
   * Sets the current language.
   * @param {string} lang
   */
  setLanguage(lang) {
    this.language = lang;
    this.notify();
  }

  /**
   * Sets the selected game type.
   * @param {string} type
   */
  setGameType(type) {
    this.gameType = type;
    this.notify();
  }

  /**
   * Sets the selected mode.
   * @param {string} mode
   */
  setMode(mode) {
    this.mode = mode;
    this.notify();
  }

  /**
   * Sets the selected level.
   * @param {number} level
   */
  setLevel(level) {
    this.level = level;
    this.notify();
  }

  /**
   * Resets the score.
   * @param {number} score
   */
  setScore(score) {
    this.score = score;
    this.notify();
  }

  /**
   * Sets the game active status.
   * @param {boolean} active
   */
  setIsGameActive(active) {
    this.isGameActive = active;
    this.notify();
  }

  /**
   * Subscribe to state changes.
   * @param {Function} listener
   * @returns {Function} unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all subscribers of state changes.
   */
  notify() {
    this.listeners.forEach((listener) => listener(this));
  }

  /**
   * Reset entire game state back to initial values.
   */
  reset() {
    this.user = null;
    this.language = "en";
    this.gameType = "multiplication";
    this.mode = "blitz";
    this.level = 1;
    this.score = 0;
    this.isGameActive = false;
    this.notify();
  }
}

// Export a singleton instance
export const gameState = new GameState();
