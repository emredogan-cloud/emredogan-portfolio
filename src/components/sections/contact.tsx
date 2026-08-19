import { Clock, Mail, MapPin } from 'lucide-react';
import { Section } from '@/components/layout/section';
import { ContactForm } from '@/components/contact/contact-form';
import { CopyButton } from '@/components/contact/copy-button';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { site } from '@/content/site';

/**
 * The conversion point — the reason the site exists.
 *
 * Two columns: three facts on the left, the form on the right. The reference
 * puts a phone number in this position; there is no published phone number, so
 * the third card is the working timezone instead of an invented one.
 */
export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-heading" glow="center-blue">
      <div className="container-content">
        <Reveal>
          <SectionHeading
            id="contact-heading"
            eyebrow="Contact"
            lead="Let's build"
            accent="something"
            description="Freelance work, collaboration, or a full-time role — if you are building something where correctness matters, I would like to hear about it."
          />
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* `min-w-0` on the column, not only on the grid.
              A grid item's automatic minimum size is its content's min-content
              width, and the email address is `truncate`d — which means
              `white-space: nowrap`, which means its min-content is the whole
              address. At 320 px that pushed this column to 330 px inside a
              280 px grid area and gave the entire document a horizontal
              scrollbar. `minmax(0, …)` on the template fixes the *track*; the
              item needs telling separately. */}
          <div className="flex min-w-0 flex-col gap-4">
            <Reveal>
              <Card className="flex items-start gap-4 p-5">
                <Icon>
                  <Mail aria-hidden className="size-5" />
                </Icon>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--color-text-faint)]">Email</p>
                  <a
                    href={`mailto:${site.email}`}
                    className="mt-0.5 flex min-h-11 items-center truncate font-medium text-[var(--color-text-strong)] underline-offset-4 hover:underline"
                  >
                    {site.email}
                  </a>
                </div>
                <CopyButton value={site.email} label="email address" />
              </Card>
            </Reveal>

            <Reveal delay={0.07}>
              <Card className="flex items-start gap-4 p-5">
                <Icon>
                  <MapPin aria-hidden className="size-5" />
                </Icon>
                <div>
                  <p className="text-sm text-[var(--color-text-faint)]">Based in</p>
                  <p className="mt-1 font-medium text-[var(--color-text-strong)]">
                    {site.location}
                  </p>
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.14}>
              <Card className="flex items-start gap-4 p-5">
                <Icon>
                  <Clock aria-hidden className="size-5" />
                </Icon>
                <div>
                  <p className="text-sm text-[var(--color-text-faint)]">Working hours</p>
                  <p className="mt-1 font-medium text-[var(--color-text-strong)]">
                    {site.timezone}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Remote, and comfortable across European and Middle Eastern hours.
                  </p>
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.21}>
              <ul className="mt-2 flex flex-col gap-1">
                {site.socials
                  .filter((social) => social.icon !== 'mail')
                  .map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center text-sm text-[var(--color-text-muted)] underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text-strong)] hover:underline"
                      >
                        {social.label} — {social.handle}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.07}>
            <Card className="p-6 sm:p-8">
              <h3 className="text-[length:var(--text-h4)]">Send me a message</h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Three fields. It goes straight to my inbox — nothing else happens to it.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[color-mix(in_oklab,var(--color-brand-cyan)_26%,transparent)] bg-[color-mix(in_oklab,var(--color-brand-blue)_14%,transparent)] text-[var(--color-brand-cyan-bright)]">
      {children}
    </span>
  );
}
