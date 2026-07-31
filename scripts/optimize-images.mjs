import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";
import sharp from "sharp";

const imageRoot = join(process.cwd(), "public", "assets", "images");
const images = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    if (entry.isFile() && entry.name.endsWith(".webp")) images.push(file);
  }
}

walk(imageRoot);
let before = 0;
let after = 0;
for (const image of images) {
  before += statSync(image).size;
  const width = image.includes(`${sep}hero${sep}`) ? 960 : 800;
  const optimized = await sharp(readFileSync(image))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 72, smartSubsample: true })
    .toBuffer();
  writeFileSync(image, optimized);
  after += optimized.length;
}

console.log(JSON.stringify({ images: images.length, before, after, saved: before - after }, null, 2));
