import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const uploadsDir = 'C:/Users/Velli/.gemini/antigravity/brain/39330a83-c8ae-49ce-aaa9-9262acdb3b51/.user_uploaded';
const imagesDir = 'C:/ak-properties-checklist/public/images';
const backupDir = path.join(imagesDir, 'backup');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

function backupFile(filename) {
  const src = path.join(imagesDir, filename);
  if (fs.existsSync(src)) {
    const dest = path.join(backupDir, filename);
    fs.copyFileSync(src, dest);
    console.log(`Backed up: ${filename} -> backup/${filename}`);
  }
}

async function run() {
  console.log('--- Step 1: Backing up old images ---');
  const filesToBackup = [
    'logo.png',
    'footer-logo.png',
    'testimonial-icon-audio.webp',
    'testimonial-icon-google.webp',
    'clients.png',
    'hero-property-wheel.webp',
    'hero-banner-full.webp',
    'Slide 1 image.png'
  ];

  for (const f of filesToBackup) {
    backupFile(f);
  }

  console.log('\n--- Step 2: Processing and saving new images ---');

  // 1. Logo (media_1789566978078.png)
  const logoInput = path.join(uploadsDir, 'media_1789566978078.png');
  await sharp(logoInput)
    .png({ quality: 100 })
    .toFile(path.join(imagesDir, 'logo.png'));
  await sharp(logoInput)
    .png({ quality: 100 })
    .toFile(path.join(imagesDir, 'footer-logo.png'));
  console.log('✓ Updated logo.png and footer-logo.png');

  // 2. Testimonial Audio / Talking Avatar (media_1789566978130.png)
  const audioInput = path.join(uploadsDir, 'media_1789566978130.png');
  await sharp(audioInput)
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(imagesDir, 'testimonial-icon-audio.webp'));
  console.log('✓ Updated testimonial-icon-audio.webp');

  // 3. Testimonial Google Review 5-Star Badge (media_1789566978134.png)
  const googleInput = path.join(uploadsDir, 'media_1789566978134.png');
  await sharp(googleInput)
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(imagesDir, 'testimonial-icon-google.webp'));
  console.log('✓ Updated testimonial-icon-google.webp');

  // 4. Clients Map with Singapore (media_1789566978147.png)
  const clientsInput = path.join(uploadsDir, 'media_1789566978147.png');
  await sharp(clientsInput)
    .png({ quality: 100 })
    .toFile(path.join(imagesDir, 'clients.png'));
  console.log('✓ Updated clients.png');

  // 5. Property Wheel (media_1789566978162.jpg) - Extract black background to transparency
  const wheelInput = path.join(uploadsDir, 'media_1789566978162.jpg');
  const wheelImg = sharp(wheelInput);
  const { width, height } = await wheelImg.metadata();
  const raw = await wheelImg.ensureAlpha().raw().toBuffer();

  function getIdx(x, y) {
    return (y * width + x) * 4;
  }
  function getBrightness(x, y) {
    const idx = getIdx(x, y);
    return Math.max(raw[idx], raw[idx + 1], raw[idx + 2]);
  }

  const isBg = new Uint8Array(width * height);
  const queue = [];
  const SEED_MAX = 25;
  const FLOOD_MAX = 35;

  for (let x = 0; x < width; x++) {
    if (getBrightness(x, 0) <= SEED_MAX) { isBg[0 * width + x] = 1; queue.push(x, 0); }
    if (getBrightness(x, height - 1) <= SEED_MAX) { isBg[(height - 1) * width + x] = 1; queue.push(x, height - 1); }
  }
  for (let y = 0; y < height; y++) {
    if (getBrightness(0, y) <= SEED_MAX && !isBg[y * width]) { isBg[y * width] = 1; queue.push(0, y); }
    if (getBrightness(width - 1, y) <= SEED_MAX && !isBg[y * width + width - 1]) { isBg[y * width + width - 1] = 1; queue.push(width - 1, y); }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const pIdx = ny * width + nx;
        if (!isBg[pIdx]) {
          const b = getBrightness(nx, ny);
          if (b <= FLOOD_MAX) {
            isBg[pIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const idx = getIdx(x, y);
      if (isBg[pIdx]) {
        const b = getBrightness(x, y);
        if (b <= 15) {
          raw[idx + 3] = 0;
        } else {
          const a = Math.round(((b - 15) / 20) * 255);
          const alphaVal = Math.max(0, Math.min(255, a));
          raw[idx + 3] = alphaVal;
          if (alphaVal > 0) {
            const factor = 255 / alphaVal;
            raw[idx] = Math.min(255, Math.round(raw[idx] * factor));
            raw[idx + 1] = Math.min(255, Math.round(raw[idx + 1] * factor));
            raw[idx + 2] = Math.min(255, Math.round(raw[idx + 2] * factor));
          }
        }
      }
    }
  }

  const transparentWheelBuffer = await sharp(raw, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();

  // Save as Slide 1 image.png
  await sharp(transparentWheelBuffer)
    .png({ quality: 100 })
    .toFile(path.join(imagesDir, 'Slide 1 image.png'));
  console.log('✓ Updated Slide 1 image.png (clean transparent version)');

  // Save as hero-property-wheel.webp
  await sharp(transparentWheelBuffer)
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(imagesDir, 'hero-property-wheel.webp'));
  console.log('✓ Updated hero-property-wheel.webp');

  // Composite into hero-banner-full.webp
  const textLeft = await sharp('C:/Users/Velli/.gemini/antigravity/brain/39330a83-c8ae-49ce-aaa9-9262acdb3b51/scratch/banner_left_text.png')
    .extract({ left: 30, top: 20, width: 380, height: 440 })
    .toBuffer();

  const bannerWidth = 1100;
  const bannerHeight = 540;
  const bg = { r: 248, g: 239, b: 230, alpha: 1 };

  const wheelResized = await sharp(transparentWheelBuffer)
    .resize(520, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const textResized = await sharp(textLeft)
    .resize(null, 440, { fit: 'contain' })
    .toBuffer();

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
      input: textResized,
      left: 60,
      top: Math.round((bannerHeight - 440) / 2)
    },
    {
      input: wheelResized,
      left: 540,
      top: Math.round((bannerHeight - 520) / 2)
    }
  ])
  .webp({ quality: 95, effort: 6 })
  .toFile(path.join(imagesDir, 'hero-banner-full.webp'));
  console.log('✓ Updated hero-banner-full.webp with transparent wheel composite');

  console.log('\nAll 5 images processed, backed up, and deployed successfully!');
}

run().catch(console.error);

