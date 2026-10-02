import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const uploadedDir = 'C:/Users/Velli/.gemini/antigravity/brain/39330a83-c8ae-49ce-aaa9-9262acdb3b51/.user_uploaded';
const outputDir = 'C:/ak-properties-checklist/public/images';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  console.log('Processing images...');

  // 1. Hero Property Wheel from media_1789201046511.png (1024x576)
  // The wheel starts around x: 450 to 1020, y: 70 to 570
  await sharp(path.join(uploadedDir, 'media_1789201046511.png'))
    .extract({ left: 420, top: 50, width: 590, height: 520 })
    .webp({ quality: 95 })
    .toFile(path.join(outputDir, 'hero-property-wheel.webp'));
  console.log('✓ hero-property-wheel.webp created');

  // Copy the full hero graphic as well
  await sharp(path.join(uploadedDir, 'media_1789201046511.png'))
    .webp({ quality: 95 })
    .toFile(path.join(outputDir, 'hero-full-banner.webp'));
  console.log('✓ hero-full-banner.webp created');

  // 2. 6 3D Service Tiles from media_1789201046531.jpg (1024x558)
  // Grid: 3 columns x 2 rows
  // Row 1 y: 20 to 260. Col 1 x: 60-340, Col 2 x: 360-640, Col 3 x: 660-940
  // Row 2 y: 280 to 520. Col 1 x: 60-340, Col 2 x: 360-640, Col 3 x: 660-940
  
  const serviceTiles = [
    { name: 'service-3d-identification.webp', left: 70, top: 40, width: 260, height: 210 },
    { name: 'service-3d-legal-opinion.webp', left: 370, top: 40, width: 260, height: 210 },
    { name: 'service-3d-revenue-issues.webp', left: 670, top: 40, width: 260, height: 210 },
    { name: 'service-3d-maintenance.webp', left: 70, top: 300, width: 260, height: 210 },
    { name: 'service-3d-buying-selling.webp', left: 370, top: 300, width: 260, height: 210 },
    { name: 'service-3d-awareness.webp', left: 670, top: 300, width: 260, height: 210 }
  ];

  for (const tile of serviceTiles) {
    await sharp(path.join(uploadedDir, 'media_1789201046531.jpg'))
      .extract({ left: tile.left, top: tile.top, width: tile.width, height: tile.height })
      .webp({ quality: 95 })
      .toFile(path.join(outputDir, tile.name));
    console.log(`✓ ${tile.name} created`);
  }

  // Also keep the full 6-tile graphic
  await sharp(path.join(uploadedDir, 'media_1789201046531.jpg'))
    .webp({ quality: 95 })
    .toFile(path.join(outputDir, 'services-3d-grid-banner.webp'));
  console.log('✓ services-3d-grid-banner.webp created');

  // 3. Testimonial Icons from media_1789200469012.jpg (1024x389)
  const testimonialIcons = [
    { name: 'testimonial-icon-video.webp', left: 188, top: 138, width: 108, height: 110 },
    { name: 'testimonial-icon-audio.webp', left: 476, top: 130, width: 94, height: 120 },
    { name: 'testimonial-icon-google.webp', left: 748, top: 144, width: 118, height: 98 }
  ];

  for (const ic of testimonialIcons) {
    const rawBuffer = await sharp(path.join(uploadedDir, 'media_1789200469012.jpg'))
      .extract({ left: ic.left, top: ic.top, width: ic.width, height: ic.height })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = rawBuffer;
    const w = info.width, h = info.height;
    const visited = new Uint8Array(w * h);
    const queue = [];

    function isPureBg(x, y) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const dist = Math.sqrt((r - 240)**2 + (g - 229)**2 + (b - 207)**2);
      return dist < 8;
    }

    for (let x = 0; x < w; x++) {
      if (isPureBg(x, 0)) { queue.push(x, 0); visited[0 * w + x] = 1; }
      if (isPureBg(x, h - 1)) { queue.push(x, h - 1); visited[(h - 1) * w + x] = 1; }
    }
    for (let y = 0; y < h; y++) {
      if (isPureBg(0, y) && !visited[y * w]) { queue.push(0, y); visited[y * w] = 1; }
      if (isPureBg(w - 1, y) && !visited[y * w + (w - 1)]) { queue.push(w - 1, y); visited[y * w + (w - 1)] = 1; }
    }

    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];
      const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIdx = ny * w + nx;
          if (!visited[nIdx] && isPureBg(nx, ny)) {
            visited[nIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pIdx = y * w + x;
        const bIdx = pIdx * 4;
        if (visited[pIdx]) {
          data[bIdx + 3] = 0;
        } else {
          let touchesVisited = false;
          const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && visited[ny * w + nx]) {
              touchesVisited = true;
              break;
            }
          }
          if (touchesVisited) {
            const r = data[bIdx], g = data[bIdx+1], b = data[bIdx+2];
            const dist = Math.sqrt((r - 240)**2 + (g - 229)**2 + (b - 207)**2);
            if (dist < 18) {
              data[bIdx + 3] = Math.round(Math.min(255, Math.max(0, ((dist - 5) / 13) * 255)));
            }
          }
        }
      }
    }

    await sharp(data, { raw: { width: w, height: h, channels: 4 } })
      .resize({ width: w * 2, height: h * 2, kernel: 'lanczos3' })
      .webp({ quality: 100 })
      .toFile(path.join(outputDir, ic.name));

    console.log(`✓ ${ic.name} created`);
  }

  // 4. Stat Counter Icons from media_1789200469014.jpg (1024x377)
  const statIcons = [
    { name: 'stat-house-coins.webp', left: 232, top: 194, width: 58, height: 58 },
    { name: 'stat-regional-map.webp', left: 490, top: 182, width: 62, height: 66 },
    { name: 'stat-blue-map.webp', left: 728, top: 183, width: 52, height: 65 }
  ];

  for (const ic of statIcons) {
    const rawBuffer = await sharp(path.join(uploadedDir, 'media_1789200469014.jpg'))
      .extract({ left: ic.left, top: ic.top, width: ic.width, height: ic.height })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = rawBuffer;
    const w = info.width, h = info.height;
    const visited = new Uint8Array(w * h);
    const queue = [];

    function isBg(x, y) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const dist = Math.sqrt((r - 240)**2 + (g - 229)**2 + (b - 207)**2);
      return dist < 30;
    }

    for (let x = 0; x < w; x++) {
      if (isBg(x, 0)) { queue.push(x, 0); visited[0 * w + x] = 1; }
      if (isBg(x, h - 1)) { queue.push(x, h - 1); visited[(h - 1) * w + x] = 1; }
    }
    for (let y = 0; y < h; y++) {
      if (isBg(0, y) && !visited[y * w]) { queue.push(0, y); visited[y * w] = 1; }
      if (isBg(w - 1, y) && !visited[y * w + (w - 1)]) { queue.push(w - 1, y); visited[y * w + (w - 1)] = 1; }
    }

    let head = 0;
    while (head < queue.length) {
      const cx = queue[head++];
      const cy = queue[head++];
      const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIdx = ny * w + nx;
          if (!visited[nIdx] && isBg(nx, ny)) {
            visited[nIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pIdx = y * w + x;
        const bIdx = pIdx * 4;
        if (visited[pIdx]) {
          data[bIdx + 3] = 0;
        } else {
          let isBorder = false;
          const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && visited[ny * w + nx]) {
              isBorder = true;
              break;
            }
          }
          if (isBorder) {
            const r = data[bIdx], g = data[bIdx+1], b = data[bIdx+2];
            const dist = Math.sqrt((r - 240)**2 + (g - 229)**2 + (b - 207)**2);
            if (dist < 45) {
              data[bIdx + 3] = Math.round(Math.min(255, Math.max(0, ((dist - 20) / 25) * 255)));
            }
          }
        }
      }
    }

    await sharp(data, { raw: { width: w, height: h, channels: 4 } })
      .resize({ width: w * 2, height: h * 2, kernel: 'lanczos3' })
      .webp({ quality: 100 })
      .toFile(path.join(outputDir, ic.name));

    console.log(`✓ ${ic.name} created`);
  }

  // 5. Post 1 Social Campaign (1080x1080)
  await sharp(path.join(uploadedDir, 'media_1789201046495.jpg'))
    .webp({ quality: 95 })
    .toFile(path.join(outputDir, 'social-campaign-coimbatore-1080.webp'));
  console.log('✓ social-campaign-coimbatore-1080.webp created');

  console.log('All image extractions completed successfully!');
}

run().catch(console.error);

