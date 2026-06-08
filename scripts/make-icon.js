const { createCanvas } = require('canvas');
const fs = require('fs');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size / 1024;

  // Background
  ctx.fillStyle = '#2d6a4f';
  roundRect(ctx, 0, 0, size, size, 180 * s);
  ctx.fill();

  // Eye white outline
  ctx.beginPath();
  ctx.ellipse(512 * s, 480 * s, 300 * s, 180 * s, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 45 * s;
  ctx.stroke();

  // Eye white circle
  ctx.beginPath();
  ctx.arc(512 * s, 480 * s, 110 * s, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Pupil
  ctx.beginPath();
  ctx.arc(512 * s, 480 * s, 60 * s, 0, Math.PI * 2);
  ctx.fillStyle = '#2d6a4f';
  ctx.fill();

  // Buildings
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(478 * s, 432 * s, 20 * s, 52 * s);
  ctx.fillRect(506 * s, 418 * s, 20 * s, 66 * s);
  ctx.fillRect(534 * s, 428 * s, 20 * s, 56 * s);

  // App name
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${72 * s}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('NagarNetra', 512 * s, 700 * s);

  // Tagline
  ctx.fillStyle = '#b7e4c7';
  ctx.font = `${36 * s}px Arial`;
  ctx.fillText('Eye of the City', 512 * s, 770 * s);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Generate icons
const icon = drawIcon(1024);
fs.writeFileSync('assets/icon.png', icon.toBuffer('image/png'));
console.log('icon.png done!');

const adaptive = drawIcon(1024);
fs.writeFileSync('assets/adaptive-icon.png', adaptive.toBuffer('image/png'));
console.log('adaptive-icon.png done!');

const splash = createCanvas(1284, 2778);
const ctx = splash.getContext('2d');
ctx.fillStyle = '#2d6a4f';
ctx.fillRect(0, 0, 1284, 2778);
const iconCanvas = drawIcon(600);
ctx.drawImage(iconCanvas, 342, 1089, 600, 600);
fs.writeFileSync('assets/splash-icon.png', splash.toBuffer('image/png'));
console.log('splash-icon.png done!');