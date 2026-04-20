const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const CLEANUP_INTERVAL = 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetAt) {
            rateLimitMap.delete(key);
        }
    }
}, CLEANUP_INTERVAL);

interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

const defaultConfig: Record<string, RateLimitConfig> = {
    login: { limit: 5, windowMs: 60 * 1000 },
    generate: { limit: 10, windowMs: 60 * 1000 },
    api: { limit: 100, windowMs: 60 * 1000 },
};

export function checkRateLimit(key: string, type: keyof typeof defaultConfig = 'api'): boolean {
    const config = defaultConfig[type];
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
        return true;
    }

    if (record.count >= config.limit) {
        return false;
    }

    record.count++;
    return true;
}

export function getRateLimitReset(key: string): number {
    const record = rateLimitMap.get(key);
    return record?.resetAt || 0;
}