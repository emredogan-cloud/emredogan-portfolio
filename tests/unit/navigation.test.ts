import { describe, expect, it } from 'vitest';
import { navItemForPath, primaryNav, scrollSpySections } from '@/content/navigation';

describe('navItemForPath', () => {
  it('defers to the scroll-spy on the home page', () => {
    // On `/` the anchored sections exist and the spy is authoritative.
    expect(navItemForPath('/')).toBeNull();
  });

  it('marks Work as current on the index and on a case study', () => {
    // The bug this fixes: the spy had nothing to observe on these routes and
    // fell back to its first id, marking "Home" current on a case study.
    expect(navItemForPath('/work')).toBe('work');
    expect(navItemForPath('/work/pawdoc')).toBe('work');
    expect(navItemForPath('/work/evolutionary-tycoon')).toBe('work');
  });

  it('marks About as current on the about page', () => {
    expect(navItemForPath('/about')).toBe('about');
  });

  it('returns nothing for a route no nav item owns', () => {
    // Better no highlight than a wrong one.
    expect(navItemForPath('/dev/tokens')).toBeNull();
    expect(navItemForPath('/this-does-not-exist')).toBeNull();
  });

  it('only ever returns an id the navigation actually has', () => {
    const ids = new Set(primaryNav.map((item) => item.id));
    for (const path of ['/', '/work', '/work/pawdoc', '/about', '/nope']) {
      const id = navItemForPath(path);
      if (id !== null) expect(ids).toContain(id);
    }
  });
});

describe('navigation model', () => {
  it('every item points at a fragment on the home page', () => {
    for (const item of primaryNav) {
      expect(item.href).toMatch(/^\/#[a-z-]+$/);
      expect(item.href).toBe(`/#${item.id}`);
    }
  });

  it('the scroll-spy watches exactly the navigation ids, in order', () => {
    expect(scrollSpySections).toEqual(primaryNav.map((item) => item.id));
  });

  it('ids are unique', () => {
    const ids = primaryNav.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
