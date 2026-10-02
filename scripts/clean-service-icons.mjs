import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const uploadsDir = 'C:/Users/Velli/.gemini/antigravity/brain/39330a83-c8ae-49ce-aaa9-9262acdb3b51/.user_uploaded';
const imagesDir = 'C:/ak-properties-checklist/public/images';
const backupDir = path.join(imagesDir, 'backup');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const iconConfigs = [
  {
    name: 'service-3d-identification.webp',
    input: path.join(uploadsDir, 'media_1789393079932.jpg')
  },
  {
    name: 'service-3d-legal-opinion.webp',
    input: path.join(uploadsDir, 'media_1789393079944.jpg')
  },
  {
    name: 'service-3d-revenue-issues.webp',
    input: path.join(uploadsDir, 'media_1789393079935.jpg')
  },
  {
    name: 'service-3d-maintenance.webp',
    input: path.join(uploadsDir, 'media_1789393079934.jpg')
  },
  {
    name: 'service-3d-buying-selling.webp',
    input: path.join(uploadsDir, 'media_1789393079937.jpg')
  },
  {
    name: 'service-3d-awareness.webp',
    input: 'C:/Users/Velli/.gemini/antigravity/brain/39330a83-c8ae-49ce-aaa9-9262acdb3b51/service_3d_awareness_1789393350094.jpg'
  }
];

async function processIcon(cfg) {
  const destPath = path.join(imagesDir, cfg.name);
  const backupPath = path.join(backupDir, cfg.name);
  if (fs.existsSync(destPath) && !fs.existsSync(backupPath)) {
    fs.copyFileSync(destPath, backupPath);
    console.log(`Backed up ${cfg.name} -> backup/${cfg.name}`);
  }

  const { data, info } = await sharp(cfg.input).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Flood fill from all 4 borders to remove background and 3D floor shadow
  const visited = new Uint8Array(w * h);
  const queue = [];
  const FLOOD_LIMIT = 135;

  for (let x = 0; x < w; x++) {
    visited[0 * w + x] = 1; queue.push(x, 0);
    visited[(h - 1) * w + x] = 1; queue.push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    if (!visited[y * w]) { visited[y * w] = 1; queue.push(0, y); }
    if (!visited[y * w + w - 1]) { visited[y * w + w - 1] = 1; queue.push(w - 1, y); }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const nbrs = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
    for (const [nx, ny] of nbrs) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const pIdx = ny * w + nx;
        if (!visited[pIdx]) {
          const b = Math.max(data[pIdx * 3], data[pIdx * 3 + 1], data[pIdx * 3 + 2]);
          if (b <= FLOOD_LIMIT) {
            visited[pIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // Smooth anti-aliased edge at the white pedestal border
  const raw4 = Buffer.alloc(w * h * 4);
  const LOW = 115;
  const HIGH = 145;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pIdx = y * w + x;
      const i3 = pIdx * 3;
      const i4 = pIdx * 4;
      raw4[i4] = data[i3];
      raw4[i4 + 1] = data[i3 + 1];
      raw4[i4 + 2] = data[i3 + 2];

      if (visited[pIdx]) {
        const b = Math.max(data[i3], data[i3 + 1], data[i3 + 2]);
        if (b <= LOW) {
          raw4[i4 + 3] = 0;
        } else {
          const a = Math.round(((b - LOW) / (HIGH - LOW)) * 255);
          raw4[i4 + 3] = Math.max(0, Math.min(255, a));
        }
      } else {
        raw4[i4 + 3] = 255;
      }
    }
  }

  // Trim to content and center with a generous 40px safe transparent margin in a 600x600 canvas
  await sharp(raw4, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .resize(520, 520, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 40, bottom: 40, left: 40, right: 40, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(destPath);

  console.log(`✓ Cleaned and saved ${cfg.name}`);
}

async function run() {
  for (const cfg of iconConfigs) {
    await processIcon(cfg);
  }
  console.log('All 6 service icons successfully cleaned without floor shadow smudges!');
}

run().catch(console.error);
