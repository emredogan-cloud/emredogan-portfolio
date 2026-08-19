import { Brain, Cloud, Code2, Layers, Smartphone, BookOpen, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/reveal';
import { about } from '@/content/about';
import type { Capability } from '@/content/schema';
import { staggerDelay } from '@/lib/motion/tokens';

/**
 * Icon per capability kind. Keyed by the schema's `icon` enum, so adding a
 * member to the enum without an icon here is a type error rather than a blank
 * square in production.
 */
const ICONS: Record<Capability['icon'], LucideIcon> = {
  cloud: Cloud,
  brain: Brain,
  layers: Layers,
  smartphone: Smartphone,
  code: Code2,
  book: BookOpen,
};

/** What the work actually consists of, one card per area. */
export function Capabilities() {
  return (
    <ul aria-label="Capabilities" className="grid gap-4 md:grid-cols-2">
      {about.capabilities.map((capability, index) => {
        const Icon = ICONS[capability.icon];
        return (
          <Reveal key={capability.title} as="li" delay={staggerDelay(index)}>
            <Card className="flex h-full flex-col p-6 sm:p-7">
              <span
                aria-hidden
                className="grid size-11 place-items-center rounded-[var(--radius-lg)] border border-[color-mix(in_oklab,var(--color-brand-cyan)_28%,transparent)] bg-[color-mix(in_oklab,var(--color-brand-blue)_14%,transparent)] text-[var(--color-brand-cyan-bright)]"
              >
                <Icon className="size-5" />
              </span>

              <h3 className="mt-5 text-[length:var(--text-h4)]">{capability.title}</h3>
              <p className="mt-3 flex-1 text-[var(--color-text-body)]">{capability.body}</p>

              <ul
                className="mt-6 flex flex-wrap gap-2"
                aria-label={`${capability.title} technologies`}
              >
                {capability.tech.map((tech) => (
                  <li key={tech}>
                    <Pill mono>{tech}</Pill>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        );
      })}
    </ul>
  );
}
