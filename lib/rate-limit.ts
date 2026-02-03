// Simple in-memory rate limiter
// For production, use Redis-based solution like Upstash

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 60000); // Clean every minute

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number;
}

export function rateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    if (!entry || now > entry.resetTime) {
        // New window
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            success: true,
            remaining: limit - 1,
            resetIn: windowMs,
        };
    }

    if (entry.count >= limit) {
        // Rate limited
        return {
            success: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
        };
    }

    // Increment count
    entry.count++;
    return {
        success: true,
        remaining: limit - entry.count,
        resetIn: entry.resetTime - now,
    };
}
