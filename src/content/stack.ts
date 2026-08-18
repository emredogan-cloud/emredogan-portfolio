import type { BrandIconId } from './icons.generated';

export interface StackEntry {
  readonly id: BrandIconId;
  readonly label: string;
  /**
   * Which of the projects on this site it was used in. Required, not optional:
   * a marquee of logos for technologies nobody has actually shipped anything
   * with is decoration pretending to be evidence.
   */
  readonly usedIn: readonly string[];
}

/**
 * The technology marquee.
 *
 * Every entry traces to at least one project presented on this site. Nothing
 * appears here because it looks impressive.
 */
export const stack: readonly StackEntry[] = [
  {
    id: 'typescript',
    label: 'TypeScript',
    usedIn: ['Evolutionary Tycoon', 'Ehliyet Akademi', 'Lumina', 'FormAI Web'],
  },
  { id: 'nextjs', label: 'Next.js', usedIn: ['Lumina', 'FormAI Web', 'Ehliyet Akademi'] },
  { id: 'react', label: 'React', usedIn: ['Lumina', 'FormAI Web', 'Ehliyet Akademi'] },
  { id: 'svelte', label: 'Svelte', usedIn: ['Evolutionary Tycoon'] },
  { id: 'vite', label: 'Vite', usedIn: ['Evolutionary Tycoon'] },
  { id: 'tailwind', label: 'Tailwind CSS', usedIn: ['FormAI Web', 'Lumina'] },
  { id: 'flutter', label: 'Flutter', usedIn: ['PawDoc', 'FormAI', 'Ehliyet Akademi'] },
  { id: 'dart', label: 'Dart', usedIn: ['PawDoc', 'FormAI'] },
  { id: 'kotlin', label: 'Kotlin', usedIn: ['NOVA'] },
  { id: 'python', label: 'Python', usedIn: ['PawDoc', 'Living Library'] },
  { id: 'postgres', label: 'PostgreSQL', usedIn: ['PawDoc', 'FormAI', 'Ehliyet Akademi'] },
  { id: 'supabase', label: 'Supabase', usedIn: ['PawDoc', 'FormAI'] },
  { id: 'terraform', label: 'Terraform', usedIn: ['FormAI'] },
  { id: 'vercel', label: 'Vercel', usedIn: ['Lumina', 'FormAI Web', 'Evolutionary Tycoon'] },
];
