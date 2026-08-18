import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Pill } from '@/components/ui/pill';
import { SectionHeading } from '@/components/ui/section-heading';
import { duration, ease, marquee, spring, stagger, staggerDelay } from '@/lib/motion/tokens';

/**
 * Token gallery.
 *
 * Exists instead of Storybook: one route, no extra build, no second component
 * registry to keep in sync. It is the surface the design-system visual
 * baseline is captured from, so a token change that alters any primitive shows
 * up as a diff.
 *
 * It stays reachable on production rather than being stripped from the build.
 * The roadmap said development-only; that was written before the alternative
 * became a `VERCEL_ENV` check, and Phase 1 established that Vercel's system
 * variables cannot be relied on to reach a build. A route that 404s based on a
 * variable that might be absent is worse than one that is simply public. It is
 * `noindex` here and disallowed in `robots.ts`, and a live token gallery is a
 * reasonable thing for a developer's site to expose. Deviation recorded in
 * docs/DECISIONS.md.
 */
export const metadata = { robots: { index: false, follow: false } };

const SURFACES = ['void', 'surface-1', 'surface-2', 'surface-3'] as const;
const TEXT = ['text-strong', 'text-body', 'text-muted', 'text-faint'] as const;
const BRAND = ['brand-blue', 'brand-blue-bright', 'brand-cyan', 'brand-cyan-bright'] as const;
const STATUS = ['positive', 'warning', 'danger'] as const;
const RADII = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'pill'] as const;
const TYPE = [
  ['display', 'Display'],
  ['h1', 'Heading 1'],
  ['h2', 'Heading 2'],
  ['h3', 'Heading 3'],
  ['h4', 'Heading 4'],
  ['lead', 'Lead paragraph'],
  ['body', 'Body copy'],
] as const;

function Swatch({ token, label }: { token: string; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-[var(--radius-md)] border border-[var(--color-hairline)]"
        style={{ background: `var(--color-${token})` }}
      />
      <code className="font-mono text-xs text-[var(--color-text-faint)]">{label}</code>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16" aria-labelledby={`g-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <h2
        id={`g-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase"
      >
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function TokenGallery() {
  return (
    <main id="content" className="container-content py-20">
      <h1 className="text-[length:var(--text-h1)]">Design tokens</h1>
      <p className="mt-4 max-w-2xl text-[var(--color-text-muted)]">
        Every value the site is allowed to use. Colours are derived from pixel measurements of the
        reference recording; contrast ratios are asserted in{' '}
        <code>tests/unit/contrast.test.ts</code>.
      </p>

      <Group title="Surfaces">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SURFACES.map((t) => (
            <Swatch key={t} token={t} label={`--color-${t}`} />
          ))}
        </div>
      </Group>

      <Group title="Text">
        <div className="flex flex-col gap-3">
          {TEXT.map((t) => (
            <p key={t} style={{ color: `var(--color-${t})` }}>
              The quick brown fox — Doğan, İstanbul, şeker, ağaç ·{' '}
              <code className="font-mono text-xs">--color-{t}</code>
            </p>
          ))}
        </div>
      </Group>

      <Group title="Brand">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BRAND.map((t) => (
            <Swatch key={t} token={t} label={`--color-${t}`} />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex h-16 items-center justify-center rounded-[var(--radius-md)] bg-[linear-gradient(100deg,var(--color-cta-from),var(--color-cta-to))] font-medium text-white">
            White on the CTA ramp — AA everywhere
          </div>
          <div className="flex h-16 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-hairline)] text-[length:var(--text-h3)] font-bold">
            <span className="text-gradient-brand">Gradient heading</span>
          </div>
        </div>
      </Group>

      <Group title="Status">
        <div className="grid grid-cols-3 gap-4">
          {STATUS.map((t) => (
            <Swatch key={t} token={t} label={`--color-${t}`} />
          ))}
        </div>
      </Group>

      <Group title="Typography scale">
        <div className="flex flex-col gap-4">
          {TYPE.map(([token, label]) => (
            <div key={token} className="flex flex-wrap items-baseline gap-4">
              <span style={{ fontSize: `var(--text-${token})` }} className="font-semibold">
                {label}
              </span>
              <code className="font-mono text-xs text-[var(--color-text-faint)]">
                --text-{token}
              </code>
            </div>
          ))}
          <p className="mt-2 font-mono text-sm text-[var(--color-text-muted)]">
            Mono face — 0123456789 · <span className="tabular">1,234.56</span> tabular
          </p>
        </div>
      </Group>

      <Group title="Radius">
        <div className="flex flex-wrap gap-4">
          {RADII.map((r) => (
            <div key={r} className="flex flex-col items-center gap-2">
              <div
                className="size-16 border border-[var(--color-hairline)] bg-[var(--color-surface-2)]"
                style={{ borderRadius: `var(--radius-${r})` }}
              />
              <code className="font-mono text-xs text-[var(--color-text-faint)]">{r}</code>
            </div>
          ))}
        </div>
      </Group>

      <Group title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="secondary" href="https://github.com/emredogan-cloud">
            External
          </Button>
        </div>
      </Group>

      <Group title="Pills">
        <div className="flex flex-wrap gap-3">
          <Pill>Neutral</Pill>
          <Pill tone="brand">Brand</Pill>
          <Pill tone="positive">Live</Pill>
          <Pill tone="warning">Release candidate</Pill>
          <Pill tone="danger">Archived</Pill>
          <Pill mono>TypeScript</Pill>
        </div>
      </Group>

      <Group title="Cards">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <p className="font-semibold text-[var(--color-text-strong)]">Raised</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Default container surface.
            </p>
          </Card>
          <Card surface="glass" className="p-6">
            <p className="font-semibold text-[var(--color-text-strong)]">Glass</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Backdrop blur, with an opaque fallback.
            </p>
          </Card>
          <Card surface="outline" interactive className="p-6">
            <p className="font-semibold text-[var(--color-text-strong)]">Outline · interactive</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Lifts on hover.</p>
          </Card>
        </div>
      </Group>

      <Group title="Section heading">
        <SectionHeading
          eyebrow="Selected work"
          lead="Featured"
          accent="Projects"
          description="The two-tone heading the reference uses for every section, as one component so the pattern cannot drift."
        />
      </Group>

      <Group title="Form field">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Your name" name="demo-name" required placeholder="Ada Lovelace" />
          <Field
            label="Email"
            name="demo-email"
            type="email"
            required
            error="Enter a valid email address."
          />
          <Field
            label="Message"
            name="demo-message"
            type="textarea"
            hint="What are you building?"
            className="sm:col-span-2"
          />
        </div>
      </Group>

      <Group title="Reveal">
        <p className="mb-6 max-w-2xl text-sm text-[var(--color-text-muted)]">
          Scroll-triggered entrance, staggered. Under{' '}
          <code className="font-mono">prefers-reduced-motion: reduce</code> these fade without
          moving, and the content is present in the DOM either way.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {['First', 'Second', 'Third'].map((label, i) => (
            <Reveal key={label} delay={staggerDelay(i)}>
              <Card className="p-6">
                <p className="font-semibold text-[var(--color-text-strong)]">{label}</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  Revealed at {staggerDelay(i).toFixed(2)}s.
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Group>

      <Group title="Motion tokens">
        <dl className="grid gap-x-8 gap-y-2 font-mono text-sm sm:grid-cols-2">
          {Object.entries(duration).map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between border-b border-[var(--color-hairline)] py-1"
            >
              <dt className="text-[var(--color-text-muted)]">duration.{k}</dt>
              <dd className="text-[var(--color-text-body)]">{v}s</dd>
            </div>
          ))}
          {Object.entries(stagger).map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between border-b border-[var(--color-hairline)] py-1"
            >
              <dt className="text-[var(--color-text-muted)]">stagger.{k}</dt>
              <dd className="text-[var(--color-text-body)]">{v}s</dd>
            </div>
          ))}
          <div className="flex justify-between border-b border-[var(--color-hairline)] py-1">
            <dt className="text-[var(--color-text-muted)]">ease.out</dt>
            <dd className="text-[var(--color-text-body)]">{ease.out.join(', ')}</dd>
          </div>
          <div className="flex justify-between border-b border-[var(--color-hairline)] py-1">
            <dt className="text-[var(--color-text-muted)]">spring.default</dt>
            <dd className="text-[var(--color-text-body)]">
              {spring.default.stiffness}/{spring.default.damping}
            </dd>
          </div>
          <div className="flex justify-between border-b border-[var(--color-hairline)] py-1">
            <dt className="text-[var(--color-text-muted)]">marquee.speed</dt>
            <dd className="text-[var(--color-text-body)]">{marquee.speed} px/s</dd>
          </div>
          <div className="flex justify-between border-b border-[var(--color-hairline)] py-1">
            <dt className="text-[var(--color-text-muted)]">marquee.rampSeconds</dt>
            <dd className="text-[var(--color-text-body)]">{marquee.rampSeconds}s</dd>
          </div>
        </dl>
      </Group>
    </main>
  );
}
