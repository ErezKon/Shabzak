import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SoldierPositionComponent } from '../../soldiers/soldier-position/soldier-position.component';
import { CandidateSoldierAssignment } from '../../../models/auto-assign/candidate-soldier-assignment.model';

@Component({
  selector: 'app-candidate-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    SoldierPositionComponent
  ],
  templateUrl: './candidate-card.component.html',
  styleUrl: './candidate-card.component.scss'
})
export class CandidateCardComponent {
  @Input() candidate!: CandidateSoldierAssignment;
  @Input() selectable: boolean = false;
  @Input() selected: boolean = false;
  @Input() disabled: boolean = false;

  @Output() toggleSelected = new EventEmitter<void>();
  @Output() rankClicked = new EventEmitter<Map<string, number>>();

  onToggle() {
    if (!this.disabled || this.selected) {
      this.toggleSelected.emit();
    }
  }

  onRankClick() {
    this.rankClicked.emit(this.candidate.rankBreakdown);
  }
}
