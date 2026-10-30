// Renders build/icon.svg to build/icon.png (512) and build/icon.ico (16-256 multi-size).
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
const svg = readFileSync('build/icon.svg');
await sharp(svg).resize(512, 512).png().toFile('build/icon.png');
const sizes = [16, 24, 32, 48, 64, 128, 256];
const bufs = await Promise.all(sizes.map((s) => sharp(svg).resize(s, s).png().toBuffer()));
writeFileSync('build/icon.ico', await pngToIco(bufs));
copyFileSync('build/icon.png', 'src/renderer/public/icon.png');
console.log('icons written');
