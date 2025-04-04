import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';

import * as missionActions from '../../../state-management/actions/missions.actions';
import * as soldierActions from '../../../state-management/actions/soldiers.actions';

import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { MissionInstance } from '../../../models/mission-instance.model';
import { map, Observable } from 'rxjs';
import { selectMissionInstances, selectMissions } from '../../../state-management/selectors/missions.selector';
import { InstanceViewComponent } from '../manually-assign/instance-view/instance-view.component';
import { SoldiersSelectComponent } from '../manually-assign/soldiers-select/soldiers-select.component';
import { Soldier } from '../../../models/soldier.model';
import { selectSoldiers } from '../../../state-management/selectors/soldiers.selector';
import { CommonModule } from '@angular/common';
import { MissionsSelectComponent } from '../../missions/missions-select/missions-select.component';
import { Mission } from '../../../models/mission.model';
import { defaultStartEndTime } from '../../missions/missions-container/missions-container.component';
import { mergeDateTime } from '../../../utils/date.util';

@Component({
  selector: 'app-auto-assign',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDatepickerModule,
    ReactiveFormsModule,
    MissionsSelectComponent,
    SoldiersSelectComponent
  ],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}],
  templateUrl: './auto-assign.component.html',
  styleUrl: './auto-assign.component.scss'
})
export class AutoAssignComponent extends BaseComponent {
  private initialDate = new Date();
  startDateForm = new FormControl(this.initialDate);
  endDateForm = new FormControl(this.initialDate);

  datesSelected = false;

  missionInstances$: Observable<Array<MissionInstance>>;
  soldiers$!: Observable<Array<Soldier>>;
  missions$!: Observable<Array<Mission>>;
  instanceToMissionDic$: Observable<Map<number, string>>;

  selectedInstances?: Array<MissionInstance>;
  selectedMissions?: Array<Mission>;
  selectedSoldiers?: Array<number>;

  fromHour!: string;
  toHour!: string;

  constructor(public dialogRef: MatDialogRef<AutoAssignComponent>, private store: Store<AppState>) {
    super();
    this.addSub(this.startDateForm.valueChanges.subscribe(val => {
      this.getMissionInstances();
    }));
    this.addSub(this.endDateForm.valueChanges.subscribe(val => {
      this.getMissionInstances();
    }));
    this.store.dispatch(soldierActions.getSoldiers());
    this.missionInstances$ = store.pipe(select(selectMissionInstances));
    this.soldiers$ = this.store.pipe(select(selectSoldiers));
    this.missions$ = this.store.pipe(select(selectMissions));

    this.fromHour = defaultStartEndTime;
    this.toHour = defaultStartEndTime;
    
    this.instanceToMissionDic$ = store.pipe(select(selectMissions))
      .pipe(map(missions => {
        const dic = new Map<number, string>();
        for (const mission of missions) {
          for (const instance of mission.missionInstances) {
            dic.set(instance.id, mission.name);
          }
        }
        return dic;
      }));
  }

  onCancelClick() {
    this.dialogRef.close();
  }
  
  onOk() {
    this.dialogRef.close({
      from: mergeDateTime(this.startDateForm.value, this.fromHour),
      to: mergeDateTime(this.endDateForm.value, this.toHour),
      missions: this.selectedMissions?.map(m => m.id) ?? [],
      soldiers: this.selectedSoldiers ?? []
    });
  }

  getMissionInstances() {
    if(this.startDateForm.value && this.endDateForm.value && this.startDateForm.value !== this.initialDate && this.endDateForm.value !== this.initialDate) {
      this.store.dispatch(missionActions.getMissionInstancesInRange({from: this.startDateForm.value, to: this.endDateForm.value, fullDay: true, unassignedOnly: true}));
      this.datesSelected = true;
    }
  }

  onInstancesSelect(instances: Array<MissionInstance>) {
    this.selectedInstances = instances;
  }

  onSoldiersSelected(soldiers: Array<number>) {
    this.selectedSoldiers = soldiers;
  }

  onMissionsSelected(missions: Array<Mission>) {
    this.selectedMissions = missions;
  }
}
