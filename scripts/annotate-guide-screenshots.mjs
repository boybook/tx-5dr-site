import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(repoRoot, 'docs/public/guide/screenshots/original');
const outputDir = path.join(repoRoot, 'docs/public/guide/screenshots/annotated');

const screenshots = [
  {
    source: 'operator-create.png',
    output: 'operator-create.png',
    width: 2624,
    height: 1824,
    focus: [
      {
        x: 694, y: 858, width: 1587, height: 363,
        label: ['填写呼号、Grid', '和并行通联上限'],
        labelX: 730, labelY: 735, labelWidth: 510,
      },
    ],
  },
  {
    source: 'profile-radio.png',
    output: 'profile-radio.png',
    width: 1864,
    height: 1404,
    focus: [
      {
        x: 82, y: 395, width: 1410, height: 88,
        label: ['选择电台连接方式'],
        labelX: 105, labelY: 305, labelWidth: 390,
      },
      {
        x: 82, y: 529, width: 1660, height: 674,
        label: ['选择机型和串口', '再测试连接与 PTT'],
        labelX: 1080, labelY: 545, labelWidth: 540,
      },
    ],
  },
  {
    source: 'profile-audio.png',
    output: 'profile-audio.png',
    width: 1868,
    height: 1404,
    focus: [
      {
        x: 86, y: 312, width: 1655, height: 470,
        label: ['RX：选择音频输入设备'],
        labelX: 110, labelY: 215, labelWidth: 500,
      },
      {
        x: 86, y: 814, width: 1655, height: 384,
        label: ['TX：选择音频输出设备'],
        labelX: 1150, labelY: 830, labelWidth: 510,
      },
    ],
  },
  {
    source: 'radio-controls.png',
    output: 'radio-controls.png',
    width: 1608,
    height: 1406,
    focus: [
      {
        x: 85, y: 210, width: 705, height: 1180,
        label: ['天馈、射频与音频控制'],
        labelX: 70, labelY: 120, labelWidth: 480,
      },
      {
        x: 825, y: 210, width: 705, height: 1180,
        label: ['模式、Split 与频率控制'],
        labelX: 895, labelY: 120, labelWidth: 500,
      },
    ],
  },
  {
    source: 'automation.png',
    output: 'automation.png',
    width: 628,
    height: 1260,
    compact: true,
    focus: [
      {
        x: 58, y: 283, width: 502, height: 443,
        label: ['标准通联自动选项'],
        labelX: 58, labelY: 205, labelWidth: 350,
      },
      {
        x: 58, y: 755, width: 502, height: 450,
        label: ['守候与自动起呼'],
        labelX: 58, labelY: 665, labelWidth: 320,
      },
    ],
  },
  {
    source: 'remote-access.png',
    output: 'remote-access.png',
    width: 1670,
    height: 1142,
    focus: [
      {
        x: 78, y: 209, width: 1003, height: 201,
        label: ['选择局域网共享', '或正式开放部署'],
        labelX: 1140, labelY: 205, labelWidth: 440,
      },
      {
        x: 78, y: 603, width: 1514, height: 140,
        label: ['未登录用户是否可以只读查看'],
        labelX: 875, labelY: 500, labelWidth: 640,
      },
      {
        x: 78, y: 776, width: 1180, height: 118,
        label: ['复制浏览器访问地址'],
        labelX: 1280, labelY: 785, labelWidth: 355,
      },
    ],
  },
  {
    source: 'plugin-marketplace.png',
    output: 'plugin-marketplace.png',
    width: 2092,
    height: 1586,
    focus: [
      {
        x: 365, y: 397, width: 1650, height: 122,
        label: ['搜索插件并选择 Stable / Nightly'],
        labelX: 400, labelY: 300, labelWidth: 675,
      },
      {
        x: 365, y: 548, width: 1650, height: 965,
        label: ['检查版本、来源、权限与风险提示'],
        labelX: 1030, labelY: 565, labelWidth: 720,
      },
    ],
  },
  {
    source: 'clock-calibration.png',
    output: 'clock-calibration.png',
    width: 746,
    height: 654,
    compact: true,
    focus: [
      {
        x: 82, y: 78, width: 640, height: 542,
        label: ['测量并应用时钟偏移'],
        labelX: 105, labelY: 12, labelWidth: 430,
      },
    ],
  },
];

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function labelMarkup(item, index, compact) {
  const fontSize = compact ? 25 : 32;
  const lineHeight = compact ? 31 : 40;
  const padding = compact ? 14 : 18;
  const badgeSize = compact ? 34 : 42;
  const labelHeight = Math.max(
    compact ? 58 : 68,
    item.label.length * lineHeight + padding * 2,
  );
  const badgeX = item.labelX + padding + badgeSize / 2;
  const badgeY = item.labelY + labelHeight / 2;
  const textX = item.labelX + padding * 2 + badgeSize;
  const firstTextY = item.labelY + padding + fontSize;
  const text = item.label.map((line, lineIndex) => (
    `<tspan x="${textX}" y="${firstTextY + lineIndex * lineHeight}">${escapeXml(line)}</tspan>`
  )).join('');

  return `
    <g>
      <rect x="${item.labelX}" y="${item.labelY}" width="${item.labelWidth}" height="${labelHeight}"
        rx="${compact ? 16 : 20}" fill="#0f172a" fill-opacity="0.94" stroke="#60a5fa" stroke-width="2"/>
      <circle cx="${badgeX}" cy="${badgeY}" r="${badgeSize / 2}" fill="#3b82f6"/>
      <text x="${badgeX}" y="${badgeY + fontSize * 0.34}" text-anchor="middle"
        font-family="PingFang SC, Noto Sans CJK SC, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${index + 1}</text>
      <text font-family="PingFang SC, Noto Sans CJK SC, sans-serif" font-size="${fontSize}"
        font-weight="600" fill="#ffffff">${text}</text>
    </g>`;
}

function renderScreenshot(spec) {
  const sourcePath = path.join(sourceDir, spec.source);
  const outputPath = path.join(outputDir, spec.output);
  const imageData = fs.readFileSync(sourcePath).toString('base64');
  const radius = spec.compact ? 12 : 20;
  const strokeWidth = spec.compact ? 3 : 4;
  const holes = spec.focus.map((item) => (
    `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" rx="${radius}" fill="#000000"/>`
  )).join('');
  const outlines = spec.focus.map((item) => (
    `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" rx="${radius}"
      fill="none" stroke="#60a5fa" stroke-width="${strokeWidth}"/>`
  )).join('');
  const labels = spec.focus.map((item, index) => labelMarkup(item, index, spec.compact)).join('');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${spec.width}" height="${spec.height}" viewBox="0 0 ${spec.width} ${spec.height}">
  <defs>
    <mask id="focus-mask">
      <rect width="100%" height="100%" fill="#ffffff"/>
      ${holes}
    </mask>
  </defs>
  <image width="${spec.width}" height="${spec.height}" href="data:image/png;base64,${imageData}"/>
  <rect width="100%" height="100%" fill="#000000" fill-opacity="0.42" mask="url(#focus-mask)"/>
  ${outlines}
  ${labels}
</svg>`;

  const rendered = spawnSync('rsvg-convert', ['--format', 'png', '--output', outputPath], {
    input: Buffer.from(svg),
    maxBuffer: 64 * 1024 * 1024,
  });
  if (rendered.status !== 0) {
    throw new Error(`Failed to render ${spec.output}: ${rendered.stderr?.toString() || 'unknown error'}`);
  }

  const optimizedPath = `${outputPath}.optimized.png`;
  const optimized = spawnSync('magick', [
    outputPath,
    '-strip',
    '-define', 'png:compression-level=9',
    optimizedPath,
  ], { encoding: 'utf8' });
  if (optimized.status !== 0) {
    throw new Error(`Failed to optimize ${spec.output}: ${optimized.stderr || 'unknown error'}`);
  }
  fs.renameSync(optimizedPath, outputPath);
}

fs.mkdirSync(outputDir, { recursive: true });
for (const screenshot of screenshots) {
  renderScreenshot(screenshot);
}

console.log(`Generated ${screenshots.length} annotated guide screenshots in ${path.relative(repoRoot, outputDir)}`);
