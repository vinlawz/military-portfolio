from PIL import Image, ImageDraw, ImageFont
import os

# Create a simple logo
width, height = 200, 60
image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)

# Try to use a nice font, fallback to default if not available
try:
    font = ImageFont.truetype("arial.ttf", 24)
except:
    font = ImageFont.load_default()

# Draw text with neon green color
text = "CodeWithVin"
text_color = (39, 255, 20)  # Neon green

# Get text bounding box
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
x = (width - text_width) // 2
y = (height - text_height) // 2

draw.text((x, y), text, fill=text_color, font=font)

# Save the logo
logo_path = os.path.join('static', 'images', 'codewithvin-logo.png')
image.save(logo_path, 'PNG')
print(f"Logo saved to {logo_path}")
