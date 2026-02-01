# Структура проекта Medical CRM

```
medical-crm/
├── backend/                           # NestJS Backend
│   ├── src/
│   │   ├── auth/                      # Модуль аутентификации
│   │   │   ├── strategies/            # JWT стратегии
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── refresh-jwt.strategy.ts
│   │   │   ├── guards/                # Guards для защиты роутов
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── decorators/            # Декораторы
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   ├── public.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   ├── auth.controller.ts     # Контроллер авторизации
│   │   │   ├── auth.service.ts        # Сервис авторизации
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── appointments/              # Модуль записей на прием
│   │   │   ├── appointments.controller.ts
│   │   │   ├── appointments.service.ts
│   │   │   └── appointments.module.ts
│   │   │
│   │   ├── medical-cards/             # Модуль медицинских карт
│   │   │   ├── medical-cards.controller.ts
│   │   │   ├── medical-cards.service.ts
│   │   │   └── medical-cards.module.ts
│   │   │
│   │   ├── family-doctors/            # Модуль семейных врачей
│   │   │   ├── family-doctors.controller.ts
│   │   │   ├── family-doctors.service.ts
│   │   │   └── family-doctors.module.ts
│   │   │
│   │   ├── mail/                      # Модуль отправки email
│   │   │   ├── mail.service.ts
│   │   │   └── mail.module.ts
│   │   │
│   │   ├── schemas/                   # MongoDB схемы
│   │   │   ├── user.schema.ts
│   │   │   ├── appointment.schema.ts
│   │   │   ├── medical-card.schema.ts
│   │   │   └── family-doctor.schema.ts
│   │   │
│   │   ├── dto/                       # Data Transfer Objects
│   │   │   ├── auth.dto.ts
│   │   │   ├── appointment.dto.ts
│   │   │   └── medical-card.dto.ts
│   │   │
│   │   ├── seeder/                    # Заполнение БД тестовыми данными
│   │   │   └── seed.ts
│   │   │
│   │   ├── app.module.ts              # Главный модуль приложения
│   │   └── main.ts                    # Точка входа
│   │
│   ├── .env                           # Переменные окружения
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
└── frontend/                          # Angular Frontend
    ├── src/
    │   ├── app/
    │   │   ├── auth/                  # Компоненты авторизации
    │   │   │   ├── login/
    │   │   │   │   ├── login.component.ts
    │   │   │   │   ├── login.component.html
    │   │   │   │   └── login.component.css
    │   │   │   └── register/
    │   │   │       ├── register.component.ts
    │   │   │       ├── register.component.html
    │   │   │       └── register.component.css
    │   │   │
    │   │   ├── patient/               # Компоненты для пациента
    │   │   │   ├── appointments/      # Мои записи
    │   │   │   ├── doctors/           # Список врачей и запись
    │   │   │   ├── medical-card/      # Медкарта
    │   │   │   └── family-doctor/     # Семейный врач
    │   │   │
    │   │   ├── doctor/                # Компоненты для врача
    │   │   │   ├── appointments/      # Записи пациентов
    │   │   │   ├── patient-card/      # Просмотр медкарты
    │   │   │   └── patients/          # Список пациентов
    │   │   │
    │   │   ├── services/              # Сервисы
    │   │   │   ├── auth.service.ts
    │   │   │   ├── appointments.service.ts
    │   │   │   ├── medical-card.service.ts
    │   │   │   └── family-doctor.service.ts
    │   │   │
    │   │   ├── models/                # Модели данных
    │   │   │   ├── user.model.ts
    │   │   │   ├── appointment.model.ts
    │   │   │   └── medical-card.model.ts
    │   │   │
    │   │   ├── guards/                # Route Guards
    │   │   │   ├── auth.guard.ts
    │   │   │   └── role.guard.ts
    │   │   │
    │   │   ├── interceptors/          # HTTP Interceptors
    │   │   │   └── auth.interceptor.ts
    │   │   │
    │   │   ├── app.component.ts       # Главный компонент
    │   │   ├── app.component.html
    │   │   ├── app.component.css
    │   │   ├── app.module.ts          # Главный модуль
    │   │   └── app-routing.module.ts  # Роутинг
    │   │
    │   ├── environments/              # Конфигурация окружения
    │   │   ├── environment.ts
    │   │   └── environment.prod.ts
    │   │
    │   ├── main.ts                    # Точка входа
    │   ├── index.html
    │   └── styles.css                 # Глобальные стили
    │
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.app.json
    └── angular.json

ДОКУМЕНТАЦИЯ:
├── README.md                          # Общее описание проекта
├── INSTALLATION.md                    # Полная инструкция по установке
├── QUICK_START.md                     # Быстрый старт
└── PROJECT_STRUCTURE.md               # Этот файл
```

## Ключевые файлы

### Backend

**Аутентификация (JWT с двумя токенами):**
- `auth/auth.service.ts` - Логика регистрации, входа, refresh токенов
- `auth/strategies/jwt.strategy.ts` - Валидация access токена
- `auth/strategies/refresh-jwt.strategy.ts` - Валидация refresh токена

**Записи на прием:**
- `appointments/appointments.service.ts` - CRUD операции с записями
- `appointments/appointments.controller.ts` - API endpoints

**Медицинские карты:**
- `medical-cards/medical-cards.service.ts` - Работа с медкартами
- Позволяет врачам добавлять записи о посещениях

**Семейный врач:**
- `family-doctors/family-doctors.service.ts` - Заключение договоров
- Только терапевты могут быть семейными врачами

**Email:**
- `mail/mail.service.ts` - SMTP отправка для восстановления пароля

**Seeder:**
- `seeder/seed.ts` - Создание 10 тестовых записей при запуске

### Frontend

**Роутинг:**
- `/login` - Вход
- `/register` - Регистрация
- `/patient/*` - Страницы пациента (требуется роль PATIENT)
- `/doctor/*` - Страницы врача (требуется роль DOCTOR)

**Защита роутов:**
- `AuthGuard` - Проверка аутентификации
- `RoleGuard` - Проверка роли пользователя
- `AuthInterceptor` - Автоматическое добавление JWT токена

## Технологический стек

### Backend
- **NestJS 10** - Фреймворк
- **MongoDB + Mongoose** - База данных
- **JWT** - Аутентификация
- **bcrypt** - Хеширование паролей
- **Nodemailer** - Email отправка
- **class-validator** - Валидация DTO

### Frontend
- **Angular 17** - Фреймворк
- **TypeScript** - Язык программирования
- **RxJS** - Реактивное программирование
- **HttpClient** - HTTP запросы
- **Router** - Навигация

## База данных MongoDB

### Коллекции:

1. **users** - Пользователи (врачи и пациенты)
2. **appointments** - Записи на прием
3. **medicalcards** - Медицинские карты
4. **familydoctors** - Договоры с семейными врачами

## API Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/logout`

### Appointments  
- `POST /appointments`
- `GET /appointments/my`
- `GET /appointments/doctor`
- `GET /appointments/doctors`
- `PATCH /appointments/:id`
- `DELETE /appointments/:id`

### Medical Cards
- `GET /medical-cards/my`
- `GET /medical-cards/patient/:id`
- `POST /medical-cards/record`
- `PATCH /medical-cards`

### Family Doctors
- `POST /family-doctors`
- `GET /family-doctors/my`
- `GET /family-doctors/patients`
- `DELETE /family-doctors`
