import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { Mission } from '../../../models/mission.model';
import { selectAutoAssigning, selectLoading, selectMissions } from '../../../state-management/selectors/missions.selector';
import { AppState } from '../../../state-management/states/app.state';
import { MissionsAddEditComponent } from '../missions-add-edit/missions-add-edit.component';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MissionsFilterComponent } from '../missions-filter/missions-filter.component';
import { MissionsComponent } from '../missions/missions.component';

import * as missionActions from '../../../state-management/actions/missions.actions';
import { ManuallyAssignContainerComponent } from '../manually-assign/manually-assign-container/manually-assign-container.component';
import { MissionAddEditMode } from '../missions-add-edit/mission-add-edit-mode.enum';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { AutoAssignComponent } from '../auto-assign/auto-assign.component';
import { AutoAssignCandidatesComponent } from '../auto-assign-candidates/auto-assign-candidates.component';

@Component({
  selector: 'app-missions-container',
  standalone: true,
  imports: [
    CommonModule, 
    MissionsComponent, 
    MatIconModule, 
    MatButtonModule, 
    MatProgressSpinnerModule
    ],
  templateUrl: './missions-container.component.html',
  styleUrl: './missions-container.component.scss'
})
export class MissionsContainerComponent extends BaseComponent{
  missions$ = new BehaviorSubject<Array<Mission>>([]);
  loading$: Observable<boolean>;
  autoAssigning$: Observable<boolean>;
  allMissions: Array<Mission> = [];

  constructor(private store: Store<AppState>, public dialog: MatDialog) {
    super();
    this.store.dispatch(missionActions.getMissions());
    this.addSub(this.store.pipe(select(selectMissions))
    .subscribe(missions => {
      this.missions$.next(missions);
      this.allMissions = missions;
    }));
    this.loading$ = store.pipe(select(selectLoading));
    this.autoAssigning$ = store.pipe(select(selectAutoAssigning));
  }

  onEditMission(mission: Mission) {
    const dialogRef = this.dialog.open(MissionsAddEditComponent, {
      data: {
        mission: mission,
        mode: MissionAddEditMode.Edit
      },
      width: '95vw',
      height: '95vh',
      panelClass: ['lg-modal', 'no-body-scroll']
    });

    this.addSub(dialogRef.afterClosed().subscribe(result => {
      if(result) {
        const action = missionActions.updateMission({mission:result});
        this.store.dispatch(action);
      }
    }));
  }
  
  

  onManuallyAssign(mission: Mission) {
    const dialogRef = this.dialog.open(ManuallyAssignContainerComponent, {
      data: mission,
      width: '98vw',
      height: '97vh',
      panelClass: ['lg-modal', 'no-body-scroll']
    });

    this.addSub(dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.store.dispatch(missionActions.assignSoldiersToMissionInstance({soldiers:result}));
      }
    }));
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
      data: {
        mission: {},
        mode: MissionAddEditMode.Add
      },
      width: '95vw',
      height: '95vh',
      panelClass: ['lg-modal', 'no-body-scroll']
    });

    this.addSub(dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.store.dispatch(missionActions.addMission({mission: result}));
      }
    }));
  }

  onDuplicateMission(mission: Mission) {
    const dialogRef = this.dialog.open(MissionsAddEditComponent, {
      data: {
        mission: {
          ...mission,
          id: 0,
          missionInstances: mission?.missionInstances?.map(mi => 
            {
              return {
                ...mi,
                id: 0
              }
            }
          )  ?? [],
          positions: mission?.positions?.map(p => 
            {
              return {
                ...p,
                id: 0
              }
            }
          )  ?? []
        },
        mode: MissionAddEditMode.Clone
      },
      width: '95vw',
      height: '95vh',
      panelClass: ['lg-modal', 'no-body-scroll']
    });

    this.addSub(dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.store.dispatch(missionActions.addMission({mission: result}));
      }
    }));
  }

  onDeleteMission(missionId: number) {
    this.store.dispatch(missionActions.deleteMission({missionId: missionId}));
  }

  onAutoAssign() {
    const dialogRef = this.dialog.open(AutoAssignComponent, {
      width: '95vw',
      height: '95vh',
      panelClass: ['lg-modal']
    });

    this.addSub(dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.store.dispatch(missionActions.autoAssign({
          from: result.from,
          to: result.to,
          soldiers: result.soldiers,
          missions: result.missions
        }));
        this.openShowCandidates();
      }
    }));
  }

  openShowCandidates() {
    const dialogRef = this.dialog.open(AutoAssignCandidatesComponent, {
      width: '95vw',
      height: '95vh',
      panelClass: ['lg-modal', 'no-body-scroll']
    });

    this.addSub(dialogRef.afterClosed().subscribe(result => {
      if(result?.candidateId) {
        this.store.dispatch(missionActions.acceptAutoAssignCandidate({guid: result.candidateId}));
      }
    }));
  }

  onShowCandidates() {
    this.store.dispatch(missionActions.getAllCandidates());
    this.openShowCandidates();
  }
}


export const defaultStartEndTime = '06:00';