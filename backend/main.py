from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

from ascii_processor import image_to_ascii

app = FastAPI(title="ASCII Converter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "FastAPI is working!"}


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "fastapi"}


@app.post("/api/process-image")
async def process_image(file: UploadFile = File(...)):
    """
    Обрабатывает загруженное изображение: конвертирует в ASCII-арт и возвращает текст.
    """
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    ascii_text = image_to_ascii(image, width=120)
    return {"ascii": ascii_text}
