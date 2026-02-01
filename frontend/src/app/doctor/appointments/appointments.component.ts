import { Component, OnInit } from '@angular/core';
import { AppointmentsService } from '../../services/appointments.service';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(private appointmentsService: AppointmentsService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentsService.getDoctorAppointments().subscribe(data => {
      this.appointments = data;
    });
  }

  completeAppointment(id: string): void {
    this.appointmentsService.update(id, { status: AppointmentStatus.COMPLETED }).subscribe(() => {
      this.loadAppointments();
    });
  }
}