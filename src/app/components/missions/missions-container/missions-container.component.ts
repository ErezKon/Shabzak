import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { Mission } from '../../../models/mission.model';
import { selectMissions } from '../../../state-management/selectors/missions.selector';
import { AppState } from '../../../state-management/states/app.state';
import { MissionsAddEditComponent } from '../missions-add-edit/missions-add-edit.component';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MissionsFilterComponent } from '../missions-filter/missions-filter.component';
import { MissionsComponent } from '../missions/missions.component';

import * as missionActions from '../../../state-management/actions/missions.actions';

@Component({
  selector: 'app-missions-container',
  standalone: true,
  imports: [CommonModule, MissionsComponent, MissionsFilterComponent, MatIconModule, MatButtonModule, BaseComponent],
  templateUrl: './missions-container.component.html',
  styleUrl: './missions-container.component.scss'
})
export class MissionsContainerComponent extends BaseComponent{
  missions$ = new BehaviorSubject<Array<Mission>>([]);
  allMissions: Array<Mission> = [];

  constructor(private store: Store<AppState>, public dialog: MatDialog) {
    super();
    this.store.dispatch(missionActions.getMissions());
    this.addSub(this.store.pipe(select(selectMissions))
    .subscribe(missions => {
      this.missions$.next(missions);
      this.allMissions = missions;
    }));
  }

  onEditMission(mission: Mission) {
    const dialogRef = this.dialog.open(MissionsAddEditComponent, {
      data: mission,
      width: '80vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        const action = missionActions.updateMission({mission:result});
        this.store.dispatch(action);
      }
    });
  }

  //onFilterMissions(filter: MissionsFilter) {
      // let filtered = [...this.allMissions];
      // if(filter.text) {
      //   filtered = filtered.filter(s => s.name.indexOf(filter.text as string) !== -1 || s.personalNumber.indexOf(filter.text as string) !== -1 || s.phone.indexOf(filter.text as string) !== -1);
      // }
      // if(filter.platoon) {
      //   filtered = filtered.filter(s => s.platoon === filter.platoon);
      // }
      // if(filter.company) {
      //   filtered = filtered.filter(s => s.company === filter.company);
      // }
      // this.missions$.next(filtered);
  //}

  onAddMission() {
    const dialogRef = this.dialog.open(MissionsAddEditComponent, {
      data: {},
      width: '95vw',
      height: '95vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.store.dispatch(missionActions.addMission({mission: {...result, vacations: []}}));
      }
    });
  }

  onDeleteMission(missionId: number) {
    this.store.dispatch(missionActions.deleteMission({missionId: missionId}));
  }
}
