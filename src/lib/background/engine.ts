import { createRng } from './rng';
import type { QualityProfile } from './quality';
import {
  createMeteorPool,
  meteorOpacity,
  nextSpawnDelay,
  spawnMeteor,
  stepMeteors,
  type Meteor,
} from './meteors';
import { generateStars, starCountFor, twinkleFactor, type Star } from './stars';

export interface EngineOptions {
  /** Painted once per resize. Never touched inside the animation loop. */
  readonly staticCanvas: HTMLCanvasElement;
  /** Cleared and redrawn every frame. Only twinklers and meteors live here. */
  readonly liveCanvas: HTMLCanvasElement;
  readonly profile: QualityProfile;
  readonly seed: number;
}

export interface Engine {
  resize(): void;
  start(): void;
  stop(): void;
  setPointer(x: number | null, y: number | null): void;
  destroy(): void;
  readonly isRunning: boolean;
  /** Frames drawn since construction. Mirrored onto `data-frame` for tests. */
  readonly renderedFrames: number;
}

const STAR_COLOUR = '#ffffff';

/**
 * The background renderer.
 *
 * **Two canvases, and that is the whole performance story.**
 *
 * The first version drew everything into one canvas: clear, blit the whole
 * rasterised star field, then draw the handful of moving things on top. That
 * is fine with a GPU and disastrous without one. Measured on a software-
 * rendered runner it took the page from 44.5 fps to 9.4 — the per-frame cost
 * was not the meteors, it was clearing and re-blitting a full-viewport bitmap
 * sixty times a second to redraw a sky that had not changed.
 *
 * So the sky does not live in the animated canvas any more. It is painted once
 * into its own element on resize and then left completely alone; parallax moves
 * it with a CSS transform, which is compositor work, not raster work. The
 * animated canvas holds only the twinkling minority of stars and the live
 * meteors, so a frame clears and draws a few dozen small shapes.
 *
 * The rest:
 *
 *  - **Meteors come from a fixed pool**, so a long session allocates nothing
 *    and the garbage collector never interrupts a frame.
 *  - **Device pixel ratio is capped at 2.** Above that the fill cost
 *    quadruples for a difference nobody can see on a starfield.
 *  - **The loop is delta-timed and clamped**, so a dropped frame changes how
 *    smoothly a meteor moved, not where it is.
 */
export function createEngine({ staticCanvas, liveCanvas, profile, seed }: EngineOptions): Engine {
  const staticContext = staticCanvas.getContext('2d');
  const liveContext = liveCanvas.getContext('2d');

  if (!staticContext || !liveContext) {
    // No 2D context: the CSS gradient underneath is the whole background.
    return {
      resize: () => {},
      start: () => {},
      stop: () => {},
      setPointer: () => {},
      destroy: () => {},
      isRunning: false,
      renderedFrames: 0,
    };
  }

  let width = 0;
  let height = 0;
  let dpr = 1;
  let twinklers: Star[] = [];

  const pool = createMeteorPool(profile.maxMeteors);
  const rng = createRng(seed ^ 0x9e3779b9);

  let frame = 0;
  let renderedFrames = 0;
  let running = false;
  let lastTime = 0;
  let elapsed = 0;
  let spawnIn = nextSpawnDelay(profile, rng);

  let pointerX: number | null = null;
  let pointerY: number | null = null;
  let parallaxX = 0;
  let parallaxY = 0;

  function paintStaticField(stars: readonly Star[]) {
    staticContext!.clearRect(0, 0, width, height);
    staticContext!.fillStyle = STAR_COLOUR;
    for (const star of stars) {
      if (star.phase !== null) continue; // drawn live instead
      staticContext!.globalAlpha = star.alpha;
      staticContext!.beginPath();
      staticContext!.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
      staticContext!.fill();
    }
    staticContext!.globalAlpha = 1;
  }

  function resize() {
    const rect = liveCanvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const nextDpr = Math.min(window.devicePixelRatio || 1, profile.maxDpr);
    if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;

    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;

    for (const [canvas, context] of [
      [staticCanvas, staticContext!],
      [liveCanvas, liveContext!],
    ] as const) {
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const stars = generateStars(starCountFor(width, height, profile), profile, seed);
    twinklers = stars.filter((star) => star.phase !== null);
    paintStaticField(stars);
    drawLive(0);
  }

  function drawMeteor(meteor: Meteor) {
    const opacity = meteorOpacity(meteor);
    if (opacity <= 0) return;

    const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
    const tailX = meteor.x - (meteor.vx / speed) * meteor.length;
    const tailY = meteor.y - (meteor.vy / speed) * meteor.length;

    const gradient = liveContext!.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, `rgba(255,255,255,${opacity})`);

    liveContext!.strokeStyle = gradient;
    liveContext!.lineWidth = meteor.thickness;
    liveContext!.lineCap = 'round';
    liveContext!.beginPath();
    liveContext!.moveTo(tailX, tailY);
    liveContext!.lineTo(meteor.x, meteor.y);
    liveContext!.stroke();

    // The bright head. Cheaper and crisper than a shadowBlur on the whole line.
    liveContext!.globalAlpha = opacity;
    liveContext!.fillStyle = STAR_COLOUR;
    liveContext!.beginPath();
    liveContext!.arc(meteor.x, meteor.y, meteor.thickness * 0.85, 0, Math.PI * 2);
    liveContext!.fill();
    liveContext!.globalAlpha = 1;
  }

  function drawLive(seconds: number) {
    liveContext!.clearRect(0, 0, width, height);

    liveContext!.fillStyle = STAR_COLOUR;
    for (const star of twinklers) {
      liveContext!.globalAlpha = Math.min(1, star.alpha * twinkleFactor(star, seconds));
      liveContext!.beginPath();
      liveContext!.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
      liveContext!.fill();
    }
    liveContext!.globalAlpha = 1;

    for (const meteor of pool) {
      if (meteor.active) drawMeteor(meteor);
    }
  }

  /** Parallax is a compositor transform on both layers — never a repaint. */
  function applyParallax() {
    const transform = `translate3d(${parallaxX.toFixed(2)}px, ${parallaxY.toFixed(2)}px, 0)`;
    staticCanvas.style.transform = transform;
    liveCanvas.style.transform = transform;
  }

  function tick(now: number) {
    frame = requestAnimationFrame(tick);

    // Clamp the delta so a backgrounded tab does not resume by teleporting
    // every meteor across the screen in one frame.
    const delta = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    elapsed += delta;

    if (profile.parallax > 0) {
      const targetX = pointerX === null ? 0 : ((pointerX / width) * 2 - 1) * -profile.parallax;
      const targetY = pointerY === null ? 0 : ((pointerY / height) * 2 - 1) * -profile.parallax;
      const nextX = parallaxX + (targetX - parallaxX) * 0.06;
      const nextY = parallaxY + (targetY - parallaxY) * 0.06;
      // Skip the style write when the movement is sub-pixel.
      if (Math.abs(nextX - parallaxX) > 0.01 || Math.abs(nextY - parallaxY) > 0.01) {
        parallaxX = nextX;
        parallaxY = nextY;
        applyParallax();
      }
    }

    spawnIn -= delta;
    if (spawnIn <= 0) {
      spawnMeteor(pool, width, height, rng);
      spawnIn = nextSpawnDelay(profile, rng);
    }

    stepMeteors(pool, delta, width, height);
    drawLive(elapsed);

    // Publish liveness roughly twice a second.
    //
    // Comparing canvas pixels is the obvious way to check "is the loop
    // running", and it does not survive contact with three engines: WebKit's
    // `toDataURL` did not reflect changes, and on the `low` profile there are
    // no twinkling stars, so between meteors the layer is legitimately blank.
    // A counter answers the actual question — the loop advanced — in a way
    // every engine agrees on. Written every 30 frames rather than every frame
    // so the loop is not doing DOM work sixty times a second.
    renderedFrames += 1;
    if (renderedFrames % 30 === 0) {
      liveCanvas.dataset['frame'] = String(renderedFrames);
    }
  }

  return {
    resize,
    start() {
      if (running) return;
      if (!profile.animate) {
        // The still profile keeps its single already-painted frame.
        return;
      }
      running = true;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    },
    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },
    destroy() {
      this.stop();
      twinklers = [];
    },
    get renderedFrames() {
      return renderedFrames;
    },
    get isRunning() {
      return running;
    },
  };
}
