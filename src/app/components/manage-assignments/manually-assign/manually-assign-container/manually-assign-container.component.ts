import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { Mission } from '../../../../models/mission.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { BaseComponent } from '../../../../utils/base-component/base-component.component';
import { InstanceViewComponent } from '../instance-view/instance-view.component';
import { SoldiersSelectComponent } from '../soldiers-select/soldiers-select.component';

import * as missionActions from '../../../../state-management/actions/missions.actions';
import * as soldierActions from '../../../../state-management/actions/soldiers.actions';

import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../state-management/states/app.state';
import { MissionInstance } from '../../../../models/mission-instance.model';
import { AvailableSoldiersComponent } from '../available-soldiers/available-soldiers.component';
import { Observable } from 'rxjs';
import { Soldier } from '../../../../models/soldier.model';
import { selectSoldiers } from '../../../../state-management/selectors/soldiers.selector';
import { CommonModule } from '@angular/common';
import { GetAvailableSoldiers } from '../../../../models/get-available-soldier.model';
import { selectAvalableSoldiers } from '../../../../state-management/selectors/missions.selector';
import { SelectionSummaryComponent } from '../selection-summary/selection-summary.component';
import { AssignedMissionPosition, MissionPosition } from '../../../../models/mission-position.model';
import { Position } from '../../../../models/position.enum';
import { SoldierMission } from '../../../../models/soldier-mission.model';
import { ManuallyAssignComponent } from '../manually-assign/manually-assign.component';

@Component({
  selector: 'app-manually-assign-container',
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
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatChipsModule,
    MatIconModule,
    ReactiveFormsModule,
    ManuallyAssignComponent
  ],
  templateUrl: './manually-assign-container.component.html',
  styleUrl: './manually-assign-container.component.scss'
})
export class ManuallyAssignContainerComponent extends BaseComponent{

  selectedInstance?: MissionInstance;
  soldiersSelected: Array<number> = [];
  soldiers$!: Observable<Array<Soldier>>;
  availableSoldiers$!: Observable<Array<GetAvailableSoldiers>>;
  defaultInstance!: MissionInstance;
  selectedAvailableSoldiers?: Array<Soldier>;

  selectedInstanceAssignedSoldiers?: Array<Soldier>;

  assignedMisionPositions?: Array<AssignedMissionPosition>;

  canSelectSoldiers = true;

  errors = new Array<string>();
  private readonly assignedTooMuchError = 'שים לב, שיבצת יותר חיילים משנדרש לתפקיד.';
  private soldiersMission = new Array<SoldierMission>();

  constructor(public dialogRef: MatDialogRef<ManuallyAssignContainerComponent>,
    public dialog: MatDialog,
    private store: Store<AppState>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Mission>) {
      super();
      this.load();
  }

  private load() {
    this.store.dispatch(soldierActions.getSoldiers());
    if(this.data.missionInstances?.length) {
      this.store.dispatch(missionActions.getAvailableSoldiers({
        missionInstanceId: this.data.missionInstances[0].id, 
        soldiersPool: this.soldiersSelected?.length ? this.soldiersSelected : undefined
      }));
    }
    this.defaultInstance = {} as MissionInstance;
    if(this.data.missionInstances && (this.data.missionInstances?.length ?? 0) > 0) {
      this.onInstanceSelect(this.data.missionInstances[0]);
      this.defaultInstance = this.data.missionInstances[0];
    }
    this.assignedMisionPositions = this.data?.positions
      ?.map(ap => {return {...ap}})
      ?.sort()
      ?.reverse()
      ?.map(p => {
        const ret: AssignedMissionPosition = {
          ...p,
          assigned: 0
        };
        return ret;
      }) ?? [];
    this.soldiers$ = this.store.pipe(select(selectSoldiers));
    this.availableSoldiers$ = this.store.pipe(select(selectAvalableSoldiers));

    this.addSub(this.availableSoldiers$.subscribe(availableSoldiers => {
      if(availableSoldiers?.length > 0) {
        const assigned = availableSoldiers
        .filter(as => as.isAssignedForQueriedInstance)
        .map(s => s.soldier);
        this.onAvailableSoldiersSelected(assigned)
      }
    }))
  }

  onOk() {
    this.store.dispatch(missionActions.assignSoldiersToMissionInstance({soldiers: this.soldiersMission}));
    this.load();
  }

  
  onNoClick(): void {
    this.dialogRef.close();
  }
  
  onInstanceSelect(instance: MissionInstance) {
    this.selectedInstance = instance;
    this.selectedInstanceAssignedSoldiers = instance.soldierMissions?.map(s => s.soldier) ?? [];
    this.store.dispatch(missionActions.getAvailableSoldiers({
      missionInstanceId: instance.id, 
      soldiersPool: this.soldiersSelected?.length ? this.soldiersSelected : undefined
    }));
  }

  onSoldiersSelected(soldiersSelected: Array<number>) {
    this.soldiersSelected = soldiersSelected;
    this.store.dispatch(missionActions.getAvailableSoldiers({
      missionInstanceId: this.selectedInstance?.id ?? 0, 
      soldiersPool: this.soldiersSelected?.length ? this.soldiersSelected : undefined
    }));
  }

  private initAssigned() {
    for (const ap of this.assignedMisionPositions ?? []) {
      ap.assigned = 0;
    }
  }

  private hasPosition(position: Position, positions?: Array<Position>): boolean {
    return (positions?.filter(p => p === position) ?? []).length !== 0;
  }

  onAvailableSoldiersSelected(soldiers: Array<Soldier>) {
    this.selectedAvailableSoldiers = soldiers;
    this.initAssigned();
    this.soldiersMission = new Array<SoldierMission>();
    const simplePosition = this.assignedMisionPositions?.filter(ap => ap.position === Position.Simple) ?? [];
    const allMissionPositions = this.assignedMisionPositions?.map(amp => amp.position) ?? [];
    let candidatePosition: AssignedMissionPosition | undefined = undefined;
    for (const soldier of this.selectedAvailableSoldiers ?? []) {
      let positionFound = false;
      candidatePosition = undefined;
      for (const position of soldier.positions.filter(p => p !== Position.Simple)) {
        for (const ap of this.assignedMisionPositions ?? []) {
          if (ap.position === position && !positionFound) {
            if(ap.assigned + 1 >= ap.count && candidatePosition === undefined) {
              candidatePosition = ap;
            }else {
              ap.assigned++;
              positionFound = true;
              this.soldiersMission.push({
                id: 0,
                soldier: soldier,
                mission: this.selectedInstance,
                missionPosition: {
                  id: ap.id,
                  count: ap.count,
                  position: ap.position
                } as MissionPosition
              } as SoldierMission);
              break;
            }
          }
        }
      }
      if(!positionFound) {
        if(candidatePosition !== undefined) {
          candidatePosition.assigned++;
          positionFound = true;
          this.soldiersMission.push({
            id: 0,
            soldier: soldier,
            mission: this.selectedInstance,
            missionPosition: {
              id: candidatePosition.id,
              count: candidatePosition.count,
              position: candidatePosition.position
            } as MissionPosition
          } as SoldierMission);
        } else if(this.hasPosition(Position.ClassCommander, allMissionPositions) &&
          (this.hasPosition(Position.Sergant, soldier.positions) || this.hasPosition(Position.PlatoonCommander, soldier.positions))) {
            const classCommander = this.assignedMisionPositions?.filter(ap => ap.position === Position.ClassCommander) ?? [];
            classCommander[0].assigned++;
            this.soldiersMission.push({
              id: 0,
              soldier: soldier,
              mission: this.selectedInstance,
              missionPosition: {
                id: classCommander[0].id,
                count: classCommander[0].count,
                position: classCommander[0].position
              } as MissionPosition
            } as SoldierMission);

        } else if(this.hasPosition(Position.Sergant, allMissionPositions) && (this.hasPosition(Position.PlatoonCommander, soldier.positions))) {
          const sergant = this.assignedMisionPositions?.filter(ap => ap.position === Position.Sergant) ?? [];
          sergant[0].assigned++;
          this.soldiersMission.push({
            id: 0,
            soldier: soldier,
            mission: this.selectedInstance,
            missionPosition: {
              id: sergant[0].id,
              count: sergant[0].count,
              position: sergant[0].position
            } as MissionPosition
          } as SoldierMission);
        } else if(this.hasPosition(Position.PlatoonCommander, allMissionPositions) &&
          (this.hasPosition(Position.CompanyDeputy, soldier.positions) || this.hasPosition(Position.CompanyCommander, soldier.positions))) {
            const platoonCommander = this.assignedMisionPositions?.filter(ap => ap.position === Position.Sergant) ?? [];
            platoonCommander[0].assigned++;
            this.soldiersMission.push({
              id: 0,
              soldier: soldier,
              mission: this.selectedInstance,
              missionPosition: {
                id: platoonCommander[0].id,
                count: platoonCommander[0].count,
                position: platoonCommander[0].position
              } as MissionPosition
            } as SoldierMission);
          } else if(this.hasPosition(Position.CompanyDeputy, allMissionPositions) && (this.hasPosition(Position.CompanyCommander, soldier.positions))) {
            const companyDeputy = this.assignedMisionPositions?.filter(ap => ap.position === Position.Sergant) ?? [];
            companyDeputy[0].assigned++;
            this.soldiersMission.push({
              id: 0,
              soldier: soldier,
              mission: this.selectedInstance,
              missionPosition: {
                id: companyDeputy[0].id,
                count: companyDeputy[0].count,
                position: companyDeputy[0].position
              } as MissionPosition
            } as SoldierMission);
          } else if(simplePosition.length > 0) {
            simplePosition[0].assigned++;
            this.soldiersMission.push({
              id: 0,
              soldier: soldier,
              mission: this.selectedInstance,
              missionPosition: {
                id: simplePosition[0].id,
                count: simplePosition[0].count,
                position: simplePosition[0].position
              } as MissionPosition
            } as SoldierMission);
          }
      }
    }
    this.assignedMisionPositions = this.assignedMisionPositions?.map(ap => { return {...ap}});
    this.checkIfAllPositionsAreFilled();

    if(this.checkIfAssignedMoreThanNeeded()) {
      this.errors.push(this.assignedTooMuchError);
    } else {
      this.errors = this.errors.filter(e => e !== this.assignedTooMuchError);
    }
  }

  checkIfAllPositionsAreFilled() {
    let canAssign = false;
    for (const ap of this.assignedMisionPositions ?? []) {
      if (ap.assigned < ap.count) {
        canAssign = true;
        break;
      }
    }
    this.canSelectSoldiers = canAssign;
  }
  
  checkIfAssignedMoreThanNeeded(): boolean {
    for (const ap of this.assignedMisionPositions ?? []) {
      if (ap.assigned > ap.count) {
        return true;
      }
    }
    return false;
  }
}
