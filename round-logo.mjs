import sharp from 'sharp';

const img = sharp('public/logo.png');
const { width, height } = await img.metadata();
const r = Math.round(width * 0.22);

const mask = Buffer.from(
    `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${r}" ry="${r}"/></svg>`
);

await img
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile('public/logo_rounded.png');

console.log('done! Saved to public/logo_rounded.png');
