import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {AppointmentService} from '../../services/appointment.service';
import {UserService} from '../../services/user.service';
import {DoctorSpecialization, User} from '../../models/user.model';
import {Appointment, TimeSlot} from "../../models/appointment.model";

@Component({
    selector: 'app-patient-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
        <div class="dashboard">
            <header class="header">
                <div class="header-content">
                    <h1>Личный кабинет пациента</h1>
                    <div class="user-info">
                        <span>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
                        <button (click)="logout()" class="btn-logout">Выход</button>
                    </div>
                </div>
            </header>

            <div class="content">
                <div class="sidebar">
                    <nav>
                        <a routerLink="/patient" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                            Мои приемы
                        </a>
                        <a routerLink="/patient/doctors" routerLinkActive="active">
                            Записаться на прием
                        </a>
                        <a routerLink="/patient/medical-records" routerLinkActive="active">
                            Медицинская карта
                        </a>
                        <a routerLink="/patient/profile" routerLinkActive="active">
                            Профиль
                        </a>
                    </nav>
                </div>

                <main class="main-content">
                    <div class="family-doctor-section" *ngIf="!currentUser?.familyDoctor">
                        <h2>Семейный врач</h2>
                        <p>У вас нет семейного врача. Выберите терапевта:</p>

                        <div class="doctors-grid" *ngIf="therapists.length > 0">
                            <div class="doctor-card" *ngFor="let doctor of therapists">
                                <h3>{{ doctor.firstName }} {{ doctor.lastName }}</h3>
                                <p>{{ doctor.email }}</p>
                                <p>{{ doctor.phone }}</p>
                                <button class="btn-primary" (click)="assignFamilyDoctor(doctor.id)">
                                    Выбрать
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="family-doctor-info" *ngIf="currentUser?.familyDoctor">
                        <h2>Семейный врач</h2>
                        <div class="doctor-info">
                            <h3>{{ currentUser?.familyDoctor?.firstName }} {{ currentUser?.familyDoctor?.lastName }}</h3>
                            <p>{{ currentUser?.familyDoctor?.email }}</p>
                            <p>{{ currentUser?.familyDoctor?.phone }}</p>
                        </div>
                    </div>

                    <div class="appointments-section">
                        <h2>Мои записи на прием</h2>

                        <div class="appointments-list" *ngIf="appointments.length > 0; else noAppointments">
                            <div class="appointment-card" *ngFor="let appointment of appointments">
                                <div class="appointment-header">
                                    <div>
                                        <h3>{{ appointment.doctorId.firstName }} {{ appointment.doctorId.lastName }}</h3>
                                        <p class="specialty">{{ getSpecialtyName(appointment.doctorId.specialization) }}</p>
                                    </div>
                                    <span class="status"
                                          [class]="appointment.status">{{ getStatusName(appointment.status) }}</span>
                                </div>
                                <div class="appointment-details">
                                    <div class="detail">
                                        <strong>Дата:</strong> {{ formatDate(appointment.dateTime) }}
                                    </div>
                                    <div class="detail">
                                        <strong>Время:</strong> {{ appointment.dateTime }}
                                    </div>
                                    <div class="detail">
                                        <strong>Причина:</strong> {{ appointment.reason || 'Не указана' }}
                                    </div>
                                </div>
                                <div class="appointment-actions" *ngIf="appointment.status === 'scheduled'">
                                    <button class="btn-cancel" (click)="cancelAppointment(appointment._id)">
                                        Отменить
                                    </button>
                                </div>
                            </div>
                        </div>

                        <ng-template #noAppointments>
                            <p class="no-data">У вас нет записей на прием</p>
                        </ng-template>
                    </div>

                    <div class="booking-section" *ngIf="showBookingForm">
                        <h2>Записаться на прием</h2>

                        <form [formGroup]="bookingForm" (ngSubmit)="onBookingSubmit()">
                            <div class="form-group">
                                <label>Специализация</label>
                                <select formControlName="specialty" class="form-control" (change)="onSpecialtyChange()">
                                    <option value="">Выберите специализацию</option>
                                    <option value="therapist">Терапевт</option>
                                    <option value="surgeon">Хирург</option>
                                    <option value="cardiologist">Кардиолог</option>
                                    <option value="neurologist">Невролог</option>
                                    <option value="dermatologist">Дерматолог</option>
                                    <option value="pediatrician">Педиатр</option>
                                    <option value="ophthalmologist">Офтальмолог</option>
                                    <option value="psychiatrist">Психиатр</option>
                                </select>
                            </div>

                            <div class="form-group" *ngIf="doctorsList.length > 0">
                                <label>Врач</label>
                                <select formControlName="doctorId" class="form-control" (change)="onDoctorChange()">
                                    <option value="">Выберите врача</option>
                                    <option *ngFor="let doctor of doctorsList" [value]="doctor.id">
                                        {{ doctor.firstName }} {{ doctor.lastName }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group" *ngIf="bookingForm.get('doctorId')?.value">
                                <label>Дата</label>
                                <input type="date" formControlName="date" class="form-control" (change)="onDateChange()"
                                       [min]="minDate">
                            </div>

                            <div class="form-group" *ngIf="availableSlots.length > 0">
                                <label>Время</label>
                                <div class="time-slots">
                                    <button
                                            type="button"
                                            class="time-slot"
                                            *ngFor="let slot of availableSlots"
                                            [class.disabled]="!slot.available"
                                            [disabled]="!slot.available"
                                            (click)="selectTime(slot.time)">
                                        {{ slot.time }}
                                    </button>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Причина обращения</label>
                                <textarea formControlName="reason" class="form-control" rows="3"></textarea>
                            </div>

                            <button type="submit" class="btn-primary" [disabled]="bookingForm.invalid">
                                Записаться
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    `,
    styles: [`
        .dashboard {
            min-height: 100vh;
            background: #f5f7fa;
        }

        .header {
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            padding: 20px 0;
        }

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        h1 {
            color: #333;
            font-size: 28px;
            margin: 0;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .btn-logout {
            padding: 8px 20px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }

        .content {
            max-width: 1400px;
            margin: 30px auto;
            padding: 0 20px;
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 30px;
        }

        .sidebar {
            background: white;
            border-radius: 12px;
            padding: 20px;
            height: fit-content;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .sidebar nav {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .sidebar a {
            padding: 12px 16px;
            color: #555;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s;
        }

        .sidebar a:hover {
            background: #f5f7fa;
        }

        .sidebar a.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .main-content {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        .family-doctor-section, .family-doctor-info, .appointments-section, .booking-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h2 {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }

        .doctors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .doctor-card {
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
        }

        .doctor-card h3 {
            color: #333;
            font-size: 18px;
            margin: 0 0 10px 0;
        }

        .doctor-card p {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }

        .doctor-info {
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 20px;
        }

        .doctor-info h3 {
            color: #333;
            font-size: 20px;
            margin: 0 0 10px 0;
        }

        .doctor-info p {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }

        .appointments-list {
            display: grid;
            gap: 20px;
        }

        .appointment-card {
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
        }

        .appointment-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }

        .appointment-header h3 {
            color: #333;
            font-size: 20px;
            margin: 0;
        }

        .specialty {
            color: #667eea;
            font-size: 14px;
            margin: 5px 0 0 0;
        }

        .status {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
        }

        .status.scheduled {
            background: #e3f2fd;
            color: #1976d2;
        }

        .status.completed {
            background: #e8f5e9;
            color: #388e3c;
        }

        .status.cancelled {
            background: #ffebee;
            color: #d32f2f;
        }

        .appointment-details {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }

        .detail {
            color: #666;
            font-size: 14px;
        }

        .detail strong {
            color: #333;
            margin-right: 5px;
        }

        .appointment-actions {
            display: flex;
            justify-content: flex-end;
        }

        .btn-cancel {
            padding: 10px 20px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }

        .form-control {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 15px;
            transition: border-color 0.3s;
            box-sizing: border-box;
        }

        .form-control:focus {
            outline: none;
            border-color: #667eea;
        }

        .time-slots {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
        }

        .time-slot {
            padding: 10px;
            border: 2px solid #667eea;
            background: white;
            color: #667eea;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .time-slot:hover:not(.disabled) {
            background: #667eea;
            color: white;
        }

        .time-slot.disabled {
            border-color: #ccc;
            color: #ccc;
            cursor: not-allowed;
        }

        .time-slot.selected {
            background: #667eea;
            color: white;
        }

        .btn-primary {
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .no-data {
            text-align: center;
            color: #999;
            padding: 40px;
            font-size: 16px;
        }
    `]
})
export class PatientDashboardComponent implements OnInit {
    currentUser: User | null = null;
    appointments: Appointment[] = [];
    therapists: User[] = [];
    doctorsList: User[] = [];
    availableSlots: TimeSlot[] = [];
    showBookingForm = false;
    minDate = '';

    bookingForm: FormGroup;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private authService: AuthService,
        private appointmentService: AppointmentService,
        private userService: UserService
    ) {
        this.bookingForm = this.fb.group({
            specialty: ['', Validators.required],
            doctorId: ['', Validators.required],
            date: ['', Validators.required],
            time: ['', Validators.required],
            reason: ['']
        });

        const today = new Date();
        this.minDate = today.toISOString().split('T')[0];
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.loadAppointments();
        this.loadTherapists();
    }

    loadAppointments(): void {
        this.appointmentService.getAppointments().subscribe({
            next: (data) => {
                this.appointments = data;
            }
        });
    }

    loadTherapists(): void {
        this.userService.getDoctors('therapist' as DoctorSpecialization).subscribe({
            next: (data) => {
                this.therapists = data;
            }
        });
    }

    assignFamilyDoctor(doctorId: string): void {
        this.userService.assignFamilyDoctor(doctorId).subscribe({
            next: (data) => {
                this.currentUser = data;
                this.authService.currentUser$.subscribe(user => {
                    if (user) {
                        user.familyDoctor = data.familyDoctor;
                    }
                });
            }
        });
    }

    onSpecialtyChange(): void {
        const specialty = this.bookingForm.get('specialty')?.value;
        if (specialty) {
            this.userService.getDoctors(specialty).subscribe({
                next: (data) => {
                    this.doctorsList = data;
                }
            });
        }
    }

    onDoctorChange(): void {
        this.bookingForm.patchValue({date: '', time: ''});
        this.availableSlots = [];
    }

    onDateChange(): void {
        const doctorId = this.bookingForm.get('doctorId')?.value;
        const date = this.bookingForm.get('date')?.value;

        if (doctorId && date) {
            this.appointmentService.getAvailableSlots(doctorId, date).subscribe({
                next: (data) => {
                    this.availableSlots = data;
                }
            });
        }
    }

    selectTime(time: string): void {
        this.bookingForm.patchValue({time});
        const slots = document.querySelectorAll('.time-slot');
        slots.forEach(slot => slot.classList.remove('selected'));
        event?.target && (event.target as HTMLElement).classList.add('selected');
    }

    onBookingSubmit(): void {
        if (this.bookingForm.valid) {
            const formData = this.bookingForm.value;
            this.appointmentService.createAppointment(formData).subscribe({
                next: () => {
                    this.loadAppointments();
                    this.bookingForm.reset();
                    this.showBookingForm = false;
                    this.availableSlots = [];
                }
            });
        }
    }

    cancelAppointment(id: string): void {
        if (confirm('Вы уверены, что хотите отменить запись?')) {
            this.appointmentService.cancelAppointment(id).subscribe({
                next: () => {
                    this.loadAppointments();
                }
            });
        }
    }

    getSpecialtyName(specialty?: string): string {
        const specialties: any = {
            therapist: 'Терапевт',
            surgeon: 'Хирург',
            cardiologist: 'Кардиолог',
            neurologist: 'Невролог',
            dermatologist: 'Дерматолог',
            pediatrician: 'Педиатр',
            ophthalmologist: 'Офтальмолог',
            psychiatrist: 'Психиатр'
        };
        return specialty ? specialties[specialty] : '';
    }

    getStatusName(status: string): string {
        const statuses: any = {
            scheduled: 'Запланировано',
            completed: 'Завершено',
            cancelled: 'Отменено'
        };
        return statuses[status] || status;
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('ru-RU');
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
