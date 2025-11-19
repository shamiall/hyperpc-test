# My Medusa Store

Кастомный бэкенд Medusa с интегрированным API конвертации валют.

## Быстрый старт

### Требования
- Docker и Docker Compose
- Node.js v20+ (для локальной разработки)
- Yarn

### Запуск через Docker (Рекомендуется)

Команды для работы с Docker.

1. **Сборка контейнеров:**
   ```bash
   yarn docker:server:build
   ```

2. **Запуск сервера:**
   ```bash
   yarn docker:server:up
   ```

Сервер будет доступен по адресу: `http://localhost:9000`

### Полезные команды

| Команда | Описание |
|---------|----------|
| `yarn docker:server:build` | Пересобрать Docker образ (нужно после изменения кода) |
| `yarn docker:server:up` | Запустить сервер и Redis |
| `yarn test:integration:http` | Запустить интеграционные тесты |

## 📚 API Документация

В проект добавлен модуль конвертации валют.

- **Базовый URL:** `http://localhost:9000`
- **Подробная документация:** [src/api/README.md](./src/api/README.md)

### Основные эндпоинты

- `GET /currency/convert` - Конвертация валюты
- `GET /currency/supported` - Список поддерживаемых валют
- `GET /currency/health` - Проверка здоровья сервиса

Пример запроса:
```bash
curl "http://localhost:9000/currency/convert?amount=100&from=USD&to=RUB"
```

## 🛠 Конфигурация

Создайте файл `.env` в корне проекта, если его нет:

```env
MEDUSA_ADMIN_ONBOARDING_TYPE=default
STORE_CORS=http://localhost:8000,https://docs.medusajs.com
ADMIN_CORS=http://localhost:5173,http://localhost:9000,https://docs.medusajs.com
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:8000,https://docs.medusajs.com
JWT_SECRET=supersecret
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hyperpcDB
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=9000
EXCHANGE_RATE_API_KEY=895b3330651d7ac3b425c12d
```

## 📂 Структура проекта

- `src/api` - Кастомные API эндпоинты
- `src/api/currency` - Модуль конвертации валют
- `medusa-config.ts` - Конфигурация Medusa
- `docker-compose.yaml` - Настройка сервисов Docker
