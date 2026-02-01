import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  specialty: String,
  phone: String,
  dateOfBirth: Date,
  address: String,
  familyDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  time: String,
  status: String,
  reason: String,
  duration: Number,
}, { timestamps: true });

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  diagnosis: String,
  symptoms: [String],
  treatment: String,
  medications: [String],
  notes: String,
  visitDate: Date,
  bloodPressure: String,
  temperature: Number,
  heartRate: Number,
  allergies: [String],
  weight: Number,
  height: Number,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const doctors = await User.insertMany([
      {
        firstName: 'Анна',
        lastName: 'Петрова',
        email: 'anna.petrova@hospital.com',
        password: hashedPassword,
        role: 'doctor',
        specialty: 'therapist',
        phone: '+380501234567',
      },
      {
        firstName: 'Иван',
        lastName: 'Сидоров',
        email: 'ivan.sidorov@hospital.com',
        password: hashedPassword,
        role: 'doctor',
        specialty: 'surgeon',
        phone: '+380501234568',
      },
      {
        firstName: 'Мария',
        lastName: 'Коваленко',
        email: 'maria.kovalenko@hospital.com',
        password: hashedPassword,
        role: 'doctor',
        specialty: 'cardiologist',
        phone: '+380501234569',
      },
      {
        firstName: 'Олег',
        lastName: 'Шевченко',
        email: 'oleg.shevchenko@hospital.com',
        password: hashedPassword,
        role: 'doctor',
        specialty: 'neurologist',
        phone: '+380501234570',
      },
      {
        firstName: 'Елена',
        lastName: 'Иванова',
        email: 'elena.ivanova@hospital.com',
        password: hashedPassword,
        role: 'doctor',
        specialty: 'pediatrician',
        phone: '+380501234571',
      },
    ]);

    const patients = await User.insertMany([
      {
        firstName: 'Дмитрий',
        lastName: 'Мельник',
        email: 'dmitry.melnik@gmail.com',
        password: hashedPassword,
        role: 'patient',
        phone: '+380501234580',
        dateOfBirth: new Date('1990-05-15'),
        address: 'ул. Крещатик, 10, Киев',
        familyDoctor: doctors[0]._id,
      },
      {
        firstName: 'Ольга',
        lastName: 'Ткаченко',
        email: 'olga.tkachenko@gmail.com',
        password: hashedPassword,
        role: 'patient',
        phone: '+380501234581',
        dateOfBirth: new Date('1985-08-20'),
        address: 'ул. Шевченко, 25, Киев',
        familyDoctor: doctors[0]._id,
      },
      {
        firstName: 'Сергей',
        lastName: 'Коваль',
        email: 'sergey.koval@gmail.com',
        password: hashedPassword,
        role: 'patient',
        phone: '+380501234582',
        dateOfBirth: new Date('1978-11-30'),
        address: 'пр. Победы, 5, Киев',
      },
      {
        firstName: 'Наталья',
        lastName: 'Бондаренко',
        email: 'natalia.bondarenko@gmail.com',
        password: hashedPassword,
        role: 'patient',
        phone: '+380501234583',
        dateOfBirth: new Date('1995-03-12'),
        address: 'ул. Лесная, 18, Киев',
      },
      {
        firstName: 'Александр',
        lastName: 'Лисенко',
        email: 'alex.lysenko@gmail.com',
        password: hashedPassword,
        role: 'patient',
        phone: '+380501234584',
        dateOfBirth: new Date('1982-07-25'),
        address: 'ул. Садовая, 42, Киев',
      },
    ]);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Appointment.insertMany([
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        date: tomorrow,
        time: '10:00',
        status: 'scheduled',
        reason: 'Плановый осмотр',
        duration: 30,
      },
      {
        patient: patients[1]._id,
        doctor: doctors[2]._id,
        date: tomorrow,
        time: '14:00',
        status: 'scheduled',
        reason: 'Консультация кардиолога',
        duration: 45,
      },
      {
        patient: patients[2]._id,
        doctor: doctors[1]._id,
        date: nextWeek,
        time: '09:30',
        status: 'scheduled',
        reason: 'Предоперационная консультация',
        duration: 60,
      },
      {
        patient: patients[3]._id,
        doctor: doctors[0]._id,
        date: nextWeek,
        time: '11:00',
        status: 'scheduled',
        reason: 'Общая консультация',
        duration: 30,
      },
      {
        patient: patients[4]._id,
        doctor: doctors[3]._id,
        date: tomorrow,
        time: '16:00',
        status: 'scheduled',
        reason: 'Головные боли',
        duration: 45,
      },
    ]);

    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    await MedicalRecord.insertMany([
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        diagnosis: 'Острая респираторная вирусная инфекция',
        symptoms: ['повышенная температура', 'кашель', 'насморк', 'слабость'],
        treatment: 'Симптоматическое лечение, постельный режим',
        medications: ['Парацетамол', 'Ибупрофен', 'Витамин C'],
        notes: 'Рекомендовано обильное питье и отдых',
        visitDate: lastWeek,
        bloodPressure: '120/80',
        temperature: 37.8,
        heartRate: 82,
        weight: 75,
        height: 178,
      },
      {
        patient: patients[1]._id,
        doctor: doctors[2]._id,
        diagnosis: 'Артериальная гипертензия 1 степени',
        symptoms: ['периодические головные боли', 'головокружение'],
        treatment: 'Антигипертензивная терапия, диета с ограничением соли',
        medications: ['Эналаприл 10мг', 'Индапамид 2.5мг'],
        notes: 'Контроль АД ежедневно утром и вечером, повторный прием через 2 недели',
        visitDate: lastMonth,
        bloodPressure: '145/95',
        temperature: 36.6,
        heartRate: 76,
        weight: 68,
        height: 165,
        allergies: ['пенициллин'],
      },
      {
        patient: patients[2]._id,
        doctor: doctors[1]._id,
        diagnosis: 'Аппендицит острый',
        symptoms: ['боль в правой подвздошной области', 'тошнота', 'повышенная температура'],
        treatment: 'Аппендэктомия',
        medications: ['Цефазолин', 'Кетопрофен'],
        notes: 'Операция прошла успешно, послеоперационный период без осложнений',
        visitDate: lastMonth,
        bloodPressure: '130/85',
        temperature: 37.2,
        heartRate: 88,
        weight: 82,
        height: 180,
      },
      {
        patient: patients[3]._id,
        doctor: doctors[0]._id,
        diagnosis: 'Профилактический осмотр',
        symptoms: [],
        treatment: 'Не требуется',
        medications: [],
        notes: 'Здорова, рекомендовано ежегодное обследование',
        visitDate: lastWeek,
        bloodPressure: '115/75',
        temperature: 36.6,
        heartRate: 72,
        weight: 62,
        height: 170,
      },
      {
        patient: patients[4]._id,
        doctor: doctors[3]._id,
        diagnosis: 'Мигрень',
        symptoms: ['пульсирующая головная боль', 'светобоязнь', 'тошнота'],
        treatment: 'Триптаны при приступе, профилактическая терапия',
        medications: ['Суматриптан', 'Топирамат'],
        notes: 'Рекомендовано ведение дневника головных болей',
        visitDate: lastWeek,
        bloodPressure: '118/78',
        temperature: 36.7,
        heartRate: 74,
        weight: 78,
        height: 175,
        allergies: ['аспирин'],
      },
    ]);

    console.log('Seed data created successfully!');
    console.log('\nТестовые данные:');
    console.log('\nВрачи:');
    console.log('Email: anna.petrova@hospital.com | Пароль: password123 | Специализация: Терапевт');
    console.log('Email: ivan.sidorov@hospital.com | Пароль: password123 | Специализация: Хирург');
    console.log('Email: maria.kovalenko@hospital.com | Пароль: password123 | Специализация: Кардиолог');
    console.log('Email: oleg.shevchenko@hospital.com | Пароль: password123 | Специализация: Невролог');
    console.log('Email: elena.ivanova@hospital.com | Пароль: password123 | Специализация: Педиатр');
    console.log('\nПациенты:');
    console.log('Email: dmitry.melnik@gmail.com | Пароль: password123');
    console.log('Email: olga.tkachenko@gmail.com | Пароль: password123');
    console.log('Email: sergey.koval@gmail.com | Пароль: password123');
    console.log('Email: natalia.bondarenko@gmail.com | Пароль: password123');
    console.log('Email: alex.lysenko@gmail.com | Пароль: password123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
