import { describe, expect, it } from 'vitest';
import { PROFILES, selectProfile, type DeviceSignals } from '@/lib/background/quality';

const capable: DeviceSignals = {
  reducedMotion: false,
  cores: 8,
  memoryGb: 16,
  saveData: false,
  finePointer: true,
  coarseViewport: false,
};

const signals = (overrides: Partial<DeviceSignals> = {}): DeviceSignals => ({
  ...capable,
  ...overrides,
});

describe('quality profile selection', () => {
  it('reduced motion produces a still field, not a slower one', () => {
    const profile = selectProfile(signals({ reducedMotion: true }));
    expect(profile.id).toBe('static');
    expect(profile.animate).toBe(false);
    expect(profile.maxMeteors).toBe(0);
    expect(profile.twinkleShare).toBe(0);
  });

  it('reduced motion outranks every other signal', () => {
    // Even the most capable machine must obey the preference.
    expect(selectProfile(signals({ reducedMotion: true, cores: 32 })).id).toBe('static');
  });

  it('Data Saver gets the still image', () => {
    // Someone who asked to save data did not ask for an animation.
    expect(selectProfile(signals({ saveData: true })).id).toBe('static');
  });

  it('a four-core device is stepped down', () => {
    const profile = selectProfile(signals({ cores: 4 }));
    expect(profile.id).toBe('low');
    expect(profile.parallax).toBe(0);
    expect(profile.twinkleShare).toBe(0);
    expect(profile.maxDpr).toBeLessThan(2);
  });

  it('low memory is stepped down', () => {
    expect(selectProfile(signals({ memoryGb: 4 })).id).toBe('low');
  });

  it('a narrow viewport is treated as a phone', () => {
    expect(selectProfile(signals({ coarseViewport: true })).id).toBe('low');
  });

  it('a missing memory reading is treated as capable, not incapable', () => {
    // Safari does not implement deviceMemory. Degrading every Safari user on
    // that basis would be worse than the occasional over-estimate.
    expect(selectProfile(signals({ memoryGb: null })).id).toBe('high');
  });

  it('touch-only devices do not get parallax even when powerful', () => {
    const profile = selectProfile(signals({ finePointer: false }));
    expect(profile.id).toBe('standard');
    expect(profile.parallax).toBe(0);
  });

  it('gives the full treatment only to a capable desktop', () => {
    const profile = selectProfile(capable);
    expect(profile.id).toBe('high');
    expect(profile.parallax).toBeGreaterThan(0);
  });

  it('every profile stays inside the budget envelope', () => {
    for (const profile of Object.values(PROFILES)) {
      expect(profile.maxDpr).toBeLessThanOrEqual(2);
      expect(profile.maxMeteors).toBeLessThanOrEqual(8);
      expect(profile.twinkleShare).toBeLessThanOrEqual(0.2);
      expect(profile.parallax).toBeLessThanOrEqual(12);
    }
  });
});
