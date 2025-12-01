"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = exports.CircuitState = void 0;
exports.withRetry = withRetry;
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000, // 1 minute
    name = 'default') {
        this.threshold = threshold;
        this.timeout = timeout;
        this.name = name;
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
    }
    async execute(fn) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttempt) {
                throw new Error(`Circuit breaker [${this.name}] is OPEN. Retry after ${new Date(this.nextAttempt).toISOString()}`);
            }
            // Transition to HALF_OPEN
            this.state = CircuitState.HALF_OPEN;
            console.log(`Circuit breaker [${this.name}] transitioning to HALF_OPEN`);
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= 2) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
                console.log(`Circuit breaker [${this.name}] closed after successful recovery`);
            }
        }
    }
    onFailure() {
        this.failureCount++;
        this.successCount = 0;
        if (this.failureCount >= this.threshold) {
            this.state = CircuitState.OPEN;
            this.nextAttempt = Date.now() + this.timeout;
            console.log(`Circuit breaker [${this.name}] opened after ${this.failureCount} failures. Will retry at ${new Date(this.nextAttempt).toISOString()}`);
        }
    }
    getState() {
        return this.state;
    }
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        console.log(`Circuit breaker [${this.name}] manually reset`);
    }
}
exports.CircuitBreaker = CircuitBreaker;
// Exponential backoff utility
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
}
