import { Component, Input } from '@angular/core';
import { AssignmentsFilterComponent } from "../assignments-filter/assignments-filter.component";
import { AssignmentMode } from '../models/show-assignment-mode.model';
import { CommonModule } from '@angular/common';
import { AssignmentsByDayComponent } from '../assignments-by-day/assignments-by-day.component';
import { AssignmentsBySoldierComponent } from '../assignments-by-soldier/assignments-by-soldier.component';
import { AssignmentsByMissionComponent } from '../assignments-by-mission/assignments-by-mission.component';

import * as missionActions from '../../../state-management/actions/missions.actions';
import * as soldierActions from '../../../state-management/actions/soldiers.actions';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { AssignmentsFilter } from '../models/assignments-filter.model';
import { selectMissionsLoading, selectMissions } from '../../../state-management/selectors/missions.selector';
import { Mission } from '../../../models/mission.model';
import { Assignment } from '../models/assignment.model';
import { AssignmentSoldier } from '../models/assignment-soldier.model';
import { MissionInstance } from '../../../models/mission-instance.model';
import { Position } from '../../../models/position.enum';
import { AssignmentByMission } from '../models/assignment-by-mission.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {selectSoldiers, selectSoldiersLoading} from '../../../state-management/selectors/soldiers.selector';
import {Soldier} from '../../../models/soldier.model';
import {SoldierMission} from '../../../models/soldier-mission.model';
import {InstanceToMissionDic} from '../../../utils/helpers/mission-instance-dictionary.helper';
import {parseStrToDate} from '../../../utils/date.util';


@Component({
  selector: 'app-assignments-container',
  standalone: true,
  imports: [
    CommonModule, 
    AssignmentsFilterComponent, 
    AssignmentsByDayComponent, 
    AssignmentsBySoldierComponent, 
    AssignmentsByMissionComponent, 
    BaseComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './assignments-container.component.html',
  styleUrl: './assignments-container.component.scss'
})
export class AssignmentsContainerComponent extends BaseComponent {
  @Input() canEdit: boolean = false;
  assignmentMode = AssignmentMode.ByDay;
  AssignmentMode = AssignmentMode;

  filter$!: BehaviorSubject<AssignmentsFilter>;
  filter!: AssignmentsFilter;
  missionsLoading$: Observable<boolean>;
  soldiersLoading$: Observable<boolean>;

  assignmentsByDayByMission?: Map<string, Array<AssignmentByMission>>;
  soldierAssByDay?: Map<{id: number, name: string}, Map<string, Array<SoldierMission>>>;

  constructor(private store: Store<AppState>, public instanceToMissionDic: InstanceToMissionDic) {
    super();

    this.missionsLoading$ = store.pipe(select(selectMissionsLoading));
    this.soldiersLoading$ = store.pipe(select(selectSoldiersLoading));
    let date = new Date();
    date.setDate(date.getDate() - 1);
    this.filter = {
      from: date,
      to: new Date(),
      showMode: AssignmentMode.ByDay
    };
    this.filter$ = new BehaviorSubject<AssignmentsFilter>(this.filter);
    store.dispatch(missionActions.getMissions());
    store.dispatch(soldierActions.getSoldiers({reloadCache: true}));
    const missions$ = store.pipe(select(selectMissions));
    const soldiers$ = store.pipe(select(selectSoldiers));
    this.instanceToMissionDic.loadDic(missions$);
    const dic = this.instanceToMissionDic.instanceToMissionDic$;

    this.addSub(combineLatest({
      missions: missions$,
      filter: this.filter$.asObservable()
    }).subscribe(val => {
      console.log(val.filter);
      this.assignmentMode = val.filter.showMode;
      this.loadAssignmentsByDayModel(val.missions, val.filter);
    }));
    
    this.addSub(combineLatest({
      soldiers: soldiers$,
      missions: missions$,
      filter: this.filter$.asObservable()
    }).subscribe(val => {
      console.log(val.filter);
      this.assignmentMode = val.filter.showMode;
      this.loadAssignmentsBySoldier(val.soldiers, val.filter);
    }));
  }

  private loadAssignmentsBySoldier(soldiers: Array<Soldier>, filter: AssignmentsFilter) {
    this.soldierAssByDay = new Map<{id: number, name: string}, Map<string, Array<SoldierMission>>>();
    
    // Adjust filter.to to end of day (23:59:59) to include missions on the last day
    const filterToEndOfDay = filter.to ? new Date(filter.to) : null;
    if (filterToEndOfDay) {
      filterToEndOfDay.setHours(23, 59, 59, 999);
    }
    
    for (const soldier of soldiers) {
      const soldierMap = new Map<string, Array<SoldierMission>>();
      const sldr = {...soldier};
      sldr.missions = [];
      for (const soldierMission of soldier.missions) {
        const slderMission = {
          ...soldierMission,
          soldier: sldr
        };
        const date = parseStrToDate(soldierMission.missionInstance.fromTime);
        
        if((!filter.from || date >= filter.from) && (!filterToEndOfDay || date <= filterToEndOfDay)) {
          const startDateSpl = soldierMission.missionInstance.fromTime.split(' ');
          const datePart = startDateSpl[0];
          
          if (!soldierMap.has(datePart)) {
            soldierMap.set(datePart, []);
          }
          soldierMap.get(datePart)!.push(slderMission);
        }
      }
      
      // Only add soldier to the map if they have missions in the date range
      if (soldierMap.size > 0) {
        this.soldierAssByDay.set({id: soldier.id, name: soldier.name}, soldierMap);
      }
    }
    console.log(this.soldierAssByDay);
  }

  private loadAssignmentsByDayModel(missions: Array<Mission>, filter: AssignmentsFilter) {
    const allDates = Array.from(new Set(missions.flatMap(m => m.missionInstances.map(mi => parseStrToDate(mi.fromTime)))));
    const tempMap = new Map<string, Map<string, Array<Assignment>>>();

    const maxDate = allDates.length > 0 ? allDates.reduce(function (a, b) { return a > b ? a : b; }) : new Date();
    const minDate = allDates.length > 0 ? allDates.reduce(function (a, b) { return a < b ? a : b; }) : new Date();
    
    // Adjust filter.to to end of day (23:59:59) to include missions on the last day
    const filterToEndOfDay = filter.to ? new Date(filter.to) : null;
    if (filterToEndOfDay) {
      filterToEndOfDay.setHours(23, 59, 59, 999);
    }
    
    for (const mission of missions) {
      for (const missionInstance of mission.missionInstances) {
        const date = parseStrToDate(missionInstance.fromTime);
        
        const startDateSpl = missionInstance.fromTime.split(' ');
        const datePart = startDateSpl[0];
        if(date >= (filter.from ?? minDate) && date <= (filterToEndOfDay ?? maxDate)) {
          const assignment = this.createAssignmentModel(mission, missionInstance);
          if(!tempMap.has(datePart)) {
            const missionMap = new Map<string, Array<Assignment>>();
            const assignmentArray: Array<Assignment> = [assignment];
            missionMap.set(mission.name, assignmentArray);
            tempMap.set(datePart, missionMap);
          } else {
            const missionMap = tempMap.get(datePart) as Map<string, Array<Assignment>>;
            if(!missionMap.has(mission.name)) {
              const assignmentArray: Array<Assignment> = [assignment];
              missionMap.set(mission.name, assignmentArray);
            } else {
              const assignmentArray = missionMap.get(mission.name);
              assignmentArray?.push(assignment);
            }
          }
        }
      }
    }
    this.assignmentsByDayByMission = new Map<string, Array<AssignmentByMission>>();
    
    tempMap.forEach((assByMission: Map<string, Assignment[]>, day: string, map: Map<string, Map<string, Assignment[]>>) => {
      const assignmentsByMissions = new Array<AssignmentByMission>;
      assByMission.forEach((assignments: Assignment[], mission: string, map: Map<string, Assignment[]>) => {
        const assignmentsByMission:AssignmentByMission = {
          missionName: mission,
          missionPositions: assignments[0].positionsCount,
          assignments: assignments
        };
        assignmentsByMissions.push(assignmentsByMission);
      });
      this.assignmentsByDayByMission?.set(day, assignmentsByMissions.sort((a1,a2) => a1.missionPositions - a2.missionPositions));
    });
    console.log(this.assignmentsByDayByMission);
  }

  private createAssignmentModel(mission: Mission, missionInstance: MissionInstance): Assignment {
    const startDateSpl = missionInstance.fromTime.split(' ');
    const endDateSpl = missionInstance.toTime.split(' ');
    const positions = this.countDifferentPositions(missionInstance);;
    const ret: Assignment = {
      id: missionInstance.id,
      missionName: mission.name,
      startDate: startDateSpl[0],
      startTime: startDateSpl[1],
      endDate: endDateSpl[0],
      endTime: endDateSpl[1],
      soldiers: missionInstance.soldierMissions?.map(sm => {
        return {
          soldierId: sm.soldier.id,
          soldierName: sm.soldier.name,
          position: sm.missionPosition.position
        } as AssignmentSoldier
      }) ?? [],
      multiplePositions: positions > 1,
      positionsCount: positions,
      isAssignmentFilled: missionInstance.isFilled
    };
    return ret;
  }

  private countDifferentPositions(missionInstance: MissionInstance): number {
    if(!missionInstance.soldierMissions?.length) {
      return 0;
    }
    const positions = new Set<Position>();
    for (const pos of missionInstance.soldierMissions) {
      positions.add(pos.missionPosition.position);
    }
    return positions.size;
  }

  onStartDateSelected(startDate: Date) {
    this.filter.from = startDate;
    this.filter$.next(this.filter);
  }
  onEndDateSelected(endDate: Date) {
    this.filter.to = endDate;
    this.filter$.next(this.filter);
    
  }
  onModeSelected(mode: AssignmentMode) {
    this.filter.showMode = mode;
    this.filter$.next(this.filter);
  }

  onRemoveSoldierFromMissionInstance(soldierId: number, missionInstanceId: number) {
    this.store.dispatch(missionActions.removeSoldierFromMissionInstance({
      soldierId,
      missionInstanceId
    }));
  }

}
