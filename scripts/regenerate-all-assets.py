#!/usr/bin/env python3
"""
Regenerate ALL app icons and splash screens from icon-final.png
Complete regeneration of Android and iOS assets
"""

from PIL import Image
import os
import json

# KapKurtar brand color
BACKGROUND_COLOR = (0, 166, 144)  # #00A690

# Android icon sizes (mipmap densities)
ANDROID_ICON_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

# iOS icon sizes (AppIcon.appiconset)
IOS_ICON_SIZES = {
    'AppIcon-20@2x.png': 40,
    'AppIcon-20@3x.png': 60,
    'AppIcon-29@2x.png': 58,
    'AppIcon-29@3x.png': 87,
    'AppIcon-40@2x.png': 80,
    'AppIcon-40@3x.png': 120,
    'AppIcon-60@2x.png': 120,
    'AppIcon-60@3x.png': 180,
    'AppIcon-76.png': 76,
    'AppIcon-76@2x.png': 152,
    'AppIcon-83.5@2x.png': 167,
    'AppIcon-512@2x.png': 1024,
}

# Android splash screen sizes
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

def generate_android_icons(source_img, base_path):
    """Generate all Android mipmap icons"""
    print("\n=== Generating Android Icons ===")
    android_res_path = os.path.join(base_path, 'android', 'app', 'src', 'main', 'res')

    for mipmap, size in ANDROID_ICON_SIZES.items():
        mipmap_path = os.path.join(android_res_path, mipmap)
        os.makedirs(mipmap_path, exist_ok=True)

        # Generate ic_launcher.png
        icon = source_img.copy()
        icon.thumbnail((size, size), Image.Resampling.LANCZOS)

        # Create square image with the icon centered
        square_icon = Image.new('RGB', (size, size), BACKGROUND_COLOR)
        offset = ((size - icon.width) // 2, (size - icon.height) // 2)
        if icon.mode == 'RGBA':
            square_icon.paste(icon, offset, icon)
        else:
            square_icon.paste(icon, offset)

        # Save ic_launcher.png
        launcher_path = os.path.join(mipmap_path, 'ic_launcher.png')
        square_icon.save(launcher_path, 'PNG')
        print(f"  ✓ {mipmap}/ic_launcher.png ({size}x{size})")

        # Save ic_launcher_round.png (same as ic_launcher)
        round_path = os.path.join(mipmap_path, 'ic_launcher_round.png')
        square_icon.save(round_path, 'PNG')
        print(f"  ✓ {mipmap}/ic_launcher_round.png ({size}x{size})")

        # Save ic_launcher_foreground.png (with transparency)
        foreground = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        if icon.mode == 'RGBA':
            foreground.paste(icon, offset, icon)
        else:
            foreground.paste(icon, offset)

        foreground_path = os.path.join(mipmap_path, 'ic_launcher_foreground.png')
        foreground.save(foreground_path, 'PNG')
        print(f"  ✓ {mipmap}/ic_launcher_foreground.png ({size}x{size})")

def generate_ios_icons(source_img, base_path):
    """Generate all iOS AppIcon assets"""
    print("\n=== Generating iOS Icons ===")
    ios_icon_path = os.path.join(base_path, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset')
    os.makedirs(ios_icon_path, exist_ok=True)

    for filename, size in IOS_ICON_SIZES.items():
        icon = source_img.copy()
        icon.thumbnail((size, size), Image.Resampling.LANCZOS)

        # Create square image with the icon centered
        square_icon = Image.new('RGB', (size, size), BACKGROUND_COLOR)
        offset = ((size - icon.width) // 2, (size - icon.height) // 2)
        if icon.mode == 'RGBA':
            square_icon.paste(icon, offset, icon)
        else:
            square_icon.paste(icon, offset)

        output_path = os.path.join(ios_icon_path, filename)
        square_icon.save(output_path, 'PNG')
        print(f"  ✓ {filename} ({size}x{size})")

    # Create Contents.json
    contents = {
        "images": [
            {"filename": "AppIcon-20@2x.png", "idiom": "iphone", "scale": "2x", "size": "20x20"},
            {"filename": "AppIcon-20@3x.png", "idiom": "iphone", "scale": "3x", "size": "20x20"},
            {"filename": "AppIcon-29@2x.png", "idiom": "iphone", "scale": "2x", "size": "29x29"},
            {"filename": "AppIcon-29@3x.png", "idiom": "iphone", "scale": "3x", "size": "29x29"},
            {"filename": "AppIcon-40@2x.png", "idiom": "iphone", "scale": "2x", "size": "40x40"},
            {"filename": "AppIcon-40@3x.png", "idiom": "iphone", "scale": "3x", "size": "40x40"},
            {"filename": "AppIcon-60@2x.png", "idiom": "iphone", "scale": "2x", "size": "60x60"},
            {"filename": "AppIcon-60@3x.png", "idiom": "iphone", "scale": "3x", "size": "60x60"},
            {"filename": "AppIcon-20@2x.png", "idiom": "ipad", "scale": "2x", "size": "20x20"},
            {"filename": "AppIcon-29@2x.png", "idiom": "ipad", "scale": "2x", "size": "29x29"},
            {"filename": "AppIcon-40@2x.png", "idiom": "ipad", "scale": "2x", "size": "40x40"},
            {"filename": "AppIcon-76.png", "idiom": "ipad", "scale": "1x", "size": "76x76"},
            {"filename": "AppIcon-76@2x.png", "idiom": "ipad", "scale": "2x", "size": "76x76"},
            {"filename": "AppIcon-83.5@2x.png", "idiom": "ipad", "scale": "2x", "size": "83.5x83.5"},
            {"filename": "AppIcon-512@2x.png", "idiom": "ios-marketing", "scale": "1x", "size": "1024x1024"}
        ],
        "info": {
            "author": "xcode",
            "version": 1
        }
    }

    contents_path = os.path.join(ios_icon_path, 'Contents.json')
    with open(contents_path, 'w') as f:
        json.dump(contents, f, indent=2)
    print(f"  ✓ Contents.json")

def generate_splash_screens(source_img, base_path):
    """Generate all Android and iOS splash screens"""
    print("\n=== Generating Android Splash Screens ===")
    android_res_path = os.path.join(base_path, 'android', 'app', 'src', 'main', 'res')

    for folder, (width, height) in ANDROID_SPLASH_SIZES.items():
        folder_path = os.path.join(android_res_path, folder)
        os.makedirs(folder_path, exist_ok=True)

        # Create background
        splash = Image.new('RGB', (width, height), BACKGROUND_COLOR)

        # Calculate logo size (40% of the smallest dimension)
        min_dim = min(width, height)
        logo_size = int(min_dim * 0.4)

        # Resize logo
        logo = source_img.copy()
        logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)

        # Center the logo
        x = (width - logo.width) // 2
        y = (height - logo.height) // 2

        if logo.mode == 'RGBA':
            splash.paste(logo, (x, y), logo)
        else:
            splash.paste(logo, (x, y))

        output_path = os.path.join(folder_path, 'splash.png')
        splash.save(output_path, 'PNG')
        print(f"  ✓ {folder}/splash.png ({width}x{height})")

    print("\n=== Generating iOS Splash Screens ===")
    ios_splash_path = os.path.join(base_path, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset')
    os.makedirs(ios_splash_path, exist_ok=True)

    width, height = IOS_SPLASH_SIZE
    splash = Image.new('RGB', (width, height), BACKGROUND_COLOR)

    # Calculate logo size (40% of the smallest dimension)
    min_dim = min(width, height)
    logo_size = int(min_dim * 0.4)

    # Resize logo
    logo = source_img.copy()
    logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)

    # Center the logo
    x = (width - logo.width) // 2
    y = (height - logo.height) // 2

    if logo.mode == 'RGBA':
        splash.paste(logo, (x, y), logo)
    else:
        splash.paste(logo, (x, y))

    # iOS needs 3 versions (1x, 2x, 3x scales but same image for universal)
    for suffix in ['', '-1', '-2']:
        output_path = os.path.join(ios_splash_path, f'splash-2732x2732{suffix}.png')
        splash.save(output_path, 'PNG')
        print(f"  ✓ splash-2732x2732{suffix}.png ({width}x{height})")

    # Create/update Contents.json for iOS splash
    contents_json = {
        "images": [
            {"filename": "splash-2732x2732.png", "idiom": "universal", "scale": "1x"},
            {"filename": "splash-2732x2732-1.png", "idiom": "universal", "scale": "2x"},
            {"filename": "splash-2732x2732-2.png", "idiom": "universal", "scale": "3x"}
        ],
        "info": {
            "author": "xcode",
            "version": 1
        }
    }

    contents_path = os.path.join(ios_splash_path, 'Contents.json')
    with open(contents_path, 'w') as f:
        json.dump(contents_json, f, indent=2)
    print(f"  ✓ Contents.json")

def main():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Load the source icon
    icon_path = os.path.join(base_path, 'assets', 'icon-final.png')
    if not os.path.exists(icon_path):
        print(f"❌ Error: Icon file not found at {icon_path}")
        return

    print(f"📱 Loading source icon from: {icon_path}")
    source_img = Image.open(icon_path)
    print(f"   Source size: {source_img.size[0]}x{source_img.size[1]}")
    print(f"   Source mode: {source_img.mode}")

    # Generate all assets
    generate_android_icons(source_img, base_path)
    generate_ios_icons(source_img, base_path)
    generate_splash_screens(source_img, base_path)

    print("\n" + "="*50)
    print("✅ ALL ASSETS GENERATED SUCCESSFULLY!")
    print("="*50)
    print("\nGenerated:")
    print("  • Android icons (mipmap-*/ic_launcher*.png)")
    print("  • iOS icons (AppIcon.appiconset/*)")
    print("  • Android splash screens (drawable*/splash.png)")
    print("  • iOS splash screens (Splash.imageset/*)")

if __name__ == '__main__':
    main()
