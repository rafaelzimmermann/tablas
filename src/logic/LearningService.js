// src/logic/LearningService.js

import { recordError, getLearningPool } from '../data.js';

/**
 * Service to handle recording and retrieving learning data (failed questions).
 */
export class LearningService {
    /**
     * Records a failed question for a user.
     * @param {string} username 
     * @param {string} gameType 
     * @param {Object} questionData { a, b, answer }
     */
    static recordFailure(username, gameType, questionData) {
        recordError(username, gameType, questionData);
    }

    /**
     * Gets the pool of questions to be used for learning reinforcement.
     * @param {string} username 
     * @param {string} gameType 
     * @returns {Array}
     */
    static getPool(username, gameType) {
        return getLearningPool(username, gameType);
    }
}
