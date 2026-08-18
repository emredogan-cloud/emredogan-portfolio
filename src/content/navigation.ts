/**
 * Navigation model.
 *
 * The home page is one document with anchored sections, mirroring the
 * reference. `id` doubles as the scroll-spy target and the anchor fragment, so
 * a section rendered without a matching entry here simply never highlights —
 * rather than the two lists drifting apart silently.
 */
export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

export const primaryNav: readonly NavItem[] = [
  { id: 'home', label: 'Home', href: '/#home' },
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'work', label: 'Work', href: '/#work' },
  { id: 'contact', label: 'Contact', href: '/#contact' },
];

/** Sections the scroll-spy observes, in document order. */
export const scrollSpySections: readonly string[] = primaryNav.map((item) => item.id);

export const footerNav = {
  navigate: primaryNav,
  more: [
    { id: 'all-work', label: 'All projects', href: '/work' },
    { id: 'about-page', label: 'About & experience', href: '/about' },
  ],
} as const;
