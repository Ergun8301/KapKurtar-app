import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const logoPath = path.join(rootDir, 'assets', 'logo_splash.png');

// Android splash screen sizes (portrait and landscape)
const androidSizes = {
  // Portrait
  'drawable-port-mdpi': { width: 320, height: 480 },
  'drawable-port-hdpi': { width: 480, height: 800 },
  'drawable-port-xhdpi': { width: 720, height: 1280 },
  'drawable-port-xxhdpi': { width: 1080, height: 1920 },
  'drawable-port-xxxhdpi': { width: 1440, height: 2560 },
  // Landscape
  'drawable-land-mdpi': { width: 480, height: 320 },
  'drawable-land-hdpi': { width: 800, height: 480 },
  'drawable-land-xhdpi': { width: 1280, height: 720 },
  'drawable-land-xxhdpi': { width: 1920, height: 1080 },
  'drawable-land-xxxhdpi': { width: 2560, height: 1440 },
  // Default drawable
  'drawable': { width: 1080, height: 1920 },
};

// iOS splash screen size
const iosSize = { width: 2732, height: 2732 };

async function generateSplash() {
  // Read the logo
  const logo = await sharp(logoPath).toBuffer({ resolveWithObject: true });
  const logoWidth = logo.info.width;
  const logoHeight = logo.info.height;

  console.log(`Logo size: ${logoWidth}x${logoHeight}`);

  // Generate Android splash screens
  console.log('\nGenerating Android splash screens...');
  for (const [folder, size] of Object.entries(androidSizes)) {
    const outputDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res', folder);

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Calculate logo scale (logo should be about 60% of the smallest dimension)
    const maxLogoWidth = Math.floor(size.width * 0.7);
    const maxLogoHeight = Math.floor(size.height * 0.25);

    const scale = Math.min(maxLogoWidth / logoWidth, maxLogoHeight / logoHeight);
    const scaledLogoWidth = Math.floor(logoWidth * scale);
    const scaledLogoHeight = Math.floor(logoHeight * scale);

    // Resize logo
    const resizedLogo = await sharp(logoPath)
      .resize(scaledLogoWidth, scaledLogoHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    // Create splash with white background and centered logo
    const left = Math.floor((size.width - scaledLogoWidth) / 2);
    const top = Math.floor((size.height - scaledLogoHeight) / 2);

    await sharp({
      create: {
        width: size.width,
        height: size.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: resizedLogo, left, top }])
      .png()
      .toFile(path.join(outputDir, 'splash.png'));

    console.log(`  Created: ${folder}/splash.png (${size.width}x${size.height})`);
  }

  // Generate iOS splash screen
  console.log('\nGenerating iOS splash screens...');
  const iosOutputDir = path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset');

  // Ensure directory exists
  if (!fs.existsSync(iosOutputDir)) {
    fs.mkdirSync(iosOutputDir, { recursive: true });
  }

  // Calculate logo scale for iOS (logo should be visible but not too large)
  const iosMaxLogoWidth = Math.floor(iosSize.width * 0.5);
  const iosMaxLogoHeight = Math.floor(iosSize.height * 0.15);

  const iosScale = Math.min(iosMaxLogoWidth / logoWidth, iosMaxLogoHeight / logoHeight);
  const iosScaledLogoWidth = Math.floor(logoWidth * iosScale);
  const iosScaledLogoHeight = Math.floor(logoHeight * iosScale);

  const iosResizedLogo = await sharp(logoPath)
    .resize(iosScaledLogoWidth, iosScaledLogoHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  const iosLeft = Math.floor((iosSize.width - iosScaledLogoWidth) / 2);
  const iosTop = Math.floor((iosSize.height - iosScaledLogoHeight) / 2);

  // Create 3 iOS splash images (1x, 2x, 3x - all same size for universal)
  const iosSplashNames = ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png'];

  for (const name of iosSplashNames) {
    await sharp({
      create: {
        width: iosSize.width,
        height: iosSize.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: iosResizedLogo, left: iosLeft, top: iosTop }])
      .png()
      .toFile(path.join(iosOutputDir, name));

    console.log(`  Created: ${name} (${iosSize.width}x${iosSize.height})`);
  }

  // Update iOS Contents.json
  const contentsJson = {
    images: [
      { idiom: 'universal', filename: 'splash-2732x2732.png', scale: '1x' },
      { idiom: 'universal', filename: 'splash-2732x2732-1.png', scale: '2x' },
      { idiom: 'universal', filename: 'splash-2732x2732-2.png', scale: '3x' }
    ],
    info: { version: 1, author: 'xcode' }
  };

  fs.writeFileSync(
    path.join(iosOutputDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  console.log('  Updated: Contents.json');

  console.log('\nSplash screen generation complete!');
}

generateSplash().catch(console.error);
