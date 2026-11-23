# Документация по переменным окружения MAITE.AI

## Переменные, которые необходимо получить у продукта

Перед запуском приложения необходимо получить следующие переменные от команды продукта:

- `API_TOKEN` - Токен Telegram бота
- `WEBHOOK_URL` - URL для webhook Telegram бота

## Основные переменные в файле .env

```env
#Telegram necessary
API_TOKEN=
WEBHOOK_URL=

#Postgres
PG_PORT=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=-db
PG_HOST=
DB_POSTGRE=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${PG_HOST}:${PG_PORT}/${POSTGRES_DB}

#Backend port configuration
WEBAPP_PORT=

PG_CONTAINER_NAME=
BACKEND_CONTAINER_NAME=
```
 
## Описание переменных
 
### Telegram настройки

| Переменная | Назначение | Пример значения |
|------------|------------|-----------------|
| `API_TOKEN` | Токен Telegram бота для взаимодействия с API | `65828fe911:AAGxbXeIqZVaF5M18uNpyLQAvBQtJweAczE` |
| `WEBHOOK_URL` | URL для настройки webhook Telegram бота | `https://near-arrival-ready-calling.trycloudflare.com` |



### База данных PostgreSQL

| Переменная | Назначение | Пример значения |
|------------|------------|-----------------|
| `PG_PORT` | Порт PostgreSQL | `5432` |
| `POSTGRES_USER` | Имя пользователя PostgreSQL | `exchangeuser` |
| `POSTGRES_PASSWORD` | Пароль для подключения к БД | `qwwer7283hecwc` |
| `POSTGRES_DB` | Название базы данных | `Exchangebot-db` |
| `PG_HOST` | Хост базы данных PostgreSQL | `db` |
| `DB_POSTGRE` | Полная строка подключения к PostgreSQL | `postgresql+asyncpg://...` |

### Конфигурация Docker и портов

| Переменная | Назначение | Пример значения |
|------------|------------|-----------------|
| `WEBAPP_PORT` | Порт для запуска веб-приложения | `8080` |
| `PG_CONTAINER_NAME` | Имя Docker-контейнера для PostgreSQL | `test-dev-psql` |
| `BACKEND_CONTAINER_NAME` | Имя Docker-контейнера для бэкенда | `test-dev-backend` |

> **Примечание**: Переменная `DB_POSTGRE` автоматически формируется из других переменных PostgreSQL и используется для подключения к базе данных через asyncpg драйвер.

## Запуск приложения

Для запуска приложения с помощью Docker Compose выполните команду:

```bash
docker compose up --build
```

Эта команда соберет и запустит все контейнеры, указанные в docker-compose.yml файле, используя переменные окружения из .env файла.
