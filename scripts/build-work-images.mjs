#!/usr/bin/env node
/**
 * Builds the project cover images in `public/work/`.
 *
 * Sources are real captures — three live sites screenshotted in a browser, and
 * two device screenshots taken from the apps themselves. Nothing here is a
 * mock-up of a product that does not exist; where no capture is possible the
 * project uses a generated cover instead and says so via its `capture` tier.
 *
 * Portrait phone captures are composed onto a landscape canvas rather than
 * cropped: cropping a phone screenshot to 16:10 throws away the screen.
 *
 * Output is JPEG. `next/image` re-encodes to AVIF/WebP per request, so the
 * checked-in format only needs to be a good source, and the served size is what
 * the performance budget measures.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = join(import.meta.dirname, '..');
const OUT = join(ROOT, 'public/work');
const WIDTH = 1600;
const HEIGHT = 1000;

mkdirSync(OUT, { recursive: true });

/** Live-site captures: crop to the card's aspect ratio from the top. */
const WEB = ['evolutionary-tycoon', 'formai-web', 'ehliyet-akademi'];

/** Device captures composed onto a canvas. */
const DEVICE = [
  {
    slug: 'pawdoc',
    source: '/home/emre/Downloads/PawDoc/new-interface/ai_analysis_result_emergency.png',
    tint: { r: 24, g: 10, b: 12 },
  },
  {
    slug: 'formai',
    source:
      '/home/emre/Downloads/FormAI-FitnessKoçu/asosystem/aso_example_screenshots/Screenshot_2026-05-08-20-45-01-993_com.emredogan.formaifit.jpg',
    tint: { r: 14, g: 12, b: 26 },
  },
];

async function buildWeb(slug) {
  const source = join(OUT, `${slug}.png`);
  if (!existsSync(source)) {
    console.warn(`skip ${slug}: no capture at ${source}`);
    return;
  }
  await sharp(source)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'top' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(OUT, `${slug}.jpg`));
  console.log(`web    ${slug}.jpg`);
}

async function buildDevice({ slug, source, tint }) {
  if (!existsSync(source)) {
    console.warn(`skip ${slug}: no capture at ${source}`);
    return;
  }

  // The phone fills most of the canvas height, leaving room to breathe.
  const phoneHeight = Math.round(HEIGHT * 0.88);

  // Resize first, then read the result's width. Phone captures are not all the
  // same aspect ratio — one source is 9:19.5 and another 9:20.07 — so a mask
  // sized from an assumed ratio is a few pixels wrong and sharp rejects the
  // composite outright.
  const resized = await sharp(source).resize({ height: phoneHeight }).png().toBuffer();
  const { width: phoneWidth = 0 } = await sharp(resized).metadata();

  const phone = await sharp(resized)
    .composite([
      {
        // Rounded corners, so the capture reads as a device rather than a
        // rectangle pasted on a background.
        input: Buffer.from(
          `<svg width="${phoneWidth}" height="${phoneHeight}">
             <rect width="100%" height="100%" rx="34" ry="34" fill="#fff"/>
           </svg>`,
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 3, background: tint },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${WIDTH}" height="${HEIGHT}">
             <defs>
               <radialGradient id="a" cx="30%" cy="20%" r="70%">
                 <stop offset="0%" stop-color="#1D6FF2" stop-opacity="0.34"/>
                 <stop offset="100%" stop-color="#1D6FF2" stop-opacity="0"/>
               </radialGradient>
               <radialGradient id="b" cx="78%" cy="88%" r="60%">
                 <stop offset="0%" stop-color="#22D3EE" stop-opacity="0.22"/>
                 <stop offset="100%" stop-color="#22D3EE" stop-opacity="0"/>
               </radialGradient>
             </defs>
             <rect width="100%" height="100%" fill="url(#a)"/>
             <rect width="100%" height="100%" fill="url(#b)"/>
           </svg>`,
        ),
        blend: 'over',
      },
      {
        input: phone,
        left: Math.round((WIDTH - phoneWidth) / 2),
        top: Math.round((HEIGHT - phoneHeight) / 2),
      },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(join(OUT, `${slug}.jpg`));

  console.log(`device ${slug}.jpg`);
}

for (const slug of WEB) await buildWeb(slug);
for (const entry of DEVICE) await buildDevice(entry);
