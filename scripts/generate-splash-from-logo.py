#!/usr/bin/env python3
"""
Generate splash screens for Capacitor Android and iOS using the KS logo
Following official Capacitor documentation
"""

from PIL import Image
import os

# KapKurtar brand color
BACKGROUND_COLOR = (0, 166, 144)  # #00A690

# Android splash screen sizes (width x height) for different densities
ANDROID_SPLASH_SIZES = {
    'drawable': (480, 800),
    'drawable-land-mdpi': (480, 320),
    'drawable-land-hdpi': (800, 480),
    'drawable-land-xhdpi': (1280, 720),
    'drawable-land-xxhdpi': (1600, 960),
    'drawable-land-xxxhdpi': (1920, 1280),
    'drawable-port-mdpi': (320, 480),
    'drawable-port-hdpi': (480, 800),
    'drawable-port-xhdpi': (720, 1280),
    'drawable-port-xxhdpi': (960, 1600),
    'drawable-port-xxxhdpi': (1280, 1920),
}

# iOS splash size (universal)
IOS_SPLASH_SIZE = (2732, 2732)

def create_splash_with_logo(width, height, logo_img):
    """Create a splash image with centered logo"""
    # Create background
    img = Image.new('RGB', (width, height), BACKGROUND_COLOR)

    # Calculate logo size (40% of the smallest dimension to ensure it fits nicely)
    min_dim = min(width, height)
    logo_size = int(min_dim * 0.4)

    # Resize logo maintaining aspect ratio
    logo_resized = logo_img.copy()
    logo_resized.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)

    # Calculate position to center the logo
    x = (width - logo_resized.width) // 2
    y = (height - logo_resized.height) // 2

    # Paste logo onto background (handling transparency if present)
    if logo_resized.mode == 'RGBA':
        img.paste(logo_resized, (x, y), logo_resized)
    else:
        img.paste(logo_resized, (x, y))

    return img

def main():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Load the source logo
    logo_path = os.path.join(base_path, 'assets', 'icon-only.png')
    if not os.path.exists(logo_path):
        print(f"Error: Logo file not found at {logo_path}")
        return

    print(f"Loading logo from: {logo_path}")
    logo = Image.open(logo_path)

    # Generate Android splash screens
    android_res_path = os.path.join(base_path, 'android', 'app', 'src', 'main', 'res')

    print("\nGenerating Android splash screens...")
    for folder, (width, height) in ANDROID_SPLASH_SIZES.items():
        folder_path = os.path.join(android_res_path, folder)
        os.makedirs(folder_path, exist_ok=True)

        img = create_splash_with_logo(width, height, logo)
        output_path = os.path.join(folder_path, 'splash.png')
        img.save(output_path, 'PNG')
        print(f"  Created: {folder}/splash.png ({width}x{height})")

    # Generate iOS splash screen
    ios_splash_path = os.path.join(base_path, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset')
    os.makedirs(ios_splash_path, exist_ok=True)

    print("\nGenerating iOS splash screens...")
    width, height = IOS_SPLASH_SIZE
    img = create_splash_with_logo(width, height, logo)

    # iOS needs 3 versions (1x, 2x, 3x scales but same image for universal)
    for suffix in ['', '-1', '-2']:
        output_path = os.path.join(ios_splash_path, f'splash-2732x2732{suffix}.png')
        img.save(output_path, 'PNG')
        print(f"  Created: splash-2732x2732{suffix}.png ({width}x{height})")

    # Create/update Contents.json for iOS
    contents_json = '''{
  "images" : [
    {
      "filename" : "splash-2732x2732.png",
      "idiom" : "universal",
      "scale" : "1x"
    },
    {
      "filename" : "splash-2732x2732-1.png",
      "idiom" : "universal",
      "scale" : "2x"
    },
    {
      "filename" : "splash-2732x2732-2.png",
      "idiom" : "universal",
      "scale" : "3x"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}'''

    contents_path = os.path.join(ios_splash_path, 'Contents.json')
    with open(contents_path, 'w') as f:
        f.write(contents_json)
    print(f"  Updated: Contents.json")

    # Also create source asset in assets folder for future use
    assets_path = os.path.join(base_path, 'assets')
    os.makedirs(assets_path, exist_ok=True)

    source_img = create_splash_with_logo(1024, 1024, logo)
    source_path = os.path.join(assets_path, 'splash-screen.png')
    source_img.save(source_path, 'PNG')
    print(f"\nCreated source asset: assets/splash-screen.png (1024x1024)")

    print("\nSplash screen generation complete!")
    print("The KS logo has been centered on all splash screens with the KapKurtar teal background.")

if __name__ == '__main__':
    main()
