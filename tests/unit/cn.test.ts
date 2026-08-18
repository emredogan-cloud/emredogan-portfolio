import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils/cn';

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy values so conditional classes stay readable at the call site', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('returns an empty string when nothing applies', () => {
    expect(cn(false, undefined)).toBe('');
  });
});
