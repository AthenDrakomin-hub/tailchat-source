import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import math
import os

def create_background():
    w, h = 1920, 1080
    
    # Create base gradient (Dark Navy Blue)
    y = np.linspace(0, 1, h)
    x = np.linspace(0, 1, w)
    X, Y = np.meshgrid(x, y)
    
    # Radial gradient from bottom right (Warm Golden Glow)
    cx, cy = 0.8, 0.8
    R = np.sqrt((X - cx)**2 + (Y - cy)**2)
    
    # Base dark blue: RGB (5, 10, 25) to (10, 20, 50)
    # Glow gold: RGB (212, 175, 55)
    
    r = 5 + 10 * Y + 100 * np.exp(-R * 2)
    g = 10 + 15 * Y + 80 * np.exp(-R * 2)
    b = 25 + 25 * Y + 20 * np.exp(-R * 2)
    
    r = np.clip(r, 0, 255).astype(np.uint8)
    g = np.clip(g, 0, 255).astype(np.uint8)
    b = np.clip(b, 0, 255).astype(np.uint8)
    
    rgb = np.dstack((r, g, b))
    img = Image.fromarray(rgb, 'RGB')
    
    # Layer for drawing lines and planes
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Draw architectural planes (polygons with low opacity)
    planes = [
        [(0, h), (w*0.3, h), (w*0.5, 0), (0, 0)],
        [(w*0.7, h), (w, h), (w, 0), (w*0.8, 0)],
        [(w*0.4, h), (w*0.6, h), (w*0.9, 0), (w*0.5, 0)]
    ]
    for p in planes:
        draw.polygon(p, fill=(255, 255, 255, 3))
        
    # Draw glowing golden geometric lines
    gold = (212, 175, 55, 100)
    gold_bright = (255, 220, 100, 200)
    
    # Perspective lines
    for i in range(0, h*2, 150):
        draw.line([(0, i), (w, i - h*0.5)], fill=(255, 255, 255, 10), width=1)
        
    # Main guiding lines
    draw.line([(w*0.1, h), (w*0.6, 0)], fill=gold, width=3)
    draw.line([(w*0.3, h), (w*0.8, 0)], fill=gold, width=1)
    draw.line([(0, h*0.8), (w, h*0.2)], fill=gold_bright, width=2)
    
    # Big Dipper (Constellation motif)
    stars = [
        (w * 0.25, h * 0.35),
        (w * 0.32, h * 0.38),
        (w * 0.40, h * 0.45),
        (w * 0.48, h * 0.55),
        (w * 0.58, h * 0.50),
        (w * 0.68, h * 0.48),
        (w * 0.80, h * 0.35)
    ]
    
    for i in range(len(stars)-1):
        draw.line([stars[i], stars[i+1]], fill=(212, 175, 55, 80), width=2)
        
    for star in stars:
        sx, sy = star
        # Glow
        draw.ellipse((sx-12, sy-12, sx+12, sy+12), fill=(212, 175, 55, 30))
        # Core
        draw.ellipse((sx-3, sy-3, sx+3, sy+3), fill=(255, 255, 255, 255))

    # Add a slight blur to the overlay to make it cinematic
    overlay_blurred = overlay.filter(ImageFilter.GaussianBlur(radius=1.5))
    
    # Add some sharp lines on top
    sharp_overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sharp_draw = ImageDraw.Draw(sharp_overlay)
    for star in stars:
        sx, sy = star
        sharp_draw.ellipse((sx-1.5, sy-1.5, sx+1.5, sy+1.5), fill=(255, 255, 255, 255))
    sharp_draw.line([(0, h*0.8), (w, h*0.2)], fill=(255, 255, 255, 150), width=1)
    
    final_img = Image.alpha_composite(img.convert('RGBA'), overlay_blurred)
    final_img = Image.alpha_composite(final_img, sharp_overlay)
    
    out_dir = '/workspace/client/web/assets/images/custom'
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'ridou-bg-canvas.png')
    final_img.convert('RGB').save(out_path, quality=95)
    print("Masterpiece saved to", out_path)

if __name__ == '__main__':
    create_background()
