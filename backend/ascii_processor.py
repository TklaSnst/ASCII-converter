"""
Преобразование изображения в ASCII-арт и рендеринг в изображение.
"""
from PIL import Image, ImageDraw, ImageFont
import io

# Символы от тёмного к светлому (по плотности заливки)
ASCII_CHARS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"


def image_to_ascii(image: Image.Image, width: int = 120, height: int | None = None) -> str:
    """
    Конвертирует изображение в строку ASCII-символов.

    :param image: исходное изображение (PIL Image)
    :param width: количество символов по ширине (число столбцов)
    :param height: количество строк (если None — вычисляется по пропорциям)
    :return: многострочная строка с ASCII-артом
    """
    gray = image.convert("L")
    orig_w, orig_h = gray.size

    if height is None:
        # Сохраняем пропорции: высота в символах ~ (orig_h / orig_w) * width * (примерно 0.5 из-за высоты символа)
        aspect = orig_h / orig_w
        cell_aspect = 2.2  # символ в консоли обычно выше, чем широкий
        height = max(1, int(width * aspect / cell_aspect))

    small = gray.resize((width, height), Image.Resampling.LANCZOS)
    pixels = small.load()

    lines = []
    for y in range(height):
        row = []
        for x in range(width):
            brightness = pixels[x, y]
            # 0..255 -> индекс в ASCII_CHARS (0 = самый тёмный символ)
            idx = int((255 - brightness) / 256 * len(ASCII_CHARS))
            idx = min(idx, len(ASCII_CHARS) - 1)
            row.append(ASCII_CHARS[idx])
        lines.append("".join(row))
    return "\n".join(lines)


def ascii_to_image(
    ascii_text: str,
    font_size: int = 10,
    bg_color: tuple[int, int, int] = (0, 0, 0),
    fg_color: tuple[int, int, int] = (200, 200, 200),
) -> Image.Image:
    """
    Рендерит текст ASCII-арта в изображение (моноширинный шрифт).

    :param ascii_text: многострочная строка с ASCII-артом
    :param font_size: размер шрифта в пикселях
    :param bg_color: цвет фона (R, G, B)
    :param fg_color: цвет символов (R, G, B)
    :return: PIL Image
    """
    lines = ascii_text.splitlines()
    if not lines:
        lines = [""]

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", font_size)
    except OSError:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf", font_size)
        except OSError:
            font = ImageFont.load_default()

    # Размер одной ячейки символа (приблизительно)
    try:
        bbox = font.getbbox("W")
        cell_w = bbox[2] - bbox[0]
        cell_h = bbox[3] - bbox[1]
    except Exception:
        cell_w = font_size
        cell_h = int(font_size * 1.2)

    cols = max(len(line) for line in lines)
    rows = len(lines)
    img_w = cols * cell_w
    img_h = rows * cell_h

    img = Image.new("RGB", (img_w, img_h), bg_color)
    draw = ImageDraw.Draw(img)

    for y, line in enumerate(lines):
        for x, char in enumerate(line):
            draw.text((x * cell_w, y * cell_h), char, font=font, fill=fg_color)

    return img


def process_image_to_ascii_image(
    image: Image.Image,
    width: int = 120,
    font_size: int = 8,
    bg_color: tuple[int, int, int] = (0, 0, 0),
    fg_color: tuple[int, int, int] = (200, 200, 200),
) -> Image.Image:
    """
    Полный пайплайн: изображение -> ASCII-текст -> изображение с ASCII-артом.

    :param image: исходное изображение
    :param width: количество символов по ширине
    :param font_size: размер шрифта в результирующей картинке
    :param bg_color: цвет фона
    :param fg_color: цвет символов
    :return: PIL Image (RGB)
    """
    ascii_art = image_to_ascii(image, width=width)
    return ascii_to_image(ascii_art, font_size=font_size, bg_color=bg_color, fg_color=fg_color)


def process_image_to_ascii_bytes(
    image: Image.Image,
    width: int = 120,
    font_size: int = 8,
    bg_color: tuple[int, int, int] = (0, 0, 0),
    fg_color: tuple[int, int, int] = (200, 200, 200),
    format: str = "PNG",
) -> bytes:
    """
    Конвертирует изображение в ASCII-арт и возвращает PNG (или другой формат) в виде bytes.
    """
    out_img = process_image_to_ascii_image(
        image, width=width, font_size=font_size, bg_color=bg_color, fg_color=fg_color
    )
    buf = io.BytesIO()
    out_img.save(buf, format=format)
    buf.seek(0)
    return buf.read()
