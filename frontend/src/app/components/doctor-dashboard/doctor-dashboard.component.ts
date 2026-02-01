import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {AppointmentService} from '../../services/appointment.service';
import {UserService} from '../../services/user.service';
import {User} from '../../models/user.model';
import {Appointment} from "../../models/appointment.model";

@Component({
    selector: 'app-doctor-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="dashboard">
            <header class="header">
                <div class="header-content">
                    <h1>Панель врача</h1>
                    <div class="user-info">
                        <span>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
                        <span class="specialty">{{ getSpecialtyName(currentUser?.specialization) }}</span>
                        <button (click)="logout()" class="btn-logout">Выход</button>
                    </div>
                </div>
            </header>

            <div class="content">
                <div class="sidebar">
                    <nav>
                        <a routerLink="/doctor" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                            Мои приемы
                        </a>
                        <a routerLink="/doctor/patients" routerLinkActive="active">
                            Мои пациенты
                        </a>
                        <a routerLink="/doctor/profile" routerLinkActive="active">
                            Профиль
                        </a>
                    </nav>
                </div>

                <main class="main-content">
                    <div class="appointments-section">
                        <h2>Предстоящие приемы</h2>

                        <div class="appointments-list" *ngIf="appointments.length > 0; else noAppointments">
                            <div class="appointment-card" *ngFor="let appointment of appointments">
                                <div class="appointment-header">
                                    <h3>{{ appointment.patientId.firstName }} {{ appointment.patientId.lastName }}</h3>
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
                                    <div class="detail">
                                        <strong>Телефон:</strong> {{ appointment.patientId.phone || 'Не указан' }}
                                    </div>
                                </div>
                                <div class="appointment-actions">
                                    <button class="btn-view" routerLink="/doctor/appointment/{{ appointment._id }}">
                                        Посмотреть карту
                                    </button>
                                </div>
                            </div>
                        </div>

                        <ng-template #noAppointments>
                            <p class="no-data">Нет предстоящих приемов</p>
                        </ng-template>
                    </div>

                    <div class="patients-section">
                        <h2>Мои пациенты</h2>

                        <div class="patients-list" *ngIf="patients.length > 0; else noPatients">
                            <div class="patient-card" *ngFor="let patient of patients">
                                <div class="patient-info">
                                    <h3>{{ patient.firstName }} {{ patient.lastName }}</h3>
                                    <p>{{ patient.email }}</p>
                                    <p>{{ patient.phone }}</p>
                                </div>
                                <button class="btn-view" routerLink="/doctor/patient/{{ patient.id }}">
                                    Медицинская карта
                                </button>
                            </div>
                        </div>

                        <ng-template #noPatients>
                            <p class="no-data">У вас пока нет пациентов</p>
                        </ng-template>
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

        .specialty {
            color: #667eea;
            font-weight: 500;
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

        .appointments-section, .patients-section {
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

        .appointments-list, .patients-list {
            display: grid;
            gap: 20px;
        }

        .appointment-card, .patient-card {
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.3s;
        }

        .appointment-card:hover, .patient-card:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .appointment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .appointment-header h3 {
            color: #333;
            font-size: 20px;
            margin: 0;
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
            grid-template-columns: repeat(2, 1fr);
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
            gap: 10px;
            justify-content: flex-end;
        }

        .btn-view {
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: transform 0.2s;
        }

        .btn-view:hover {
            transform: translateY(-2px);
        }

        .patient-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .patient-info h3 {
            color: #333;
            font-size: 18px;
            margin: 0 0 8px 0;
        }

        .patient-info p {
            color: #666;
            font-size: 14px;
            margin: 4px 0;
        }

        .no-data {
            text-align: center;
            color: #999;
            padding: 40px;
            font-size: 16px;
        }
    `]
})
export class DoctorDashboardComponent implements OnInit {
    currentUser: User | null = null;
    appointments: Appointment[] = [];
    patients: User[] = [];

    constructor(
        private authService: AuthService,
        private appointmentService: AppointmentService,
        private userService: UserService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.loadAppointments();
        this.loadPatients();
    }

    loadAppointments(): void {
        this.appointmentService.getAppointments().subscribe({
            next: (data) => {
                this.appointments = data.filter(apt => apt.status === 'scheduled');
            }
        });
    }

    loadPatients(): void {
        this.userService.getMyPatients().subscribe({
            next: (data) => {
                this.patients = data;
            }
        });
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
