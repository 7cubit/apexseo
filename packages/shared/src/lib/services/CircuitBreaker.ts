export enum CircuitState {
    CLOSED = 'CLOSED',
    OPEN = 'OPEN',
    HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount = 0;
    private successCount = 0;
    private nextAttempt = Date.now();
    
    constructor(
        private readonly threshold: number = 5,
        private readonly timeout: number = 60000, // 1 minute
        private readonly name: string = 'default'
    ) {}

    async execute<T>(fn: () => Promise<T>): Promise<T> {
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
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
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

    private onFailure() {
        this.failureCount++;
        this.successCount = 0;

        if (this.failureCount >= this.threshold) {
            this.state = CircuitState.OPEN;
            this.nextAttempt = Date.now() + this.timeout;
            console.log(`Circuit breaker [${this.name}] opened after ${this.failureCount} failures. Will retry at ${new Date(this.nextAttempt).toISOString()}`);
        }
    }

    getState(): CircuitState {
        return this.state;
    }

    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        console.log(`Circuit breaker [${this.name}] manually reset`);
    }
}

// Exponential backoff utility
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            
            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}
