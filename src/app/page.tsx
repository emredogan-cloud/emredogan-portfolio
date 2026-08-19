import { About } from '@/components/sections/about';
import { Contact } from '@/components/sections/contact';
import { CtaBand } from '@/components/sections/cta-band';
import { Hero } from '@/components/sections/hero';
import { Proof } from '@/components/sections/proof';
import { TechMarquee } from '@/components/sections/tech-marquee';
import { Work } from '@/components/sections/work';

/**
 * The single-page experience.
 *
 * The order is the order a stranger needs: who, what with, what shipped, why
 * any of it should be believed, and how to start a conversation. Every section
 * is a landmark with a name, and every anchor in the navigation resolves to one
 * of them.
 */
export default function HomePage() {
  return (
    <main id="content">
      <Hero />

      <TechMarquee />

      <About />

      <Work />

      <Proof />

      <CtaBand />

      <Contact />
    </main>
  );
}
