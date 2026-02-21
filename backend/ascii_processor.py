from PIL import Image
from config import MAX_HEIGHT
import cv2
import numpy as np
import io

ASCII_CHARS = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "


def image_to_ascii(image: Image.Image) -> str:
    gray = image.convert("L")
    orig_w, orig_h = gray.size
    aspect = orig_h / orig_w

    # Рассчитываем высоту на основе MAX_HEIGHT
    height = MAX_HEIGHT
    width = max(1, int(height / aspect))

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


def pil_image_to_ascii(pil_img: Image.Image) -> tuple[str, int, int]:
    """Конвертирует PIL.Image в ASCII, возвращает (текст, ширина, высота)."""
    ascii_text = image_to_ascii(pil_img)
    lines = ascii_text.splitlines()
    width = max(len(line) for line in lines) if lines else 0
    height = len(lines)
    return ascii_text, width, height


def extract_frames_from_gif(image_data: bytes) -> list[Image.Image]:
    """Извлекает кадры из GIF."""
    gif = Image.open(io.BytesIO(image_data))
    frames = []
    try:
        while True:
            frames.append(gif.convert("RGB"))
            gif.seek(gif.tell() + 1)
    except EOFError:
        pass
    return frames if frames else [gif.convert("RGB")]


def extract_frames_from_video(video_data: bytes) -> tuple[list[np.ndarray], float]:
    """Извлекает кадры из видео, возвращает (кадры, fps)."""
    temp_path = "/tmp/video_temp.mp4"
    with open(temp_path, "wb") as f:
        f.write(video_data)

    cap = cv2.VideoCapture(temp_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0

    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frames.append(frame_rgb)

    cap.release()
    return frames, fps


def frames_to_ascii_batch(frames: list[Image.Image | np.ndarray]) -> list[tuple[str, int, int]]:
    """Конвертирует список кадров в ASCII."""
    results = []
    for frame in frames:
        if isinstance(frame, Image.Image):
            ascii_text, width, height = pil_image_to_ascii(frame)
        else:
            pil_img = Image.fromarray(frame)
            ascii_text, width, height = pil_image_to_ascii(pil_img)
        results.append((ascii_text, width, height))
    return results


def ascii_frames_to_video(
    ascii_results: list[tuple[str, int, int]],
    fps: float = 24.0,
    output_path: str = "/tmp/ascii_output.mp4"
) -> str:
    """Склеивает ASCII-кадры в видео."""
    if not ascii_results:
        raise ValueError("Нет кадров для обработки")

    max_width = max(r[1] for r in ascii_results)
    max_height = max(r[2] for r in ascii_results)

    char_w, char_h = 6, 12
    frame_w = max_width * char_w
    frame_h = max_height * char_h

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (frame_w, frame_h))

    for ascii_text, width, height in ascii_results:
        frame = np.zeros((frame_h, frame_w, 3), dtype=np.uint8)  # Чёрный фон
        lines = ascii_text.splitlines()
        for y, line in enumerate(lines):
            for x, char in enumerate(line[:max_width]):
                if char != ' ':
                    cv2.putText(
                        frame,
                        char,
                        (x * char_w + 2, (y + 1) * char_h - 2),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.4,
                        (255, 255, 255),
                        1,
                        cv2.LINE_AA
                    )
        out.write(frame)

    out.release()
    return output_path


def ascii_frames_to_gif(
    ascii_results: list[tuple[str, int, int]],
    duration: int = 100,
    output_path: str = "/tmp/ascii_output.gif"
) -> str:
    """Склеивает ASCII-кадры в GIF."""
    if not ascii_results:
        raise ValueError("Нет кадров для обработки")

    max_width = max(r[1] for r in ascii_results)
    max_height = max(r[2] for r in ascii_results)

    char_w, char_h = 6, 12
    frame_w = max_width * char_w
    frame_h = max_height * char_h

    frames = []
    for ascii_text, width, height in ascii_results:
        frame = np.zeros((frame_h, frame_w, 3), dtype=np.uint8)
        lines = ascii_text.splitlines()
        for y, line in enumerate(lines):
            for x, char in enumerate(line[:max_width]):
                if char != ' ':
                    cv2.putText(
                        frame,
                        char,
                        (x * char_w + 2, (y + 1) * char_h - 2),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.4,
                        (255, 255, 255),
                        1,
                        cv2.LINE_AA
                    )
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_frame = Image.fromarray(frame_rgb)
        frames.append(pil_frame.convert('L'))  # Конвертируем в оттенки серого для GIF

    if frames:
        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            duration=duration,
            loop=0
        )

    return output_path
