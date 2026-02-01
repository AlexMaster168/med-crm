import { Component, OnInit } from '@angular/core';
import { FamilyDoctorService } from '../../services/family-doctor.service';

@Component({
  selector: 'app-patients-list',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsListComponent implements OnInit {
  patients: any[] = [];

  constructor(private familyDoctorService: FamilyDoctorService) {}

  ngOnInit(): void {
    this.familyDoctorService.getMyPatients().subscribe(data => {
      this.patients = data;
    });
  }
}