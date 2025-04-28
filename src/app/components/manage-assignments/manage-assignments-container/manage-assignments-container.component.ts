import { Component } from '@angular/core';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';
import { AutoAssignCandidatesComponent } from '../auto-assign-candidates/auto-assign-candidates.component';
import { AutoAssignComponent } from '../auto-assign/auto-assign.component';

import * as missionActions from '../../../state-management/actions/missions.actions';
import { selectCandidateAssignments, selectMissions } from '../../../state-management/selectors/missions.selector';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MissionsComponent } from '../../missions/missions/missions.component';
import { InstanceViewComponent } from '../manually-assign/instance-view/instance-view.component';
import { MissionInstance } from '../../../models/mission-instance.model';
import { AssignmentValidation } from '../../../models/auto-assign/assignment-validation.model';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MissionService } from '../../../services/mission.service';
import { AssignmentsContainerComponent } from '../../assignments/assignments-container/assignments-container.component';

@Component({
  selector: 'app-manage-assignments-container',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule, 
    MatButtonModule, 
    CommonModule, 
    MatCheckboxModule, 
    FormsModule, 
    MatFormFieldModule,
    MatProgressSpinnerModule,
    InstanceViewComponent,
    AssignmentsContainerComponent
  ],
  templateUrl: './manage-assignments-container.component.html',
  styleUrl: './manage-assignments-container.component.scss'
})
export class ManageAssignmentsContainerComponent extends BaseComponent {

  haveIncompleteInstances: boolean = false;
  incompleteInstances: Array<MissionInstance> = [];
  allInstances: Array<MissionInstance> = [];
  selectedManagement: string = '';
  candidates!: AssignmentValidation;

  showOnlyFaulty = true;
  instanceToMissionNameDictionary!: Map<number, string>;

  constructor(private store: Store<AppState>, public dialog: MatDialog, private missionService: MissionService) {
    super();
    this.store.dispatch(missionActions.getMissions());
    
    this.addSub(this.store.pipe(select(selectMissions))
    .subscribe(missions => {
      this.instanceToMissionNameDictionary = missionService.createInstanceToMissionNameDictionary(missions);
      this.haveIncompleteInstances = false;
      this.incompleteInstances = [];
      for (const mission of missions) {
        this.allInstances = [
          ...this.allInstances,
          ...mission.missionInstances
        ]
        for (const instance of mission.missionInstances) {
          if(!instance.isFilled && (instance.soldierMissions?.length ?? 0) > 0) {
            this.haveIncompleteInstances = true;
            this.incompleteInstances.push(instance);
          }
        }
      }
      console.log(this.incompleteInstances);
    }));
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

  onFixCandidates() {
    this.selectedManagement = 'fix';
  }

  onInstanceSelect(instance: MissionInstance) {

  }
}
