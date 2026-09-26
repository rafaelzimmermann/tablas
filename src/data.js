// src/data.js

/**
 * Data Access Layer for Multiplication Speed Math Game
 * Uses localStorage for persistence.
 * 
 * Schema:
 * 'math_game_users': { [username]: { totalGames: number, highScores: { bullet: number, blitz: number, rapid: number } } }
 * 'math_game_leaderboard': [ { username: string, score: number, mode: string, timestamp: number }, ... ]
 */

const STORAGE_KEYS = {
    USERS: 'math_game_users',
    LEADERBOARD: 'math_game_leaderboard'
};

const MODES = {
    BULLET: 'bullet',
    BLITZ: 'blitz',
    RAPID: 'rapid'
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
            highScores: {
                [MODES.BULLET]: 0,
                [MODES.BLITZ]: 0,
                [MODES.RAPID]: 0
            }
        };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
}

/**
 * Saves a score to the leaderboard and updates user's high score.
 * @param {string} username 
 * @param {number} score 
 * @param {string} mode 
 */
export function saveScore(username, score, mode) {
    // 1. Update Leaderboard
    const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    leaderboard.push({
        username,
        score,
        mode,
        timestamp: Date.now()
    });
    // Limit leaderboard size to prevent bloat
    if (leaderboard.length > 100) {
        leaderboard.shift();
    }
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));

    // 2. Update User High Score
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    if (users[username]) {
        users[username].totalGames += 1;
        if (score > users[username].highScores[mode]) {
            users[username].highScores[mode] = score;
        }
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
}

/**
 * Gets the leaderboard for a specific mode, sorted by score descending.
 * @param {string} mode 
 * @returns {Array}
 */
export function getLeaderboard(mode) {
    const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    return leaderboard
        .filter(entry => entry.mode === mode)
        .sort((a, b) => b.score - a.score || a.timestamp - b.timestamp)
        .slice(0, 10); // Top 10
}
