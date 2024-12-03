import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Mission } from '../../../models/mission.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-missions-select',
  standalone: true,
  imports: [
    MatFormFieldModule, 
    MatInputModule,
    MatCheckboxModule, 
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './missions-select.component.html',
  styleUrl: './missions-select.component.scss'
})
export class MissionsSelectComponent implements OnChanges{

  @Input() missions!: Array<Mission> | null;
  @Input() selectAll: boolean = true;

  @Output() missionsSelected = new EventEmitter<Array<Mission>>();


  selectedMissions: Array<Mission> = [];
  selectedMissionsIds: Set<number> = new Set<number>();


  ngOnChanges(changes: SimpleChanges): void {
    if(this.missions?.length && this.selectAll) {
      this.onSelectAll();
    }

  }

  onMissionSelected(mission: Mission) {
    if(this.selectedMissionsIds.has(mission.id)) {
      this.selectedMissionsIds.delete(mission.id);
      this.selectedMissions = this.selectedMissions.filter(mi => mi.id !== mission.id);
    } else {
      this.selectedMissions.push(mission);
      this.selectedMissionsIds.add(mission.id);
    }
    this.missionsSelected.emit(this.selectedMissions);
  }

  onSelectAll(event?: MatCheckboxChange) {
    console.log(event);
    if(this.missions?.length) {
      this.selectedMissionsIds = new Set<number>();
      this.selectedMissions = [];

      for (const mission of this.missions) {
        this.selectedMissionsIds.add(mission.id);
        this.selectedMissions.push(mission);
      }
      this.missionsSelected.emit(this.selectedMissions);
    }
  }
}
