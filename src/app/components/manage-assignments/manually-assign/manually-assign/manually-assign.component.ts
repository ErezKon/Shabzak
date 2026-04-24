import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AvailableSoldiersComponent } from '../available-soldiers/available-soldiers.component';
import { InstanceViewComponent } from '../instance-view/instance-view.component';
import { SelectionSummaryComponent } from '../selection-summary/selection-summary.component';
import { SoldiersSelectComponent } from '../soldiers-select/soldiers-select.component';
import { MissionInstance } from '../../../../models/mission-instance.model';
import { Soldier } from '../../../../models/soldier.model';
import { GetAvailableSoldiers } from '../../../../models/get-available-soldier.model';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../../state-management/states/app.state';

import * as missionActions from '../../../../state-management/actions/missions.actions';
import * as soldierActions from '../../../../state-management/actions/soldiers.actions';
import { AssignedMissionPosition, MissionPosition } from '../../../../models/mission-position.model';
import { Position } from '../../../../models/position.enum';
import { SoldierMission } from '../../../../models/soldier-mission.model';
import {Mission} from '../../../../models/mission.model';
import {selectMissions} from '../../../../state-management/selectors/missions.selector';

@Component({
  selector: 'app-manually-assign',
  standalone: true,
  imports: [
    InstanceViewComponent,
    SoldiersSelectComponent,
    AvailableSoldiersComponent,
    SelectionSummaryComponent
  ],
  templateUrl: './manually-assign.component.html',
  styleUrl: './manually-assign.component.scss'
})
export class ManuallyAssignComponent implements OnInit {
  @Input() missionInstances!: Array<MissionInstance>;
  @Input() soldiers!: Array<Soldier>;
  @Input() availableSoldiers!: Array<GetAvailableSoldiers>;

  @Output() assignSoldiers = new EventEmitter<SoldierMission[]>();

  
  selectedInstance?: MissionInstance;
  soldiersSelected: Array<number> = [];
  defaultInstance!: MissionInstance;
  selectedAvailableSoldiers?: Array<Soldier>;

  selectedInstanceAssignedSoldiers?: Array<Soldier>;

  assignedMisionPositions?: Array<AssignedMissionPosition>;

  canSelectSoldiers = true;
  private soldiersMission = new Array<SoldierMission>();
  
  errors = new Array<string>();
  private readonly assignedTooMuchError = 'שים לב, שיבצת יותר חיילים משנדרש לתפקיד.';

  private instanceToMissionDic = new Map<number, Mission>();

  constructor(private store: Store<AppState>) {

  }
  ngOnInit(): void {
    if(this.missionInstances?.length) {
      const instance = this.missionInstances[0];
      this.selectedInstance = instance;
      this.store.dispatch(missionActions.getAvailableSoldiers({
        missionInstanceId: instance.id, 
        soldiersPool: this.soldiersSelected?.length ? this.soldiersSelected : undefined
      }));
    }
    this.store.pipe(select(selectMissions))
    .subscribe(missions => {
      if(missions?.length) {
        for (const mission of missions) {
          for (const instance of mission.missionInstances ?? []) {
            this.instanceToMissionDic.set(instance.id, mission);
          }
        }
      }
    })
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
    const mission = this.instanceToMissionDic.get(this.selectedInstance?.id ?? 0);
    this.soldiersMission = new Array<SoldierMission>();
    if(mission && mission.positions && mission.positions.length === 1 && soldiers?.length === 1) {
      const position: MissionPosition = mission.positions[0];
      this.soldiersMission.push({
        id: 0,
        soldier: soldiers[0],
        missionInstance: this.selectedInstance,
        missionPosition: {
          id: position.id,
          count: 1,
          position: position.position
        } as MissionPosition
      } as SoldierMission);
      this.assignSoldiers.emit(this.soldiersMission);
      return;
    }
    this.selectedAvailableSoldiers = soldiers;
    this.initAssigned();
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
                missionInstance: this.selectedInstance,
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
            missionInstance: this.selectedInstance,
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
              missionInstance: this.selectedInstance,
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
            missionInstance: this.selectedInstance,
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
              missionInstance: this.selectedInstance,
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
              missionInstance: this.selectedInstance,
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
              missionInstance: this.selectedInstance,
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

    this.assignSoldiers.emit(this.soldiersMission);
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
