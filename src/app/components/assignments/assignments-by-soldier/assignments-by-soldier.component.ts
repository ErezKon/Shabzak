import { Component, Input, OnDestroy } from '@angular/core';
import {SoldierMission} from '../../../models/soldier-mission.model';
import {InstanceToMissionDic} from '../../../utils/helpers/mission-instance-dictionary.helper';
import {Observable, Subscription} from 'rxjs';
import {Mission} from '../../../models/mission.model';
import {parseStrToDate} from '../../../utils/date.util';
import {CommonModule, DatePipe} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-assignments-by-soldier',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './assignments-by-soldier.component.html',
  styleUrl: './assignments-by-soldier.component.scss'
})
export class AssignmentsBySoldierComponent implements OnDestroy {
  @Input() soldierAssByDay?: Map<{id: number, name: string}, Map<string, Array<SoldierMission>>>;
  @Input() instanceToMissionDic?: Map<number, Mission>;

  nameFilterControl = new FormControl('');
  soldierFilter: string | null = '';

  private sub: Subscription;

  parseStrToDate = parseStrToDate;

  constructor(){
    this.sub = this.nameFilterControl.valueChanges
    .subscribe(val => {
      this.soldierFilter = val;
    });
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
