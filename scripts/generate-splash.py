#!/usr/bin/env python3
"""
Generate splash screens for Capacitor Android and iOS
Following official Capacitor documentation
"""

from PIL import Image, ImageDraw, ImageFont
import os

# KapKurtar brand color
BACKGROUND_COLOR = (0, 166, 144)  # #00A690
TEXT_COLOR = (255, 255, 255)  # White

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

def create_splash_image(width, height, text="KAPKURTAR"):
    """Create a splash image with centered text"""
    img = Image.new('RGB', (width, height), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)

    # Calculate font size based on image dimensions (roughly 1/8 of smallest dimension)
    min_dim = min(width, height)
    font_size = max(min_dim // 8, 20)

    # Try to use a basic font
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSans-Bold.ttf", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()

    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center the text
    x = (width - text_width) // 2
    y = (height - text_height) // 2

    draw.text((x, y), text, fill=TEXT_COLOR, font=font)

    return img

def main():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Generate Android splash screens
    android_res_path = os.path.join(base_path, 'android', 'app', 'src', 'main', 'res')

    print("Generating Android splash screens...")
    for folder, (width, height) in ANDROID_SPLASH_SIZES.items():
        folder_path = os.path.join(android_res_path, folder)
        os.makedirs(folder_path, exist_ok=True)

        img = create_splash_image(width, height)
        output_path = os.path.join(folder_path, 'splash.png')
        img.save(output_path, 'PNG')
        print(f"  Created: {folder}/splash.png ({width}x{height})")

    # Generate iOS splash screen
    ios_splash_path = os.path.join(base_path, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset')
    os.makedirs(ios_splash_path, exist_ok=True)

    print("\nGenerating iOS splash screens...")
    width, height = IOS_SPLASH_SIZE
    img = create_splash_image(width, height)

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

    source_img = create_splash_image(1024, 1024)
    source_path = os.path.join(assets_path, 'splash.png')
    source_img.save(source_path, 'PNG')
    print(f"\nCreated source asset: assets/splash.png (1024x1024)")

    print("\nSplash screen generation complete!")

if __name__ == '__main__':
    main()
