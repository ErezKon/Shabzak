import { Component, Input } from '@angular/core';
import { MissionInstance } from '../../../../models/mission-instance.model';
import { Soldier } from '../../../../models/soldier.model';
import { Mission } from '../../../../models/mission.model';
import { MissionPosition } from '../../../../models/mission-position.model';
import { translatePosition } from '../../../../utils/position.translator';

@Component({
  selector: 'app-selection-summary',
  standalone: true,
  imports: [],
  templateUrl: './selection-summary.component.html',
  styleUrl: './selection-summary.component.scss'
})
export class SelectionSummaryComponent {
  @Input() instance?: MissionInstance;
  @Input() positions?: Array<MissionPosition>;
  @Input() soldiers?: Array<Soldier>;

  getPositionCount(position: MissionPosition): number {
    let count = position.count;
    for (const soldier of this.soldiers ?? []) {
      for (const pos of soldier.positions) {
        if(pos === position.position) {
          count--;
        }
        // if(this.positions?.filter(p => p.position === pos)?.length !== 0) {
        //   count--;
        // }
      }
    }
    return count;
  }

  getPositionTitle(position: MissionPosition): string {
    return translatePosition(position.position);
  }
}
