from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import PlainTextResponse, FileResponse
from PIL import Image
import io
import os

from ascii_processor import (
    image_to_ascii,
    pil_image_to_ascii,
    extract_frames_from_gif,
    extract_frames_from_video,
    frames_to_ascii_batch,
    ascii_frames_to_video,
    ascii_frames_to_gif,
)

app = FastAPI(title="ASCII Converter API")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "fastapi"}


@app.post("/api/process-image")
async def process_image(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    ascii_text = image_to_ascii(image)
    lines = ascii_text.splitlines()
    width = max(len(line) for line in lines) if lines else 0
    height = len(lines)
    return {"ascii": ascii_text, "width": width, "height": height}


@app.post("/api/process-gif")
async def process_gif(file: UploadFile = File(...)):
    """Обрабатывает GIF и возвращает ASCII-кадры."""
    image_data = await file.read()
    frames = extract_frames_from_gif(image_data)
    ascii_results = frames_to_ascii_batch(frames)
    
    if not ascii_results:
        return {"error": "Не удалось извлечь кадры"}
    
    ascii_text = "\n---FRAME---\n".join(r[0] for r in ascii_results)
    width = max(r[1] for r in ascii_results)
    height = max(r[2] for r in ascii_results)
    
    return {
        "ascii": ascii_text,
        "width": width,
        "height": height,
        "frames": len(ascii_results),
        "type": "gif"
    }


@app.post("/api/process-video")
async def process_video(file: UploadFile = File(...)):
    """Обрабатывает видео и возвращает ASCII-кадры."""
    video_data = await file.read()
    frames, fps = extract_frames_from_video(video_data)
    ascii_results = frames_to_ascii_batch(frames)
    
    if not ascii_results:
        return {"error": "Не удалось извлечь кадры"}
    
    ascii_text = "\n---FRAME---\n".join(r[0] for r in ascii_results)
    width = max(r[1] for r in ascii_results)
    height = max(r[2] for r in ascii_results)
    
    return {
        "ascii": ascii_text,
        "width": width,
        "height": height,
        "frames": len(ascii_results),
        "fps": fps,
        "type": "video"
    }


@app.get("/api/download-ascii")
async def download_ascii(text: str = Query(...)):
    return PlainTextResponse(text, media_type="text/plain", headers={"Content-Disposition": "attachment; filename=ascii-art.txt"})


@app.post("/api/convert-gif")
async def convert_gif(file: UploadFile = File(...)):
    """Конвертирует GIF в ASCII GIF и возвращает файл."""
    image_data = await file.read()
    frames = extract_frames_from_gif(image_data)
    ascii_results = frames_to_ascii_batch(frames)
    
    if not ascii_results:
        return {"error": "Не удалось извлечь кадры"}
    
    output_path = ascii_frames_to_gif(ascii_results, duration=100)
    
    return FileResponse(
        output_path,
        media_type="image/gif",
        filename="ascii-animation.gif"
    )


@app.post("/api/convert-video")
async def convert_video(file: UploadFile = File(...)):
    """Конвертирует видео в ASCII видео и возвращает файл."""
    video_data = await file.read()
    frames, fps = extract_frames_from_video(video_data)
    ascii_results = frames_to_ascii_batch(frames)
    
    if not ascii_results:
        return {"error": "Не удалось извлечь кадры"}
    
    output_path = ascii_frames_to_video(ascii_results, fps=fps)
    
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename="ascii-video.mp4"
    )
