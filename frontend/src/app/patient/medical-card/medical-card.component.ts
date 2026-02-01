import { Component, OnInit } from '@angular/core';
import { MedicalCardService } from '../../services/medical-card.service';
import { MedicalCard } from '../../models/medical-card.model';

@Component({
  selector: 'app-medical-card',
  templateUrl: './medical-card.component.html',
  styleUrls: ['./medical-card.component.css']
})
export class MedicalCardComponent implements OnInit {
  medicalCard: MedicalCard | null = null;

  constructor(private medicalCardService: MedicalCardService) {}

  ngOnInit(): void {
    this.medicalCardService.getMyCard().subscribe(data => {
      this.medicalCard = data;
    });
  }
}