const sharp = require('sharp');

// App icon 1024x1024
sharp('assets/icon.svg')
  .resize(1024, 1024)
  .png()
  .toFile('assets/icon.png')
  .then(() => console.log('icon.png created!'));

// Splash screen 1284x2778
sharp('assets/icon.svg')
  .resize(1284, 2778)
  .png()
  .toFile('assets/splash-icon.png')
  .then(() => console.log('splash-icon.png created!'));

// Adaptive icon 1024x1024
sharp('assets/icon.svg')
  .resize(1024, 1024)
  .png()
  .toFile('assets/adaptive-icon.png')
  .then(() => console.log('adaptive-icon.png created!'));