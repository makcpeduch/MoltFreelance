import sharp from 'sharp';

// The bot icon spans x=[2,22], y=[4,20] in a 24x24 space.
// viewBox "-2 0 28 24" adds 2 units left/right → equal 4px padding on all sides.
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="-2 0 28 24">
  <rect x="-2" y="0" width="28" height="24" rx="5" fill="#0a0614"/>
  <path d="M12 8V4H8" fill="none" stroke="#00ffff" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="4" y="8" width="16" height="12" rx="2" fill="none" stroke="#00ffff" stroke-width="1.5"/>
  <path d="M2 14h2" fill="none" stroke="#00ffff" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M20 14h2" fill="none" stroke="#00ffff" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M15 13v2" fill="none" stroke="#00ffff" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M9 13v2" fill="none" stroke="#00ffff" stroke-width="1.5" stroke-linecap="round"/>
</svg>`);

await sharp(svg).resize(64, 64).toFile('src/app/icon.png');
console.log('done');
