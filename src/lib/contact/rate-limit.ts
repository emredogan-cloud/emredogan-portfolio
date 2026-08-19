/**
 * A fixed-window rate limiter, in memory.
 *
 * **What this is honestly worth.** The instance memory of a serverless function
 * is not shared, so a determined sender who lands on a fresh instance gets a
 * fresh window. This is a speed bump for casual abuse and accidental
 * double-submits, not a security control, and it is written down here rather
 * than implied. A durable limiter (Upstash Redis, per the roadmap) is a
 * dependency and an account this project does not have yet; when it does, only
 * `check` changes.
 *
 * Fixed window rather than sliding: a sliding window needs to retain every
 * timestamp per key, and the failure mode of a fixed window — a burst allowed
 * across a boundary — is exactly the case this does not need to be strict
 * about.
 *
 * Kept free of any Next.js or platform import so it is directly unit-testable
 * with an injected clock.
 */

export interface RateLimitResult {
  readonly allowed: boolean;
  /** How many requests remain in the current window. */
  readonly remaining: number;
  /** Seconds until the window resets. `0` when the request was allowed. */
  readonly retryAfter: number;
}

interface Window {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  /** Requests permitted per window. */
  readonly limit: number;
  /** Window length in milliseconds. */
  readonly windowMs: number;
  /** Injectable so tests do not sleep. */
  readonly now?: () => number;
}

export class RateLimiter {
  readonly #windows = new Map<string, Window>();
  readonly #limit: number;
  readonly #windowMs: number;
  readonly #now: () => number;

  constructor({ limit, windowMs, now = Date.now }: RateLimiterOptions) {
    if (limit < 1) throw new RangeError('limit must be at least 1');
    if (windowMs < 1) throw new RangeError('windowMs must be positive');
    this.#limit = limit;
    this.#windowMs = windowMs;
    this.#now = now;
  }

  check(key: string): RateLimitResult {
    const now = this.#now();
    this.#evictExpired(now);

    const existing = this.#windows.get(key);
    if (!existing || existing.resetAt <= now) {
      this.#windows.set(key, { count: 1, resetAt: now + this.#windowMs });
      return { allowed: true, remaining: this.#limit - 1, retryAfter: 0 };
    }

    if (existing.count >= this.#limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.ceil((existing.resetAt - now) / 1000),
      };
    }

    existing.count += 1;
    return { allowed: true, remaining: this.#limit - existing.count, retryAfter: 0 };
  }

  /**
   * Drops finished windows.
   *
   * Without this the map grows once per distinct address for the life of the
   * instance — a slow leak that only shows up in production, which is the worst
   * place to find it.
   */
  #evictExpired(now: number): void {
    for (const [key, window] of this.#windows) {
      if (window.resetAt <= now) this.#windows.delete(key);
    }
  }

  /** Test seam. Never called by the action. */
  reset(): void {
    this.#windows.clear();
  }
}
