import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-candidate-rank-breakdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-rank-breakdown.component.html',
  styleUrl: './candidate-rank-breakdown.component.scss'
})
export class CandidateRankBreakdownComponent {

  constructor(
    public dialogRef: MatDialogRef<CandidateRankBreakdownComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: Map<string, number>) {

    }
}
