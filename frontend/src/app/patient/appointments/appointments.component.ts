import { Component, OnInit } from '@angular/core';
import { AppointmentsService } from '../../services/appointments.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-patient-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class PatientAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(private appointmentsService: AppointmentsService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentsService.getMyAppointments().subscribe(data => {
      this.appointments = data;
    });
  }

  cancelAppointment(id: string): void {
    if (confirm('Отменить запись?')) {
      this.appointmentsService.delete(id).subscribe(() => {
        this.loadAppointments();
      });
    }
  }
}