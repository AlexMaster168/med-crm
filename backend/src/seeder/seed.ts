import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole, DoctorSpecialization } from '../schemas/user.schema';
import { Appointment, AppointmentStatus } from '../schemas/appointment.schema';
import { MedicalCard } from '../schemas/medical-card.schema';
import { FamilyDoctor } from '../schemas/family-doctor.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userModel = app.get<Model<User>>(getModelToken('User'));
  const appointmentModel = app.get<Model<Appointment>>(getModelToken('Appointment'));
  const medicalCardModel = app.get<Model<MedicalCard>>(getModelToken('MedicalCard'));
  const familyDoctorModel = app.get<Model<FamilyDoctor>>(getModelToken('FamilyDoctor'));

  await userModel.deleteMany({});
  await appointmentModel.deleteMany({});
  await medicalCardModel.deleteMany({});
  await familyDoctorModel.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  const doctors = await userModel.insertMany([
    {
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'petrov@hospital.com',
      password: hashedPassword,
      role: UserRole.DOCTOR,
      specialization: DoctorSpecialization.THERAPIST,
      phone: '+380501234567',
    },
    {
      firstName: 'Мария',
      lastName: 'Сидорова',
      email: 'sidorova@hospital.com',
      password: hashedPassword,
      role: UserRole.DOCTOR,
      specialization: DoctorSpecialization.SURGEON,
      phone: '+380501234568',
    },
    {
      firstName: 'Олег',
      lastName: 'Коваленко',
      email: 'kovalenko@hospital.com',
      password: hashedPassword,
      role: UserRole.DOCTOR,
      specialization: DoctorSpecialization.CARDIOLOGIST,
      phone: '+380501234569',
    },
  ]);

  const patients = await userModel.insertMany([
    {
      firstName: 'Анна',
      lastName: 'Иванова',
      email: 'ivanova@mail.com',
      password: hashedPassword,
      role: UserRole.PATIENT,
      phone: '+380502234567',
    },
    {
      firstName: 'Петр',
      lastName: 'Смирнов',
      email: 'smirnov@mail.com',
      password: hashedPassword,
      role: UserRole.PATIENT,
      phone: '+380502234568',
    },
    {
      firstName: 'Елена',
      lastName: 'Васильева',
      email: 'vasilyeva@mail.com',
      password: hashedPassword,
      role: UserRole.PATIENT,
      phone: '+380502234569',
    },
    {
      firstName: 'Дмитрий',
      lastName: 'Морозов',
      email: 'morozov@mail.com',
      password: hashedPassword,
      role: UserRole.PATIENT,
      phone: '+380502234570',
    },
    {
      firstName: 'Ольга',
      lastName: 'Новикова',
      email: 'novikova@mail.com',
      password: hashedPassword,
      role: UserRole.PATIENT,
      phone: '+380502234571',
    },
    {
      firstName: 'Сергей',
      lastName: 'Волков',
      email: 'volkov@mail.com',
      password: hashedPassword,
      role: UserRole.PATIENT,
      phone: '+380502234572',
    },
    {
      firstName: 'Татьяна',
      lastName: 'Соколова',
      email: 'sokolova@mail.com',
      password: hashedPassword,
      role: UserRole.PATIENT,
      phone: '+380502234573',
    },
  ]);

  const now = new Date();
  const appointments = [];

  for (let i = 0; i < 10; i++) {
    const appointmentDate = new Date(now);
    appointmentDate.setDate(appointmentDate.getDate() + i - 3);
    appointmentDate.setHours(9 + (i % 8), 0, 0, 0);

    appointments.push({
      patientId: patients[i % patients.length]._id,
      doctorId: doctors[i % doctors.length]._id,
      dateTime: appointmentDate,
      status: i < 3 ? AppointmentStatus.COMPLETED : AppointmentStatus.SCHEDULED,
      reason: [
        'Консультация',
        'Плановый осмотр',
        'Боли в груди',
        'Головные боли',
        'Проверка анализов',
        'Повышенное давление',
        'Общее недомогание',
        'Кашель',
        'Боли в спине',
        'Профилактический осмотр',
      ][i],
    });
  }

  await appointmentModel.insertMany(appointments);

  for (const patient of patients) {
    await medicalCardModel.create({
      patientId: patient._id,
      bloodType: ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
      allergies: ['Пенициллин', 'Пыльца'].slice(0, Math.random() > 0.5 ? 1 : 0),
      chronicDiseases: ['Гипертония', 'Диабет'].slice(0, Math.random() > 0.7 ? 1 : 0),
      height: 160 + Math.floor(Math.random() * 30),
      weight: 60 + Math.floor(Math.random() * 40),
      records: [],
    });
  }

  await familyDoctorModel.create({
    patientId: patients[0]._id,
    doctorId: doctors[0]._id,
    contractDate: new Date(),
    isActive: true,
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Created ${doctors.length} doctors`);
  console.log(`Created ${patients.length} patients`);
  console.log(`Created ${appointments.length} appointments`);
  console.log('\nTest credentials:');
  console.log('Doctor: petrov@hospital.com / password123');
  console.log('Patient: ivanova@mail.com / password123');

  await app.close();
}

seed();
