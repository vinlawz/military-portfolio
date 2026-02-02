from PIL import Image, ImageDraw, ImageFont
import os

# Create a 32x32 favicon
size = 32
image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)

# Draw a simple military-style "V" for Vinlawz
# Background circle
draw.ellipse([2, 2, 30, 30], fill=(57, 255, 20, 255))  # Neon green circle

# Draw "V" in black
points = [
    (8, 10),  # Left top
    (16, 22), # Bottom center
    (24, 10)  # Right top
]
draw.polygon(points, fill=(0, 0, 0, 255))

# Save the favicon
favicon_path = os.path.join('static', 'favicon.ico')
image.save(favicon_path, 'ICO')
print(f"Favicon saved to {favicon_path}")

# Also save as PNG for better compatibility
png_path = os.path.join('static', 'favicon.png')
image.save(png_path, 'PNG')
print(f"Favicon PNG saved to {png_path}")
