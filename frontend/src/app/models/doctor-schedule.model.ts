export interface WorkingDay {
  enabled: boolean;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface DoctorSchedule {
  _id?: string;
  doctorId?: string;
  workingDays: WorkingDay[]; // 7 элементов: Пн..Вс
  slotDurationMin: number;
  breakStart?: string;
  breakEnd?: string;
  daysOff: string[]; // "YYYY-MM-DD"
  bookingHorizonDays: number;
  minLeadTimeHours: number;
  maxActivePerPatient: number;
  requiresConfirmation: boolean;
}

export type UpdateSchedulePayload = Omit<DoctorSchedule, '_id' | 'doctorId'>;

export const WEEKDAY_LABELS = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

export const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
