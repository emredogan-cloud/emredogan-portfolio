import { Pill } from '@/components/ui/pill';
import type { Project } from '@/content/schema';

/**
 * A project's maturity, ordered by how much a stranger could verify.
 *
 * The labels are deliberately unflattering where that is accurate. "Research"
 * and "In development" are not softened into "coming soon", because the whole
 * point of publishing a status is that it can be trusted.
 */
const STATUS = {
  live: { label: 'Live', tone: 'positive' },
  released: { label: 'Released', tone: 'positive' },
  'release-candidate': { label: 'Release candidate', tone: 'warning' },
  'in-development': { label: 'In development', tone: 'warning' },
  research: { label: 'Research', tone: 'neutral' },
} as const;

export function StatusPill({ status }: { status: Project['status'] }) {
  const { label, tone } = STATUS[status];
  return (
    <Pill tone={tone} className="shrink-0">
      {label}
    </Pill>
  );
}
