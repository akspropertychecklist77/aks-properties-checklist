import sharp from 'sharp';

async function makeCircle() {
  const input = 'public/images/Slide 1 image.png';
  const canvasSize = 1080;
  const wheelSize = 1000;
  
  const resizedWheel = await sharp(input)
    .resize(wheelSize, wheelSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const r = 520;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;

  // Perfect circle background in clean white with subtle warm border and drop shadow
  const circleBgSvg = `
    <svg width="${canvasSize}" height="${canvasSize}">
      <circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="#ffffff" stroke="#ebdcc9" stroke-width="6"/>
    </svg>
  `;

  // Composite: white circular disc background + wheel on top
  await sharp(Buffer.from(circleBgSvg))
    .composite([
      {
        input: resizedWheel,
        left: Math.round((canvasSize - wheelSize) / 2),
        top: Math.round((canvasSize - wheelSize) / 2)
      }
    ])
    .webp({ quality: 95, effort: 6 })
    .toFile('C:/Users/Velli/.gemini/antigravity/brain/39330a83-c8ae-49ce-aaa9-9262acdb3b51/scratch/test_perfect_circle_disc.webp');

  console.log('Saved test_perfect_circle_disc.webp');
}

makeCircle().catch(console.error);

