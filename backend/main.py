from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image
import io

app = FastAPI(title="ASCII Converter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    Обрабатывает загруженное изображение.
    Пока что просто возвращает то же изображение обратно.
    """
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    
    output = io.BytesIO()
    if image.format:
        image.save(output, format=image.format)
    else:
        image.save(output, format='PNG')
    output.seek(0)
    
    return Response(content=output.read(), media_type=f"image/{image.format.lower() if image.format else 'png'}")
