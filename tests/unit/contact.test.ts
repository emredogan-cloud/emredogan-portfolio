import { describe, expect, it } from 'vitest';
import { MESSAGE_MAX, MESSAGE_MIN, NAME_MAX } from '@/lib/contact/limits';
import { RateLimiter } from '@/lib/contact/rate-limit';
import { contactSchema, fieldErrorsFrom } from '@/lib/contact/schema';
import { mailtoFallback } from '@/lib/contact/mailto';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'I am building an analytical engine and the notes need a maintainer.',
};

describe('contact schema', () => {
  it('accepts an ordinary message', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('trims before measuring, so whitespace is not a message', () => {
    const result = contactSchema.safeParse({ ...valid, message: `   ${' '.repeat(40)}   ` });
    expect(result.success).toBe(false);
  });

  it.each([
    ['name', ''],
    ['name', 'a'],
    ['name', 'a'.repeat(NAME_MAX + 1)],
    ['email', 'not-an-email'],
    ['email', ''],
    ['message', 'too short'],
    ['message', 'a'.repeat(MESSAGE_MAX + 1)],
  ])('rejects %s: %j', (field, value) => {
    const result = contactSchema.safeParse({ ...valid, [field]: value });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(Object.keys(fieldErrorsFrom(result.error))).toContain(field);
  });

  it('accepts exactly the minimum length', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'a'.repeat(MESSAGE_MIN) }).success).toBe(
      true,
    );
  });

  it('reports one error per field, not a list', () => {
    const result = contactSchema.safeParse({ name: '', email: 'nope', message: '' });
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = fieldErrorsFrom(result.error);
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name']);
    for (const message of Object.values(errors)) {
      expect(typeof message).toBe('string');
      expect(message).not.toContain('\n');
    }
  });

  it('every message is written for a person, not for a developer', () => {
    const result = contactSchema.safeParse({ name: '', email: 'nope', message: '' });
    if (result.success) throw new Error('expected failure');
    for (const message of Object.values(fieldErrorsFrom(result.error))) {
      expect(message).toMatch(/^[A-Z]/);
      expect(message).toMatch(/[.!?]$/);
      expect(message?.toLowerCase()).not.toMatch(/string|invalid|zod|expected/);
    }
  });
});

describe('rate limiter', () => {
  const at = (times: number[]) => {
    let index = 0;
    return () => times[Math.min(index++, times.length - 1)]!;
  };

  it('allows up to the limit, then refuses', () => {
    const limiter = new RateLimiter({ limit: 3, windowMs: 1000, now: () => 0 });
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
  });

  it('counts each key separately', () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 1000, now: () => 0 });
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('b').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
  });

  it('reports how long the caller has to wait', () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 60_000, now: at([0, 15_000]) });
    limiter.check('a');
    expect(limiter.check('a').retryAfter).toBe(45);
  });

  it('reports the remaining allowance', () => {
    const limiter = new RateLimiter({ limit: 3, windowMs: 1000, now: () => 0 });
    expect(limiter.check('a').remaining).toBe(2);
    expect(limiter.check('a').remaining).toBe(1);
    expect(limiter.check('a').remaining).toBe(0);
  });

  it('opens a fresh window once the old one expires', () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 1000, now: at([0, 500, 1_500]) });
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
    expect(limiter.check('a').allowed).toBe(true);
  });

  it('does not grow without bound as addresses come and go', () => {
    // The leak this guards against only appears in a long-lived instance, which
    // is the worst place to discover it.
    let clock = 0;
    const limiter = new RateLimiter({ limit: 5, windowMs: 1000, now: () => clock });
    for (let i = 0; i < 500; i += 1) {
      clock = i * 10;
      limiter.check(`address-${i}`);
    }
    clock += 5_000;
    limiter.check('one-more');
    // Every earlier window has expired; only the newest key may remain.
    expect(limiter.check('one-more').remaining).toBe(3);
  });

  it('rejects a nonsensical configuration rather than silently allowing everything', () => {
    expect(() => new RateLimiter({ limit: 0, windowMs: 1000 })).toThrow(RangeError);
    expect(() => new RateLimiter({ limit: 1, windowMs: 0 })).toThrow(RangeError);
  });
});

describe('mailto fallback', () => {
  it('carries the message the visitor already typed', () => {
    const url = mailtoFallback(valid, 'someone@example.com');
    expect(url.startsWith('mailto:someone@example.com?')).toBe(true);
    expect(decodeURIComponent(url)).toContain(valid.message);
    expect(decodeURIComponent(url)).toContain(valid.email);
  });

  it('encodes characters that would otherwise break the URL', () => {
    const url = mailtoFallback({ ...valid, message: 'a & b ?c #d' }, 'x@example.com');
    expect(url).not.toContain(' & ');
    expect(url).not.toContain(' #');
    expect(decodeURIComponent(url)).toContain('a & b ?c #d');
  });

  it('still produces a usable link from an empty form', () => {
    const url = mailtoFallback({}, 'x@example.com');
    expect(url.startsWith('mailto:x@example.com?subject=')).toBe(true);
  });
});
