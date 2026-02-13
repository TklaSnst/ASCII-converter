# ASCII Converter

Проект на FastAPI + React с запуском через Docker Compose.

## Структура проекта

- `backend/` - FastAPI приложение
- `frontend/` - React приложение
- `docker-compose.yml` - конфигурация для запуска обоих сервисов

## Запуск проекта

### Требования
- Docker
- Docker Compose

### Команды

Запуск всех сервисов:
```bash
docker compose up --build
```

Запуск в фоновом режиме:
```bash
docker compose up -d --build
```

Остановка:
```bash
docker compose down
```

## Проверка работы

После запуска доступны:

- **Frontend (React)**: http://localhost:3000
  - На странице отображается статус работы React и FastAPI

- **Backend (FastAPI)**: http://localhost:8000
  - Документация API: http://localhost:8000/docs
  - Эндпоинт проверки: http://localhost:8000/api/health

## Эндпоинты для проверки

### FastAPI
- `GET /api/health` - возвращает статус работы API

### React
- Компонент `App.js` отображает статус работы React и проверяет подключение к FastAPI
