import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const src = process.argv[2];
const out = process.argv[3];

if (!src || !out) {
  console.error('Usage: node chroma-mascot.mjs <src.png> <out.png>');
  process.exit(1);
}

await mkdir(path.dirname(out), { recursive: true });

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

/** Pure screen green only — preserve brand green nodes (~#22C55E). */
function chromaAlpha(r, g, b) {
  const maxRB = Math.max(r, b);
  const greenLead = g - maxRB;
  // Bright lime screen: very high G, low R/B
  if (g > 200 && r < 140 && b < 140 && greenLead > 80) {
    return 0;
  }
  if (g > 170 && r < 110 && b < 110 && greenLead > 100) {
    return 0;
  }
  // Soft fringe only on near-pure greens
  if (g > 160 && r < 130 && b < 130 && greenLead > 70) {
    return Math.max(0, Math.min(255, Math.round(255 - (greenLead - 70) * 4)));
  }
  return 255;
}

for (let i = 0; i < data.length; i += 4) {
  data[i + 3] = chromaAlpha(data[i], data[i + 1], data[i + 2]);
}

const transparent = await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toBuffer();

await sharp(transparent).trim({ threshold: 8 }).png().toFile(out);
console.log('wrote', out);
