const fs = require('fs');

const svg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="180" fill="#2d6a4f"/>
  <ellipse cx="512" cy="480" rx="300" ry="180" fill="none" stroke="#ffffff" stroke-width="45"/>
  <circle cx="512" cy="480" r="110" fill="#ffffff"/>
  <circle cx="512" cy="480" r="60" fill="#2d6a4f"/>
  <rect x="480" y="430" width="22" height="55" fill="#ffffff"/>
  <rect x="510" y="415" width="22" height="70" fill="#ffffff"/>
  <rect x="540" y="425" width="22" height="60" fill="#ffffff"/>
  <text x="512" y="700" font-family="Arial" font-size="75" font-weight="bold" fill="#ffffff" text-anchor="middle">NagarNetra</text>
  <text x="512" y="770" font-family="Arial" font-size="38" fill="#b7e4c7" text-anchor="middle">Eye of the City</text>
</svg>`;

fs.writeFileSync('assets/icon.svg', svg);
console.log('SVG saved!');