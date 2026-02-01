# Medical CRM System

Полноценная медицинская CRM система с функционалом для врачей и пациентов.

## Функциональность

### Аутентификация
- Регистрация и авторизация
- Access и Refresh токены
- Восстановление пароля через SMTP

### Роли
- **Врач**: указание специализации (хирург, терапевт, кардиолог и тд)
  - Просмотр записей пациентов на прием
  - Доступ к медицинским картам пациентов
  - Добавление записей в медкарту

- **Пациент**:
  - Просмотр доступных врачей и их расписания
  - Запись на прием к врачу
  - Заключение договора с терапевтом (семейный врач)
  - Просмотр своей медицинской карты

### База данных
- Автоматическое создание 10 тестовых записей при запуске
- MongoDB для хранения данных

## Установка

### Backend (NestJS)
```bash
cd backend
npm install
# Настройте .env файл
npm run seed  # Загрузка тестовых данных
npm run start:dev
```

### Frontend (Angular)
```bash
cd frontend
npm install
ng serve
```

## Структура проекта

```
medical-crm/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/    # Аутентификация
│   │   ├── appointments/  # Записи на прием
│   │   ├── medical-cards/ # Медицинские карты
│   │   ├── family-doctors/ # Семейные врачи
│   │   └── seeder/  # Тестовые данные
│   └── .env
└── frontend/         # Angular приложение
    └── src/
        ├── app/
        │   ├── auth/
        │   ├── doctor/
        │   └── patient/
        └── environments/
```

## Конфигурация

### Backend .env
```
MONGODB_URI=mongodb://localhost:27017/medical-crm
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## API Endpoints

### Auth
- POST /auth/register - Регистрация
- POST /auth/login - Вход
- POST /auth/refresh - Обновление токена
- POST /auth/forgot-password - Запрос на восстановление пароля
- POST /auth/reset-password - Сброс пароля
- POST /auth/logout - Выход
- GET /auth/me - Текущий пользователь

### Appointments
- POST /appointments - Создать запись
- GET /appointments/my - Мои записи
- GET /appointments/doctor - Записи врача
- GET /appointments/:id - Получить запись
- PATCH /appointments/:id - Обновить запись
- DELETE /appointments/:id - Удалить запись
- GET /appointments/doctors - Доступные врачи

### Medical Cards
- GET /medical-cards/my - Моя медкарта
- GET /medical-cards/patient/:id - Медкарта пациента
- POST /medical-cards/record - Добавить запись
- PATCH /medical-cards - Обновить медкарту

### Family Doctors
- POST /family-doctors - Заключить договор
- GET /family-doctors/my - Мой семейный врач
- GET /family-doctors/patients - Мои пациенты

## Тестовые данные

После выполнения `npm run seed` будут созданы:
- 3 врача разных специальностей
- 7 пациентов
- 10 записей на прием
- Медицинские карты для пациентов
