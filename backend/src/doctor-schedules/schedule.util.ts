import { DoctorSchedule } from '../schemas/doctor-schedule.schema';

/** "HH:mm" -> минуты от полуночи */
export function toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}

/** минуты от полуночи -> "HH:mm" */
export function toHHMM(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** JS Date.getDay() (0=Вс..6=Сб) -> индекс в workingDays (0=Пн..6=Вс) */
export function weekdayIndex(date: Date): number {
    return (date.getDay() + 6) % 7;
}

/** Локальная дата -> "YYYY-MM-DD" */
export function toDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Все потенциальные времена начала приёма в указанный день по графику,
 * без учёта уже занятых слотов. Возвращает массив "HH:mm".
 * Учитывает рабочий день/часы, выходные (daysOff) и перерыв.
 */
export function generateDaySlotTimes(schedule: DoctorSchedule, dateKey: string): string[] {
    if (schedule.daysOff?.includes(dateKey)) return [];

    const date = new Date(`${dateKey}T00:00:00`);
    const day = schedule.workingDays[weekdayIndex(date)];
    if (!day || !day.enabled) return [];

    const start = toMinutes(day.start);
    const end = toMinutes(day.end);
    const step = schedule.slotDurationMin;
    if (step <= 0 || end <= start) return [];

    const breakStart =
        schedule.breakStart && schedule.breakEnd ? toMinutes(schedule.breakStart) : null;
    const breakEnd =
        schedule.breakStart && schedule.breakEnd ? toMinutes(schedule.breakEnd) : null;

    const times: string[] = [];
    for (let t = start; t + step <= end; t += step) {
        // слот [t, t+step) не должен пересекаться с перерывом
        if (breakStart !== null && breakEnd !== null) {
            const overlapsBreak = t < breakEnd && t + step > breakStart;
            if (overlapsBreak) continue;
        }
        times.push(toHHMM(t));
    }
    return times;
}
