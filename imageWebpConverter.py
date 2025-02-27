import os
from PIL import Image

def compress_images(input_folder, output_folder, quality=80):
    """Compress all images in input_folder and save as WebP in output_folder."""
    
    # Ensure output folder exists
    os.makedirs(output_folder, exist_ok=True)
    
    # Supported image formats
    valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff')

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(valid_extensions):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, os.path.splitext(filename)[0] + ".webp")

            try:
                # Open image
                img = Image.open(input_path)
                
                # Convert to RGB (some images may have transparency issues)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                
                # Save as WebP with compression
                img.save(output_path, "WEBP", quality=quality)
                print(f"✅ Compressed: {filename} → {output_path}")

            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")

# Example usage
input_folder = "input_images"   # Change to your source folder
output_folder = "compressed_images"  # Change to your output folder

compress_images(input_folder, output_folder, quality=80)

