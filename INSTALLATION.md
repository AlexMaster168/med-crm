# Инструкция по установке Medical CRM

## Требования

- Node.js 18+ и npm
- MongoDB 5.0+
- Angular CLI (`npm install -g @angular/cli`)
- NestJS CLI (`npm install -g @nestjs/cli`)

## Установка

### 1. Распаковка проекта

```bash
tar -xzf medical-crm.tar.gz
cd medical-crm
```

### 2. Backend (NestJS)

```bash
cd backend
npm install
```

Настройте файл `.env`:
```
MONGODB_URI=mongodb://localhost:27017/medical-crm
JWT_ACCESS_SECRET=ваш-секретный-ключ-доступа
JWT_REFRESH_SECRET=ваш-секретный-ключ-обновления
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ваш-email@gmail.com
SMTP_PASSWORD=пароль-приложения-gmail
SMTP_FROM=Medical CRM <noreply@medicalcrm.com>
PORT=3000
FRONTEND_URL=http://localhost:4200
```

**Важно для SMTP:**
- Используйте пароль приложения Gmail (не основной пароль)
- Создайте пароль приложения в настройках безопасности Google

Загрузите тестовые данные:
```bash
npm run seed
```

Запустите сервер:
```bash
npm run start:dev
```

### 3. Frontend (Angular)

```bash
cd ../frontend
npm install
ng serve
```

Приложение будет доступно по адресу: `http://localhost:4200`

## Тестовые учетные записи

После выполнения `npm run seed` будут созданы:

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

### MongoDB не запускается
```bash
sudo systemctl start mongodb
sudo systemctl status mongodb
```

### Ошибка CORS
Убедитесь что в `main.ts` backend включен CORS:
```typescript
app.enableCors();
```

### Ошибка SMTP
- Проверьте пароль приложения Gmail
- Включите "Небезопасные приложения" в настройках Gmail
- Используйте пароль приложения вместо основного пароля

### Порты заняты
- Backend по умолчанию на порту 3000
- Frontend по умолчанию на порту 4200
- Измените порты в конфигурационных файлах при необходимости

## Разработка

### Backend
```bash
cd backend
npm run start:dev
```

### Frontend
```bash
cd frontend
ng serve --open
```

### База данных
Сброс и пересоздание тестовых данных:
```bash
cd backend
npm run seed
```

## Production

### Backend
```bash
cd backend
npm run build
node dist/main
```

### Frontend
```bash
cd frontend
ng build --configuration production
```

Скомпилированные файлы будут в `frontend/dist/medical-crm/`
