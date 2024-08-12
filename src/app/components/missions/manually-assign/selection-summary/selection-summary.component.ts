import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MissionInstance } from '../../../../models/mission-instance.model';
import { Soldier } from '../../../../models/soldier.model';
import { Mission } from '../../../../models/mission.model';
import { AssignedMissionPosition, MissionPosition } from '../../../../models/mission-position.model';
import { translatePosition } from '../../../../utils/position.translator';
import { Position } from '../../../../models/position.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selection-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection-summary.component.html',
  styleUrl: './selection-summary.component.scss'
})
export class SelectionSummaryComponent implements OnChanges {
  @Input() instance?: MissionInstance;
  @Input() positions?: Array<AssignedMissionPosition>;
  @Input() soldiers?: Array<Soldier>;

  missionPositions?: Array<AssignedMissionPosition>;

  constructor(private cdRef: ChangeDetectorRef) {
    const positions = this.positions?.map(p => {
      const ret: AssignedMissionPosition = {
        ...p
      };
      return ret;
    });
    this.positions = positions;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.positions);
    console.log(changes);
    const positions = this.positions?.map(p => {
      const ret: AssignedMissionPosition = {
        ...p
      };
      return ret;
    });
    this.positions = positions;
  }

  getPositionTitle(position: AssignedMissionPosition): string {
    return translatePosition(position.position);
  }
}
