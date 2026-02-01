import { Component, OnInit } from '@angular/core';
import { FamilyDoctorService } from '../../services/family-doctor.service';
import { AppointmentsService } from '../../services/appointments.service';
import { User, DoctorSpecialization } from '../../models/user.model';

@Component({
  selector: 'app-family-doctor',
  templateUrl: './family-doctor.component.html',
  styleUrls: ['./family-doctor.component.css']
})
export class FamilyDoctorComponent implements OnInit {
  familyDoctor: any = null;
  therapists: User[] = [];
  showTherapists = false;

  constructor(
    private familyDoctorService: FamilyDoctorService,
    private appointmentsService: AppointmentsService
  ) {}

  ngOnInit(): void {
    this.loadFamilyDoctor();
  }

  loadFamilyDoctor(): void {
    this.familyDoctorService.getMyDoctor().subscribe({
      next: (data) => {
        this.familyDoctor = data;
      },
      error: () => {
        this.familyDoctor = null;
      }
    });
  }

  loadTherapists(): void {
    this.showTherapists = true;
    this.appointmentsService.getAvailableDoctors(DoctorSpecialization.THERAPIST).subscribe(data => {
      this.therapists = data;
    });
  }

  selectTherapist(doctorId: string): void {
    this.familyDoctorService.createContract(doctorId).subscribe(() => {
      alert('Договор заключен успешно');
      this.showTherapists = false;
      this.loadFamilyDoctor();
    });
  }

  terminateContract(): void {
    if (confirm('Расторгнуть договор с семейным врачом?')) {
      this.familyDoctorService.terminateContract().subscribe(() => {
        this.familyDoctor = null;
      });
    }
  }
}