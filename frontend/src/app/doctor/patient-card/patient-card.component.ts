import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MedicalCardService } from '../../services/medical-card.service';
import { MedicalCard } from '../../models/medical-card.model';

@Component({
  selector: 'app-patient-card',
  templateUrl: './patient-card.component.html',
  styleUrls: ['./patient-card.component.css']
})
export class PatientCardComponent implements OnInit {
  medicalCard: MedicalCard | null = null;
  patientId: string = '';
  showAddRecord = false;
  newRecord = {
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private medicalCardService: MedicalCardService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params['id'];
    this.loadCard();
  }

  loadCard(): void {
    this.medicalCardService.getPatientCard(this.patientId).subscribe(data => {
      this.medicalCard = data;
    });
  }

  addRecord(): void {
    this.medicalCardService.addRecord({
      patientId: this.patientId,
      ...this.newRecord
    }).subscribe(() => {
      this.showAddRecord = false;
      this.newRecord = { symptoms: '', diagnosis: '', treatment: '', notes: '' };
      this.loadCard();
    });
  }
}