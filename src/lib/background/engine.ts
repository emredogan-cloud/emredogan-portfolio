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
  readonly canvas: HTMLCanvasElement;
  readonly profile: QualityProfile;
  readonly seed: number;
  /** Fixes the clock so a frame is byte-identical between runs. */
  readonly fixedTime?: number;
}

export interface Engine {
  /** Re-reads the element size and redraws. Cheap enough for a resize observer. */
  resize(): void;
  start(): void;
  stop(): void;
  /** Pointer position in CSS px, or null to release the parallax. */
  setPointer(x: number | null, y: number | null): void;
  destroy(): void;
  readonly isRunning: boolean;
}

const STAR_COLOUR = '#ffffff';

/**
 * The background renderer.
 *
 * Three decisions carry the performance budget:
 *
 *  1. **The star field is rasterised once** into an offscreen canvas and
 *     blitted each frame. Thousands of `arc()` calls per frame would dominate
 *     the frame budget; one `drawImage` does not. Only the small twinkling
 *     subset is drawn live on top.
 *  2. **Meteors come from a fixed pool**, so a long session allocates nothing
 *     and the garbage collector never interrupts a frame.
 *  3. **Device pixel ratio is capped.** Above 2 the fill cost quadruples for a
 *     difference nobody can see on a starfield.
 *
 * The loop is delta-timed, so a dropped frame changes nothing about where a
 * meteor is — only how smoothly it got there.
 */
export function createEngine({ canvas, profile, seed, fixedTime }: EngineOptions): Engine {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    // No 2D context: the CSS gradient underneath is the whole background.
    return {
      resize: () => {},
      start: () => {},
      stop: () => {},
      setPointer: () => {},
      destroy: () => {},
      isRunning: false,
    };
  }

  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars: Star[] = [];
  let twinklers: Star[] = [];
  let field: HTMLCanvasElement | null = null;

  const pool = createMeteorPool(profile.maxMeteors);
  const rng = createRng(seed ^ 0x9e3779b9);

  let frame = 0;
  let running = false;
  let lastTime = 0;
  let elapsed = 0;
  let spawnIn = nextSpawnDelay(profile, rng);

  let pointerX: number | null = null;
  let pointerY: number | null = null;
  let parallaxX = 0;
  let parallaxY = 0;

  function rasteriseField() {
    if (width === 0 || height === 0) return;

    const buffer = document.createElement('canvas');
    buffer.width = Math.ceil(width * dpr);
    buffer.height = Math.ceil(height * dpr);
    const bufferContext = buffer.getContext('2d');
    if (!bufferContext) return;

    bufferContext.scale(dpr, dpr);
    bufferContext.fillStyle = STAR_COLOUR;

    for (const star of stars) {
      if (star.phase !== null) continue; // drawn live
      bufferContext.globalAlpha = star.alpha;
      bufferContext.beginPath();
      bufferContext.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
      bufferContext.fill();
    }

    field = buffer;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const nextDpr = Math.min(window.devicePixelRatio || 1, profile.maxDpr);
    if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;

    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;

    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    context!.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = generateStars(starCountFor(width, height, profile), profile, seed);
    twinklers = stars.filter((star) => star.phase !== null);
    rasteriseField();
    draw(0);
  }

  function drawMeteor(meteor: Meteor) {
    const opacity = meteorOpacity(meteor);
    if (opacity <= 0) return;

    const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
    const tailX = meteor.x - (meteor.vx / speed) * meteor.length;
    const tailY = meteor.y - (meteor.vy / speed) * meteor.length;

    const gradient = context!.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, `rgba(255,255,255,${opacity})`);

    context!.save();
    context!.strokeStyle = gradient;
    context!.lineWidth = meteor.thickness;
    context!.lineCap = 'round';
    context!.beginPath();
    context!.moveTo(tailX, tailY);
    context!.lineTo(meteor.x, meteor.y);
    context!.stroke();

    // The bright head. Cheaper and crisper than a shadowBlur on the whole line.
    context!.globalAlpha = opacity;
    context!.fillStyle = STAR_COLOUR;
    context!.beginPath();
    context!.arc(meteor.x, meteor.y, meteor.thickness * 0.85, 0, Math.PI * 2);
    context!.fill();
    context!.restore();
  }

  function draw(seconds: number) {
    context!.clearRect(0, 0, width, height);

    if (field) {
      context!.globalAlpha = 1;
      context!.drawImage(field, parallaxX, parallaxY, width, height);
    }

    context!.fillStyle = STAR_COLOUR;
    for (const star of twinklers) {
      context!.globalAlpha = Math.min(1, star.alpha * twinkleFactor(star, seconds));
      context!.beginPath();
      context!.arc(
        star.x * width + parallaxX,
        star.y * height + parallaxY,
        star.radius,
        0,
        Math.PI * 2,
      );
      context!.fill();
    }

    context!.globalAlpha = 1;
    for (const meteor of pool) {
      if (meteor.active) drawMeteor(meteor);
    }
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
      // Critically damped enough to feel like weight rather than lag.
      parallaxX += (targetX - parallaxX) * 0.06;
      parallaxY += (targetY - parallaxY) * 0.06;
    }

    spawnIn -= delta;
    if (spawnIn <= 0) {
      spawnMeteor(pool, width, height, rng);
      spawnIn = nextSpawnDelay(profile, rng);
    }

    stepMeteors(pool, delta, width, height);
    draw(elapsed);
  }

  return {
    resize,
    start() {
      if (running || !profile.animate) {
        // The still profile still needs its single frame.
        if (!profile.animate) draw(fixedTime ?? 0);
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
      field = null;
      stars = [];
      twinklers = [];
    },
    get isRunning() {
      return running;
    },
  };
}
