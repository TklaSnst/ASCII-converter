from PIL import Image
from config import MAX_WIDTH, MAX_HEIGHT

ASCII_CHARS = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "

CELL_ASPECT = 2.2


def image_to_ascii(image: Image.Image) -> str:
    gray = image.convert("L")
    orig_w, orig_h = gray.size
    aspect = orig_h / orig_w

    height = max(1, int(MAX_WIDTH * aspect / CELL_ASPECT))
    height = min(height, MAX_HEIGHT)
    width = max(1, int(height * CELL_ASPECT / aspect))
    width = min(width, MAX_WIDTH)

    small = gray.resize((width, height), Image.Resampling.LANCZOS)
    pixels = small.load()

    lines = []
    for y in range(height):
        row = []
        for x in range(width):
            brightness = pixels[x, y]
            idx = int((255 - brightness) / 256 * len(ASCII_CHARS))
            idx = min(idx, len(ASCII_CHARS) - 1)
            row.append(ASCII_CHARS[idx])
        lines.append("".join(row))
    return "\n".join(lines)
