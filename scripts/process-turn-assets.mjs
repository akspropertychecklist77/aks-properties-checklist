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
    'testimonial-icon-video.webp',
    'stat-house-coins.webp',
    'stat-blue-map.webp'
  ];

  for (const f of filesToBackup) {
    backupFile(f);
  }

  console.log('\n--- Step 2: Processing and saving new images ---');

  // 1. Header Logo (media_1789570528883.png - Transparent PNG)
  console.log('Processing transparent logo for Header...');
  const logoInput = path.join(uploadsDir, 'media_1789570528883.png');
  const trimmedLogoBuffer = await sharp(logoInput)
    .trim()
    .extend({ top: 12, bottom: 12, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  await sharp(trimmedLogoBuffer)
    .toFile(path.join(imagesDir, 'logo.png'));
  console.log('✓ Updated public/images/logo.png (Clean transparent header logo)');

  // 2. Footer Logo (Dark-mode white text on transparent background)
  console.log('Processing white-text transparent logo for Footer...');
  const footerImg = sharp(trimmedLogoBuffer);
  const { width: fw, height: fh } = await footerImg.metadata();
  const footerRaw = await footerImg.raw().toBuffer();

  for (let i = 0; i < footerRaw.length; i += 4) {
    const r = footerRaw[i];
    const g = footerRaw[i + 1];
    const b = footerRaw[i + 2];
    const a = footerRaw[i + 3];

    if (a > 20) {
      // Dark blue text / checkmark (navy) -> convert to crisp white
      if (r < 100 && b > r) {
        footerRaw[i] = 255;
        footerRaw[i + 1] = 255;
        footerRaw[i + 2] = 255;
      }
    }
  }

  await sharp(footerRaw, { raw: { width: fw, height: fh, channels: 4 } })
    .png({ quality: 100 })
    .toFile(path.join(imagesDir, 'footer-logo.png'));
  console.log('✓ Updated public/images/footer-logo.png (Transparent dark-mode footer logo)');

  // 3. Testimonial Video Icon (media_1789570525303.png - 3D Video Speech Bubble)
  console.log('Processing 3D Video Testimonial icon...');
  const videoInput = path.join(uploadsDir, 'media_1789570525303.png');
  await sharp(videoInput)
    .trim()
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(imagesDir, 'testimonial-icon-video.webp'));
  console.log('✓ Updated public/images/testimonial-icon-video.webp (400x400 WebP)');

  // 4. Stat Blue Map Icon (media_1789570525284.png - 3D Isometric Tamil Nadu Network Map)
  console.log('Processing 3D Isometric Tamil Nadu Map icon...');
  const mapInput = path.join(uploadsDir, 'media_1789570525284.png');
  const mapImg = sharp(mapInput);
  const { width: mw, height: mh } = await mapImg.metadata();
  const mapRaw = await mapImg.ensureAlpha().raw().toBuffer();

  const isMapBg = new Uint8Array(mw * mh);
  const mapQueue = [];

  function getMapIdx(x, y) { return (y * mw + x) * 4; }
  function isMapBeige(x, y) {
    const idx = getMapIdx(x, y);
    const r = mapRaw[idx], g = mapRaw[idx + 1], b = mapRaw[idx + 2];
    const dist = Math.sqrt((r - 247) ** 2 + (g - 241) ** 2 + (b - 225) ** 2);
    return dist < 12;
  }

  for (let x = 0; x < mw; x++) {
    if (isMapBeige(x, 0)) { isMapBg[0 * mw + x] = 1; mapQueue.push(x, 0); }
    if (isMapBeige(x, mh - 1)) { isMapBg[(mh - 1) * mw + x] = 1; mapQueue.push(x, mh - 1); }
  }
  for (let y = 0; y < mh; y++) {
    if (isMapBeige(0, y) && !isMapBg[y * mw]) { isMapBg[y * mw] = 1; mapQueue.push(0, y); }
    if (isMapBeige(mw - 1, y) && !isMapBg[y * mw + mw - 1]) { isMapBg[y * mw + mw - 1] = 1; mapQueue.push(mw - 1, y); }
  }

  let mapHead = 0;
  while (mapHead < mapQueue.length) {
    const cx = mapQueue[mapHead++];
    const cy = mapQueue[mapHead++];
    const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < mw && ny >= 0 && ny < mh) {
        const pIdx = ny * mw + nx;
        if (!isMapBg[pIdx]) {
          const idx = getMapIdx(nx, ny);
          const r = mapRaw[idx], g = mapRaw[idx + 1], b = mapRaw[idx + 2];
          const dist = Math.sqrt((r - 247) ** 2 + (g - 241) ** 2 + (b - 225) ** 2);
          if (dist < 30) {
            isMapBg[pIdx] = 1;
            mapQueue.push(nx, ny);
          }
        }
      }
    }
  }

  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const pIdx = y * mw + x;
      if (isMapBg[pIdx]) {
        const idx = getMapIdx(x, y);
        const r = mapRaw[idx], g = mapRaw[idx + 1], b = mapRaw[idx + 2];
        const dist = Math.sqrt((r - 247) ** 2 + (g - 241) ** 2 + (b - 225) ** 2);
        if (dist < 10) {
          mapRaw[idx + 3] = 0;
        } else {
          const a = Math.round(((dist - 10) / 20) * 255);
          mapRaw[idx + 3] = Math.max(0, Math.min(255, a));
        }
      }
    }
  }

  await sharp(mapRaw, { raw: { width: mw, height: mh, channels: 4 } })
    .trim()
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(imagesDir, 'stat-blue-map.webp'));
  console.log('✓ Updated public/images/stat-blue-map.webp (400x400 WebP transparent)');

  // 5. Stat Properties Icon (media_1789570525301.png - 3D Isometric 5-Sector Properties)
  console.log('Processing 3D Isometric Properties Estate icon...');
  const propInput = path.join(uploadsDir, 'media_1789570525301.png');
  const propImg = sharp(propInput);
  const { width: pw, height: ph } = await propImg.metadata();
  const propRaw = await propImg.ensureAlpha().raw().toBuffer();

  const isPropBg = new Uint8Array(pw * ph);
  const propQueue = [];

  function getPropIdx(x, y) { return (y * pw + x) * 4; }
  function isPropWhite(x, y) {
    const idx = getPropIdx(x, y);
    return propRaw[idx] >= 248 && propRaw[idx + 1] >= 248 && propRaw[idx + 2] >= 248;
  }

  for (let x = 0; x < pw; x++) {
    if (isPropWhite(x, 0)) { isPropBg[0 * pw + x] = 1; propQueue.push(x, 0); }
    if (isPropWhite(x, ph - 1)) { isPropBg[(ph - 1) * pw + x] = 1; propQueue.push(x, ph - 1); }
  }
  for (let y = 0; y < ph; y++) {
    if (isPropWhite(0, y) && !isPropBg[y * pw]) { isPropBg[y * pw] = 1; propQueue.push(0, y); }
    if (isPropWhite(pw - 1, y) && !isPropBg[y * pw + pw - 1]) { isPropBg[y * pw + pw - 1] = 1; propQueue.push(pw - 1, y); }
  }

  let propHead = 0;
  while (propHead < propQueue.length) {
    const cx = propQueue[propHead++];
    const cy = propQueue[propHead++];
    const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < pw && ny >= 0 && ny < ph) {
        const pIdx = ny * pw + nx;
        if (!isPropBg[pIdx]) {
          const idx = getPropIdx(nx, ny);
          if (propRaw[idx] >= 242 && propRaw[idx + 1] >= 242 && propRaw[idx + 2] >= 242) {
            isPropBg[pIdx] = 1;
            propQueue.push(nx, ny);
          }
        }
      }
    }
  }

  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const pIdx = y * pw + x;
      if (isPropBg[pIdx]) {
        const idx = getPropIdx(x, y);
        const minVal = Math.min(propRaw[idx], propRaw[idx + 1], propRaw[idx + 2]);
        if (minVal >= 252) {
          propRaw[idx + 3] = 0;
        } else {
          const a = Math.round(((252 - minVal) / 10) * 255);
          propRaw[idx + 3] = Math.max(0, Math.min(255, a));
        }
      }
    }
  }

  const transparentPropBuffer = await sharp(propRaw, { raw: { width: pw, height: ph, channels: 4 } })
    .trim()
    .png()
    .toBuffer();

  // Save as stat-house-coins.webp (400x400 contained WebP)
  await sharp(transparentPropBuffer)
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(imagesDir, 'stat-house-coins.webp'));
  console.log('✓ Updated public/images/stat-house-coins.webp (400x400 WebP transparent)');

  // Also save high-res version as properties-isometric-3d.webp
  await sharp(transparentPropBuffer)
    .webp({ quality: 95, effort: 6 })
    .toFile(path.join(imagesDir, 'properties-isometric-3d.webp'));
  console.log('✓ Saved public/images/properties-isometric-3d.webp (High-res standalone asset)');

  console.log('\nAll assets successfully processed and deployed!');
}

run().catch(console.error);

