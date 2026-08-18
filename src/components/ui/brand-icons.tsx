/**
 * Brand marks.
 *
 * lucide-react v1 removed brand icons, and these are used only to link to the
 * corresponding platform — the conventional and permitted use of a wordmark
 * glyph. Kept as inline SVG rather than a dependency: two paths do not justify
 * an icon package, and `currentColor` lets them inherit the token system.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': true,
  focusable: false,
} as const;

export function GitHubIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M18.9 2.2h3.4l-7.4 8.5 8.7 11.5h-6.8l-5.3-7-6.1 7H2l7.9-9.1L1.6 2.2h7l4.8 6.4 5.5-6.4Zm-1.2 17.9h1.9L7.4 4.1H5.4l12.3 16Z" />
    </svg>
  );
}
