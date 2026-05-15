# Medical CRM — Backend API for Frontend

**Base URL (dev):** `http://localhost:3000`
**Swagger UI:** `http://localhost:3000/docs`
**Health:** `GET /health`

## Соглашения

- Все защищённые эндпоинты ждут `Authorization: Bearer <accessToken>`
- Все ошибки имеют единый формат:
  ```json
  { "statusCode": 401, "error": "Unauthorized", "message": "...", "path": "/auth/login", "timestamp": "2026-05-15T12:00:00.000Z" }
  ```
- Тело запроса всегда `application/json`
- Rate limit (по умолчанию): 100 req/мин на IP. Login: 10/мин, forgot-password: 5/мин
- CORS: `http://localhost:4200` (Angular dev), `credentials: true`
- Пароли в ответах никогда не возвращаются

## Объекты

### User
```ts
{
  id: string;             // mongo _id, also exposed as `_id` for backwards compat
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor';
  specialization?: 'therapist' | 'surgeon' | 'cardiologist' | 'neurologist'
                 | 'dermatologist' | 'pediatrician' | 'ophthalmologist' | 'psychiatrist';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Appointment
```ts
{
  _id: string;
  patientId: User | string;   // populated User on list/detail endpoints
  doctorId:  User | string;
  dateTime: string;            // ISO 8601
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

### MedicalCard
```ts
{
  _id: string;
  patientId: string;
  bloodType?: string;
  height?: number;             // cm
  weight?: number;             // kg
  allergies: string[];
  chronicDiseases: string[];
  records: MedicalRecord[];
}
```

### MedicalRecord
```ts
{
  date: string;                // ISO 8601
  symptoms: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  doctorId: User | string;     // populated on reads
}
```

---

## Auth (`/auth`)

### `POST /auth/register` — public

Тело:
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "firstName": "Иван",
  "lastName": "Петров",
  "role": "patient",
  "specialization": "therapist",
  "phone": "+380501234567"
}
```
Правила: пароль ≥6 символов; `specialization` обязательна при `role: 'doctor'`.

Ответ `201`:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "role": "patient",
  "user": { "id": "...", "email": "...", "firstName": "...", "lastName": "...", "role": "patient" }
}
```

### `POST /auth/login` — public, throttled 10/мин

Тело: `{ "email": "...", "password": "..." }`
Ответ: то же, что у register.

### `POST /auth/refresh` — public, требует `Authorization: Bearer <refreshToken>`

Заголовок: `Authorization: Bearer <refreshToken>`
Ответ: новая пара токенов + user (refresh-токен ротейтится — старый инвалидируется).

### `POST /auth/logout` — auth

Чистит refresh-token на сервере. Тело пустое. Ответ: `{ "message": "Logged out" }`.

### `POST /auth/forgot-password` — public, throttled 5/мин

Тело: `{ "email": "..." }`
Ответ всегда одинаковый (анти-enumeration):
```json
{ "message": "Если email зарегистрирован, ссылка отправлена" }
```
В письмо вшит JWT-токен на 15 минут с `purpose: "password-reset"`.

### `POST /auth/reset-password` — public

Тело:
```json
{ "token": "<jwt-from-email>", "newPassword": "newSecret123" }
```
После сброса все refresh-токены пользователя инвалидируются.

---

## Appointments (`/appointments`)

Все эндпоинты — auth.

| Метод | Путь | Роль | Описание |
|---|---|---|---|
| POST   | `/appointments`         | patient | Создать запись |
| GET    | `/appointments/my`      | patient | Мои записи (по убыванию даты) |
| GET    | `/appointments/doctor`  | doctor  | Записи ко мне (по возрастанию даты) |
| GET    | `/appointments/patients`| doctor  | Уникальные пациенты, у которых были записи ко мне |
| GET    | `/appointments/doctors` | any     | Список врачей. `?specialization=therapist` — фильтр |
| GET    | `/appointments/slots`   | any     | `?doctorId=&date=` — пока возвращает `[]` (заглушка) |
| GET    | `/appointments/:id`     | any (свой) | Деталь |
| PATCH  | `/appointments/:id`     | any (свой) | Обновить `{ status?, reason? }` |
| DELETE | `/appointments/:id`     | any (свой) | Отменить |

### `POST /appointments` (patient)
```json
{ "doctorId": "6630...", "dateTime": "2026-06-01T10:00:00.000Z", "reason": "Боли в груди" }
```
- `dateTime` должно быть в будущем (иначе `403`)
- `doctorId` должен ссылаться на пользователя с `role: 'doctor'`

### `PATCH /appointments/:id`
```json
{ "status": "completed" }   // или { "reason": "..." }
```
`status` принимает `scheduled | completed | cancelled`.

Доступ: запись доступна только её пациенту или её врачу. Иначе `403 Forbidden`.

---

## Medical Cards (`/medical-cards`)

| Метод | Путь | Роль |
|---|---|---|
| GET   | `/medical-cards/my`           | patient (создаётся при первом обращении) |
| GET   | `/medical-cards/patient/:id`  | doctor |
| POST  | `/medical-cards/record`       | doctor |
| PATCH | `/medical-cards`              | patient/doctor (обновляет карту по userId) |

### `POST /medical-cards/record` (doctor)
```json
{
  "patientId": "6630...",
  "symptoms": "...",
  "diagnosis": "...",
  "treatment": "...",
  "notes": "..."
}
```
Если карты у пациента ещё нет — создаётся автоматически.

### `PATCH /medical-cards`
```json
{
  "bloodType": "A+",
  "height": 178,
  "weight": 75,
  "allergies": ["Пенициллин"],
  "chronicDiseases": ["Гипертония"]
}
```

---

## Family Doctors (`/family-doctors`)

| Метод | Путь | Роль | Возврат |
|---|---|---|---|
| POST   | `/family-doctors`           | patient | контракт |
| GET    | `/family-doctors/my`        | patient | `User \| null` |
| GET    | `/family-doctors/patients`  | doctor  | `User[]` |
| DELETE | `/family-doctors`           | patient | завершить контракт |

### `POST /family-doctors`
```json
{ "doctorId": "6630..." }
```
Семейным может быть только `specialization: 'therapist'`. У пациента не более одного активного контракта.

### `GET /family-doctors/my`
Возвращает `User` напрямую (объект врача) или `null`, если контракта нет. **Не 404.**

### `GET /family-doctors/patients`
Возвращает `User[]` — список пациентов с активным контрактом.

---

## Health (`/health`) — public

`GET /health` → терминус-чек mongo + heap.

---

## Запуск (pnpm)

```bash
cd backend
cp .env .env       # заполнить JWT_*, MONGODB_URI
pnpm install
pnpm start:dev             # http://localhost:3000
pnpm seed                  # тестовые пользователи
```

## Заметки для фронта

1. **Префикс `/api` НЕ нужен** — оставили базовый путь, чтобы `environment.apiUrl = 'http://localhost:3000'` работал как есть.
2. **`reset-password`** ждёт `newPassword`, не `password` — совпадает с тем, что шлёт `forgot-password.component.ts`.
3. **`accessToken` живёт 15 минут.** При 401 интерсептор уже чистит сессию — это OK для MVP. Чуть позже можно добавить тихое обновление через `/auth/refresh`.
4. **`refreshToken`** надо сохранять (фронт уже сохраняет в `localStorage.refreshToken`). При `/auth/refresh` он передаётся как `Bearer`, не в body.
5. **Логаут** возвращает 200 даже без активного refresh-token — фронт может вызывать его и при истёкшем access (интерсептор поймает 401 и почистит сессию).
6. **`appointments/slots`** — заглушка, возвращает `[]`. Сделаем нормальный расчёт окон, как будет UI.
7. **`updatedAt`/`createdAt`** есть у всех документов (Mongoose `timestamps: true`).
