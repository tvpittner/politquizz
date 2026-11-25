// Bereitet die Porträts aus img/raw/ auf: img/<slug>.webp, 480×600.
// Aufruf: npm run images            (Zuschnitt nach Bildinhalt, "attention")
//         npm run images -- --north (Zuschnitt von oben, falls ein Kopf angeschnitten wird)
// Schreibt ausserdem img/manifest.json – daran erkennt das Frontend, welche Bilder es gibt.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, extname, basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rawDir = join(root, 'img', 'raw');
const outDir = join(root, 'img');
const north = process.argv.includes('--north');
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff', '.heic']);

const data = JSON.parse(await readFile(join(root, 'data.json'), 'utf8'));
const people = Object.values(data.sets).flatMap((s) => s.people);
const slugs = new Set(people.map((p) => p.slug));
const crops = JSON.parse(await readFile(join(root, 'scripts', 'crops.json'), 'utf8').catch(() => '{}'));

await mkdir(rawDir, { recursive: true });
const raw = (await readdir(rawDir)).filter((f) => EXT.has(extname(f).toLowerCase())).sort();

let failed = 0;
for (const f of raw) {
  const slug = basename(f, extname(f)).toLowerCase();
  if (!slugs.has(slug)) {
    console.warn(`  übersprungen: ${f} (kein passender Slug in data.json)`);
    continue;
  }
  try {
    let img = sharp(join(rawDir, f)).rotate(); // EXIF-Ausrichtung anwenden
    const c = crops[slug];
    if (Array.isArray(c)) {
      // Manueller Ausschnitt aus scripts/crops.json (Anteile des ausgerichteten Originals).
      const { data, info } = await img.toBuffer({ resolveWithObject: true });
      const left = Math.round(c[0] * info.width), top = Math.round(c[1] * info.height);
      img = sharp(data).extract({
        left, top,
        width: Math.min(Math.round(c[2] * info.width), info.width - left),
        height: Math.min(Math.round(c[3] * info.height), info.height - top),
      });
    }
    await img
      .resize(480, 600, { fit: 'cover', position: north ? 'north' : sharp.strategy.attention })
      .webp({ quality: 80 })
      .toFile(join(outDir, `${slug}.webp`));
    console.log(`  ok: ${f} → img/${slug}.webp`);
  } catch (e) {
    failed++;
    console.error(`  FEHLER: ${f}: ${e.message}`);
  }
}

// Manifest aus dem, was tatsächlich in img/ liegt (auch früher aufbereitete Bilder).
const have = (await readdir(outDir))
  .filter((f) => f.endsWith('.webp'))
  .map((f) => basename(f, '.webp'))
  .filter((s) => slugs.has(s))
  .sort();
await writeFile(join(outDir, 'manifest.json'), JSON.stringify(have, null, 2) + '\n');

const haveSet = new Set(have);
const noImg = people.filter((p) => !haveSet.has(p.slug));
const noCredit = people.filter((p) => haveSet.has(p.slug) && !String(p.credit || '').trim());

console.log(`\n${have.length} von ${people.length} Bildern vorhanden.`);
if (noImg.length) console.log(`Noch kein Bild: ${noImg.map((p) => p.slug).join(', ')}`);
if (noCredit.length)
  console.log(`Bild da, aber "credit" in data.json leer (wird nicht angezeigt): ${noCredit.map((p) => p.slug).join(', ')}`);
if (failed) process.exitCode = 1;
