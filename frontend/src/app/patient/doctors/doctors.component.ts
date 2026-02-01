import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentsService } from '../../services/appointments.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-doctors-list',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class DoctorsListComponent implements OnInit {
  doctors: User[] = [];
  selectedDoctor: User | null = null;
  appointmentDate = '';
  appointmentTime = '';
  reason = '';

  constructor(
    private appointmentsService: AppointmentsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appointmentsService.getAvailableDoctors().subscribe(data => {
      this.doctors = data;
    });
  }

  selectDoctor(doctor: User): void {
    this.selectedDoctor = doctor;
  }

  createAppointment(): void {
    if (!this.selectedDoctor || !this.appointmentDate || !this.appointmentTime) {
      alert('Заполните все поля');
      return;
    }

    const dateTime = `${this.appointmentDate}T${this.appointmentTime}:00`;
    
    this.appointmentsService.create({
      doctorId: this.selectedDoctor._id,
      dateTime,
      reason: this.reason
    }).subscribe(() => {
      alert('Запись создана успешно');
      this.router.navigate(['/patient/appointments']);
    });
  }
}