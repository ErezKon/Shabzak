import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Assignment } from '../models/assignment.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TooltipModule } from '@swimlane/ngx-charts';
import { translatePosition } from '../../../utils/position.translator';
import { AssignmentByMission } from '../models/assignment-by-mission.model';
import { AssignmentSoldier } from '../models/assignment-soldier.model';
import { MatMenuModule } from '@angular/material/menu';
import { Soldier } from '../../../models/soldier.model';

@Component({
  selector: 'app-assignments-by-day',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, TooltipModule],
  templateUrl: './assignments-by-day.component.html',
  styleUrl: './assignments-by-day.component.scss'
})
export class AssignmentsByDayComponent implements OnInit, OnChanges {
  @Input() canEdit: boolean = false;
  @Input() assignmentsByDayByMission?: Map<string, Array<AssignmentByMission>>;
  @Output() removeSoldierFromMissionInstance = new EventEmitter<{soldierId: number, missionInstanceId: number}>();
  assignmentsDays!: Array<string>;
  displayDate!: string;
  displayDateIndex = 0;
  assignmentsByMission!: Array<AssignmentByMission>;

  translatePosition = translatePosition;

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.assignmentsByDayByMission) {
      this.assignmentsDays = Array.from(this.assignmentsByDayByMission.keys());
      if(this.assignmentsDays?.length) {
        this.displayDate = (this.assignmentsDays[0]) as string;
        this.displayDateIndex = 0;
        this.assignmentsByMission = this.assignmentsByDayByMission.get(this.displayDate) as Array<AssignmentByMission>;
      }
      //console.log(temp);
    }
  }

  showPreviousDay() {
    if(this.displayDateIndex > 0) {
      this.displayDateIndex--;
      this.displayDate = this.assignmentsDays[this.displayDateIndex];
      this.assignmentsByMission = this.assignmentsByDayByMission?.get(this.displayDate) as Array<AssignmentByMission>;
    }
  }

  showNextDay() {
    if(this.displayDateIndex < this.assignmentsDays.length - 1) {
      this.displayDateIndex++;
      this.displayDate = this.assignmentsDays[this.displayDateIndex];
      this.assignmentsByMission = this.assignmentsByDayByMission?.get(this.displayDate) as Array<AssignmentByMission>;
    }
  }

  onAssignmentClicked(assignment: Assignment, soldier: AssignmentSoldier) {

  }

  removeSoldier(soldier: AssignmentSoldier, assignment: Assignment) {
    this.removeSoldierFromMissionInstance.emit({
      soldierId: soldier.soldierId,
      missionInstanceId: assignment.id
    });
  }

  replaceSoldier(soldier: AssignmentSoldier, assignment: Assignment) {
    
  }
}
