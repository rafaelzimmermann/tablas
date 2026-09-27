// src/data.js

/**
 * Data Access Layer for Math Games Suite
 * Uses localStorage for persistence.
 * 
 * Schema:
 * 'math_game_users': { 
 *   [username]: { 
 *     totalGames: number, 
 *     highScores: { [compositeKey]: number } // e.g. "multiplication_bullet_1"
 *   } 
 * }
 * 'math_game_leaderboard': [ 
 *   { username: string, score: number, compositeKey: string, timestamp: number } 
 * ]
 * 'math_game_learning_data': {
 *   [username]: {
 *     [gameType]: [ { a: number, b: number, answer: number, timestamp: number } ]
 *   }
 * }
 */

const STORAGE_KEYS = {
    USERS: 'math_game_users',
    LEADERBOARD: 'math_game_leaderboard',
    LEARNING: 'math_game_learning_data'
};

/**
 * Gets the user data from localStorage.
 * @param {string} username 
 * @returns {Object|null}
 */
export function getUser(username) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    return users[username] || null;
}

/**
 * Creates a new user in localStorage if they don't exist.
 * @param {string} username 
 */
export function saveUser(username) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    if (!users[username]) {
        users[username] = {
            totalGames: 0,
            highScores: {}
        };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
}

/**
 * Formats a composite key for scores and leaderboards.
 * @param {string} gameType 
 * @param {string} mode 
 * @param {number} level 
 * @returns {string}
 */
export function getCompositeKey(gameType, mode, level) {
    return `${gameType}_${mode}_${level}`;
}

/**
 * Saves a score to the leaderboard and updates user's high score.
 * @param {string} username 
 * @param {number} score 
 * @param {string} compositeKey 
 */
export function saveScore(username, score, compositeKey) {
    // 1. Update Leaderboard
    const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    leaderboard.push({
        username,
        score,
        compositeKey,
        timestamp: Date.now()
    });
    // Limit leaderboard size to prevent bloat
    if (leaderboard.length > 500) {
        leaderboard.shift();
    }
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));

    // 2. Update User High Score
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    if (users[username]) {
        users[username].totalGames += 1;
        if (score > (users[username].highScores[compositeKey] || 0)) {
            users[username].highScores[compositeKey] = score;
        }
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
}

/**
 * Gets the leaderboard for a specific composite key.
 * @param {string} compositeKey 
 * @returns {Array}
 */
export function getLeaderboard(compositeKey) {
    const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    return leaderboard
        .filter(entry => entry.compositeKey === compositeKey)
        .sort((a, b) => b.score - a.score || a.timestamp - b.timestamp)
        .slice(0, 10); // Top 10
}

/**
 * Records a wrong answer for a user.
 * @param {string} username 
 * @param {string} gameType 
 * @param {Object} questionDetails { a, b, answer }
 */
export function recordError(username, gameType, { a, b, answer }) {
    const learningData = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEARNING) || '{}');
    
    if (!learningData[username]) {
        learningData[username] = {};
    }
    if (!learningData[username][gameType]) {
        learningData[username][gameType] = [];
    }

    learningData[username][gameType].push({
        a,
        b,
        answer,
        timestamp: Date.now()
    });

    // Limit number of errors per game type to prevent excessive growth
    if (learningData[username][gameType].length > 50) {
        learningData[username][gameType].shift();
    }

    localStorage.setItem(STORAGE_KEYS.LEARNING, JSON.stringify(learningData));
}

/**
 * Gets the set of failed questions for a user and game type.
 * @param {string} username 
 * @param {string} gameType 
 * @returns {Array}
 */
export function getLearningPool(username, gameType) {
    const learningData = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEARNING) || '{}');
    return learningData[username]?.[gameType] || [];
}
