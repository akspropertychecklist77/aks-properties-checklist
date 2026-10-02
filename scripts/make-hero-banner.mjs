import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateHeroBanner() {
  const bannerWidth = 1100;
  const bannerHeight = 540;
  const bg = { r: 248, g: 239, b: 230, alpha: 1 }; // #f8efe6

  // 1. Prepare Perfect Circle Wheel (from test_perfect_circle_disc.webp)
  const wheelPath = 'C:/Users/Velli/.gemini/antigravity/brain/39330a83-c8ae-49ce-aaa9-9262acdb3b51/scratch/test_perfect_circle_disc.webp';
  const wheelResized = await sharp(wheelPath)
    .resize(500, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // 2. High-precision SVG text matching exact typography
  const textSvg = `
    <svg width="520" height="460" xmlns="http://www.w3.org/2000/svg">
      <style>
        .small-title { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 30px; font-weight: 800; fill: #1e293b; letter-spacing: -0.5px; }
        .big-bold { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 52px; font-weight: 900; fill: #0f172a; letter-spacing: -1.5px; line-height: 1.05; }
        .highlight { fill: #d97706; }
        .sub-accent { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 31px; font-weight: 900; fill: #0f172a; letter-spacing: -0.8px; }
        .time-text { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 36px; font-weight: 800; fill: #334155; letter-spacing: -0.5px; }
      </style>
      
      <text x="0" y="65" class="small-title">WANT TO</text>
      <text x="0" y="135" class="big-bold">PROTECT &amp;</text>
      <text x="0" y="205" class="big-bold highlight">DOUBLE</text>
      <text x="0" y="278" class="sub-accent">YOUR PROPERTY VALUE</text>
      <text x="0" y="348" class="time-text">IN RECORD TIME?</text>
    </svg>
  `;

  const textBuffer = Buffer.from(textSvg);

  // 3. Composite into hero-banner-full.webp
  await sharp({
    create: {
      width: bannerWidth,
      height: bannerHeight,
      channels: 4,
      background: bg
    }
  })
  .composite([
    {
      input: textBuffer,
      left: 70,
      top: 55
    },
    {
      input: wheelResized,
      left: 550,
      top: Math.round((bannerHeight - 500) / 2)
    }
  ])
  .webp({ quality: 95, effort: 6 })
  .toFile('public/images/hero-banner-full.webp');

  // Also update public/images/hero-property-wheel.webp with the perfect circle
  await sharp(wheelResized)
    .toFile('public/images/hero-property-wheel.webp');

  console.log('✓ Successfully generated hero-banner-full.webp with "property" and perfect circle wheel!');
}

generateHeroBanner().catch(console.error);

