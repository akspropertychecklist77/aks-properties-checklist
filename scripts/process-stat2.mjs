import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processStat2() {
  const input = 'C:/Users/Velli/.gemini/antigravity/brain/39330a83-c8ae-49ce-aaa9-9262acdb3b51/stat_maintaining_3d_1789575026093.jpg';
  const img = sharp(input);
  const { width: w, height: h } = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();

  const isBg = new Uint8Array(w * h);
  const queue = [];

  function getIdx(x, y) { return (y * w + x) * 4; }
  function isWhite(x, y) {
    const idx = getIdx(x, y);
    return raw[idx] >= 248 && raw[idx + 1] >= 248 && raw[idx + 2] >= 248;
  }

  for (let x = 0; x < w; x++) {
    if (isWhite(x, 0)) { isBg[0 * w + x] = 1; queue.push(x, 0); }
    if (isWhite(x, h - 1)) { isBg[(h - 1) * w + x] = 1; queue.push(x, h - 1); }
  }
  for (let y = 0; y < h; y++) {
    if (isWhite(0, y) && !isBg[y * w]) { isBg[y * w] = 1; queue.push(0, y); }
    if (isWhite(w - 1, y) && !isBg[y * w + w - 1]) { isBg[y * w + w - 1] = 1; queue.push(w - 1, y); }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const neighbors = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const pIdx = ny * w + nx;
        if (!isBg[pIdx]) {
          const idx = getIdx(nx, ny);
          if (raw[idx] >= 240 && raw[idx + 1] >= 240 && raw[idx + 2] >= 240) {
            isBg[pIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pIdx = y * w + x;
      if (isBg[pIdx]) {
        const idx = getIdx(x, y);
        const minVal = Math.min(raw[idx], raw[idx + 1], raw[idx + 2]);
        if (minVal >= 250) {
          raw[idx + 3] = 0;
        } else {
          const a = Math.round(((250 - minVal) / 10) * 255);
          raw[idx + 3] = Math.max(0, Math.min(255, a));
        }
      }
    }
  }

  // Backup existing stat-regional-map.webp
  if (fs.existsSync('public/images/stat-regional-map.webp')) {
    fs.copyFileSync('public/images/stat-regional-map.webp', 'public/images/backup/stat-regional-map.webp');
    console.log('Backed up stat-regional-map.webp');
  }

  await sharp(raw, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95, effort: 6 })
    .toFile('public/images/stat-regional-map.webp');

  console.log('✓ Successfully processed stat 2 3D isometric icon -> public/images/stat-regional-map.webp');
}

processStat2().catch(console.error);

