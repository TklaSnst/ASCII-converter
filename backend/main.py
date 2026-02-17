from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import PlainTextResponse
from PIL import Image
import io

from ascii_processor import image_to_ascii

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


@app.get("/api/download-ascii")
async def download_ascii(text: str = Query(...)):
    return PlainTextResponse(text, media_type="text/plain", headers={"Content-Disposition": "attachment; filename=ascii-art.txt"})
