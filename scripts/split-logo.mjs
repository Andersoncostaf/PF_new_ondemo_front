import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const src = process.argv[2];
const outDir = process.argv[3];

if (!src || !outDir) {
  console.error('Usage: node split-logo.mjs <source.png> <outDir>');
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

const meta = await sharp(src).metadata();
const midX = Math.floor((meta.width ?? 0) / 2);
const midY = Math.floor((meta.height ?? 0) / 2);

async function crop(name, left, top, width, height) {
  const dest = path.join(outDir, name);
  await sharp(src).extract({ left, top, width, height }).png().toFile(dest);
  console.log('wrote', dest);
}

await crop('logo-horizontal.png', 10, 10, 620, 265);
await crop('logo-monochrome.png', 36, midY + 36, midX - 72, (meta.height ?? 0) - midY - 72);
await crop('logo-inverted.png', midX + 36, midY + 36, midX - 72, (meta.height ?? 0) - midY - 72);
await crop('logo-icon.png', midX + 100, 8, 320, midY - 10);

const iconPath = path.join(outDir, 'logo-icon.png');
await sharp(iconPath).resize(32, 32).png().toFile(path.join(outDir, 'favicon-32.png'));
await sharp(iconPath).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'));

await copyFile(src, path.join(outDir, 'logo-sheet-original.png'));
console.log('done');
