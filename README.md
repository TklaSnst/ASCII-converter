# ASCII Converter

Конвертер изображений в ASCII-арт с веб-интерфейсом.

## Структура проекта

```
ascii-converter/
├── backend/              # FastAPI сервер
│   ├── ascii_processor.py  # Логика конвертации изображений
│   ├── config.py           # Конфигурация (MAX_WIDTH, MAX_HEIGHT)
│   ├── main.py             # API эндпоинты
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # React клиент
│   ├── src/
│   │   ├── App.jsx         # Основное приложение
│   │   ├── main.jsx        # Точка входа
│   │   └── index.css       # Стили
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf          # Конфигурация nginx
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml      # Конфигурация Docker
├── .gitignore
└── README.md
```

## Требования

- Docker
- Docker Compose

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd ascii-converter
```

### 2. Запуск через Docker Compose

```bash
# Сборка и запуск всех сервисов
docker compose up --build

# Или в фоновом режиме
docker compose up -d --build
```

### 3. Проверка работы

После запуска доступны:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API документация (Swagger)**: http://localhost:8000/docs

### 4. Остановка

```bash
docker compose down
```

## Конфигурация

### Изменение размеров ASCII-арта

Откройте `backend/config.py`:

```python
MAX_WIDTH = 90    # Максимальная ширина в символах
MAX_HEIGHT = 60   # Максимальная высота в символах
```

### Изменение набора символов

В `backend/ascii_processor.py` переменная `ASCII_CHARS`:

```python
ASCII_CHARS = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
```

Символы должны быть отсортированы от тёмного к светлому.

