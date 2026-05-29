# Инструкция по установке Medical CRM

## Требования

- Node.js 20.11+
- pnpm 10 (`npm install -g pnpm@10`)
- MongoDB 5.0+

> Глобальные Angular/NestJS CLI ставить не нужно — они подтягиваются как зависимости проекта.

## Установка (Windows)

### 1. MongoDB

```powershell
winget install MongoDB.Server
```

Ставится как служба `MongoDB`, слушает `localhost:27017`, автозапуск при старте системы.
Проверка: `Get-Service MongoDB` → должно быть `Running`.

### 2. Зависимости проекта

Из корня репозитория:
```powershell
pnpm install:all   # корень + backend + frontend за один заход
```

### 3. Конфигурация (опционально)

Все переменные имеют дефолты, поэтому для локалки `.env` не обязателен. Если нужно переопределить (свои JWT-секреты, SMTP и т.д.):

```powershell
Copy-Item backend\.env.example backend\.env
```

Все доступные переменные с пояснениями — в [backend/.env.example](backend/.env.example).

**Важно для SMTP:** используйте пароль приложения Gmail (не основной пароль аккаунта). Если SMTP не задан — отправка писем просто отключается.

### 4. Тестовые данные

```powershell
pnpm --dir backend run seed
```

### 5. Запуск — одной командой

```powershell
pnpm dev
```

Поднимает бэк (`:3000`) и фронт (`:4200`) параллельно. Браузер откроется сам.
Приложение: `http://localhost:4200`

## Тестовые учетные записи

После выполнения `pnpm --dir backend run seed` будут созданы:

**Врачи:**
- Email: `petrov@hospital.com` | Пароль: `password123` | Роль: Терапевт
- Email: `sidorova@hospital.com` | Пароль: `password123` | Роль: Хирург
- Email: `kovalenko@hospital.com` | Пароль: `password123` | Роль: Кардиолог

**Пациенты:**
- Email: `ivanova@mail.com` | Пароль: `password123`
- Email: `smirnov@mail.com` | Пароль: `password123`
- Email: `vasilyeva@mail.com` | Пароль: `password123`
- И еще 4 пациента

## Использование

### Для пациента:

1. Войдите с учетными данными пациента
2. Просмотр доступных врачей и запись на прием
3. Просмотр медицинской карты
4. Заключение договора с терапевтом (семейный врач)

### Для врача:

1. Войдите с учетными данными врача
2. Просмотр записей пациентов
3. Просмотр и редактирование медицинских карт
4. Добавление записей в медкарты
5. Просмотр списка пациентов (для терапевтов)

## Структура API

### Аутентификация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `POST /auth/refresh` - Обновление токена
- `POST /auth/forgot-password` - Восстановление пароля
- `POST /auth/reset-password` - Сброс пароля
- `POST /auth/logout` - Выход

### Записи на прием
- `POST /appointments` - Создать запись
- `GET /appointments/my` - Мои записи (пациент)
- `GET /appointments/doctor` - Записи врача
- `GET /appointments/doctors` - Список врачей
- `PATCH /appointments/:id` - Обновить запись
- `DELETE /appointments/:id` - Удалить запись

### Медицинские карты
- `GET /medical-cards/my` - Моя медкарта (пациент)
- `GET /medical-cards/patient/:id` - Медкарта пациента (врач)
- `POST /medical-cards/record` - Добавить запись (врач)
- `PATCH /medical-cards` - Обновить медкарту

### Семейный врач
- `POST /family-doctors` - Заключить договор
- `GET /family-doctors/my` - Мой семейный врач
- `GET /family-doctors/patients` - Мои пациенты (врач)
- `DELETE /family-doctors` - Расторгнуть договор

## Troubleshooting

### `ERR_CONNECTION_REFUSED` на `:3000` / бэк молча не стартует
Почти всегда — не запущена MongoDB (бэк не может подключиться к базе и падает на старте). Проверьте и запустите службу:
```powershell
Get-Service MongoDB      # ожидаем Status: Running
Start-Service MongoDB    # если остановлена
```

### Ошибка CORS
CORS включён в [backend/src/main.ts](backend/src/main.ts) и берёт источники из `CORS_ORIGIN` (по умолчанию `http://localhost:4200`). Если фронт на другом адресе — пропишите его в `backend/.env`.

### Ошибка SMTP
- Используйте пароль приложения Gmail вместо основного пароля
- Если SMTP не настроен — это не ошибка, отправка писем просто отключается

### Порты заняты
- Backend по умолчанию на порту 3000 — меняется через `PORT` в `backend/.env`
- Frontend по умолчанию на порту 4200 — меняется флагом `--port` в скрипте `start` ([frontend/package.json](frontend/package.json))

## Разработка

### Запуск фронта и бэка вместе
```powershell
pnpm dev   # из корня репозитория
```

### По отдельности
```powershell
pnpm --dir backend run start:dev   # бэк (watch)
pnpm --dir frontend run start      # фронт
```

### База данных
Сброс и пересоздание тестовых данных:
```powershell
pnpm --dir backend run seed
```

## Production

### Сборка обоих проектов
```powershell
pnpm build   # из корня, собирает backend и frontend параллельно
```

### Backend
```powershell
pnpm --dir backend run start:prod   # node dist/main.js
```

### Frontend
```powershell
pnpm --dir frontend run build:prod
```

Скомпилированные файлы фронта будут в `frontend/dist/`
