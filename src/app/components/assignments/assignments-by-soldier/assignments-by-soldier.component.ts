import { Component, Input } from '@angular/core';
import {SoldierMission} from '../../../models/soldier-mission.model';
import {InstanceToMissionDic} from '../../../utils/helpers/mission-instance-dictionary.helper';
import {Observable} from 'rxjs';
import {Mission} from '../../../models/mission.model';
import {parseStrToDate} from '../../../utils/date.util';
import {CommonModule, DatePipe} from '@angular/common';

@Component({
  selector: 'app-assignments-by-soldier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assignments-by-soldier.component.html',
  styleUrl: './assignments-by-soldier.component.scss'
})
export class AssignmentsBySoldierComponent {
  @Input() soldierAssByDay?: Map<{id: number, name: string}, Map<string, Array<SoldierMission>>>;
  @Input() instanceToMissionDic?: Map<number, Mission>;

  parseStrToDate = parseStrToDate;

  constructor(){
  }
}
