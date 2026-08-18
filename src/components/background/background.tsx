import { Starfield } from './starfield';

/**
 * The background stack, furthest layer first.
 *
 * The CSS gradient is not a fallback that waits for something to fail — it is
 * always there. If the canvas never initialises, if JavaScript is off, or if
 * `getContext('2d')` returns null, the page still has a deep-space sky rather
 * than a flat black rectangle. The canvas only ever adds stars and meteors on
 * top of it.
 */
export function Background() {
  return (
    <>
      <div aria-hidden className="background-gradient" />
      <Starfield />
    </>
  );
}
