// src/logic/generators/DivisionGenerator.js

import { BaseGenerator } from '../../BaseGenerator.js';

export class DivisionGenerator extends BaseGenerator {
    constructor(maxFactor = 12) {
        super(maxFactor);
    }

    _generateRandomQuestion() {
        let a, b, answer, key;
        let attempts = 0;

        do {
            // To ensure integer division:
            // Pick b and answer, then calculate a = b * answer
            b = Math.floor(Math.random() * this.maxRange) + 1;
            answer = Math.floor(Math.random() * this.maxRange) + 1;
            a = b * answer;
            
            // We want to avoid extremely large 'a' if we use maxRange for b and answer
            // If we want 'a' to be within some range, we might need to adjust.
            // But for math speed, having a large dividend is fine as long as it's divisible.
            
            key = this._createQuestionKey(a, b);
            attempts++;
        } while (this.history.has(key) && attempts < 50);

        this.history.add(key);
        return { a, b, answer };
    }
}
