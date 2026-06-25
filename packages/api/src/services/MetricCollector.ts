import { redis } from '@apexseo/shared';

const METRIC_WINDOW = 60 * 5; // 5 minutes in seconds

export class MetricCollector {
    static async recordRequest(method: string, route: string, durationMs: number, statusCode: number) {
        const timestamp = Math.floor(Date.now() / 1000);
        const window = Math.floor(timestamp / METRIC_WINDOW) * METRIC_WINDOW;
        const key = `metrics:${window}`;

        const pipeline = redis.pipeline();

        // Count total requests
        pipeline.incr(`${key}:total`);

        // Count by status code (e.g. 2xx, 4xx, 5xx)
        const statusGroup = `${Math.floor(statusCode / 100)}xx`;
        pipeline.incr(`${key}:status:${statusGroup}`);

        // Track latency (simple average and max for MVP)
        pipeline.rpush(`${key}:latency`, durationMs);
        pipeline.expire(`${key}:latency`, 3600); // 1 hour retention

        pipeline.expire(`${key}:total`, 3600);
        pipeline.expire(`${key}:status:${statusGroup}`, 3600);

        await pipeline.exec();
    }

    static async getMetrics(windowOffset = 0) {
        const timestamp = Math.floor(Date.now() / 1000);
        const window = (Math.floor(timestamp / METRIC_WINDOW) - windowOffset) * METRIC_WINDOW;
        const key = `metrics:${window}`;

        try {
            const [total, status2xx, status4xx, status5xx, latencies] = await Promise.all([
                redis.get(`${key}:total`),
                redis.get(`${key}:status:2xx`),
                redis.get(`${key}:status:4xx`),
                redis.get(`${key}:status:5xx`),
                redis.lrange(`${key}:latency`, 0, -1)
            ]);

            const latencyValues = latencies.map(Number);
            const avgLatency = latencyValues.length ? latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length : 0;
            // Simple sort for P95 - expensive for high traffic but ok for MVP of this scale
            latencyValues.sort((a, b) => a - b);
            const p95 = latencyValues.length ? latencyValues[Math.floor(latencyValues.length * 0.95)] : 0;

            return {
                window,
                total: parseInt(total || '0'),
                status2xx: parseInt(status2xx || '0'),
                status4xx: parseInt(status4xx || '0'),
                status5xx: parseInt(status5xx || '0'),
                avgLatency: Math.round(avgLatency),
                p95Latency: p95
            };
        } catch (error) {
            console.error('Error fetching metrics', error);
            return null;
        }
    }
}
