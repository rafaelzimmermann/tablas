// src/logic/generators/SubtractionGenerator.js

import { BaseGenerator } from '../../BaseGenerator.js';

export class SubtractionGenerator extends BaseGenerator {
    constructor(maxFactor = 50) {
        super(maxFactor);
    }

    _generateRandomQuestion() {
        let a, b, answer, key;
        let attempts = 0;

        do {
            // Ensure a is always greater than or equal to b to avoid negative results
            a = Math.floor(Math.random() * this.maxRange) + 1;
            b = Math.floor(Math.random() * a) + 1;
            answer = a - b;
            key = this._createQuestionKey(a, b);
            attempts++;
        } while (this.history.has(key) && attempts < 50);

        this.history.add(key);
        return { a, b, answer };
    }
}
