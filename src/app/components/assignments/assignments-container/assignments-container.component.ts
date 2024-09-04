import { Component } from '@angular/core';
import { AssignmentsFilterComponent } from "../assignments-filter/assignments-filter.component";
import { AssignmentMode } from '../models/show-assignment-mode.model';
import { CommonModule } from '@angular/common';
import { AssignmentsByDayComponent } from '../assignments-by-day/assignments-by-day.component';
import { AssignmentsBySoldierComponent } from '../assignments-by-soldier/assignments-by-soldier.component';
import { AssignmentsByMissionComponent } from '../assignments-by-mission/assignments-by-mission.component';

import * as missionActions from '../../../state-management/actions/missions.actions';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { AssignmentsFilter } from '../models/assignments-filter.model';
import { selectMissions } from '../../../state-management/selectors/missions.selector';
import { Mission } from '../../../models/mission.model';
import { Assignment } from '../models/assignment.model';
import { AssignmentSoldier } from '../models/assignment-soldier.model';
import { MissionInstance } from '../../../models/mission-instance.model';
import { Position } from '../../../models/position.enum';
import { AssignmentByMission } from '../models/assignment-by-mission.model';


@Component({
  selector: 'app-assignments-container',
  standalone: true,
  imports: [CommonModule, AssignmentsFilterComponent, AssignmentsByDayComponent, AssignmentsBySoldierComponent, AssignmentsByMissionComponent, BaseComponent],
  templateUrl: './assignments-container.component.html',
  styleUrl: './assignments-container.component.scss'
})
export class AssignmentsContainerComponent extends BaseComponent{
  assignmentMode = AssignmentMode.ByDay;
  AssignmentMode = AssignmentMode;

  filter$!: BehaviorSubject<AssignmentsFilter>;
  filter!: AssignmentsFilter;

  assignmentsByDayByMission?: Map<string, Array<AssignmentByMission>>;

  constructor(store: Store<AppState>) {
    super();
    
    let date = new Date();
    date.setDate(date.getDate() - 1);
    this.filter = {
      from: date,
      to: new Date(),
      showMode: AssignmentMode.ByDay
    };
    this.filter$ = new BehaviorSubject<AssignmentsFilter>(this.filter);
    store.dispatch(missionActions.getMissions());
    const missions$ = store.pipe(select(selectMissions));

    this.addSub(combineLatest({
      missions: missions$,
      filter: this.filter$.asObservable()
    }).subscribe(val => {
      this.assignmentMode = val.filter.showMode;
      this.loadAssignmentsByDayModel(val.missions, val.filter);
    }));
  }

  private loadAssignmentsByDayModel(missions: Array<Mission>, filter: AssignmentsFilter) {
    const allDates = Array.from(new Set(missions.flatMap(m => m.missionInstances.map(mi => this.parseStrToDate(mi.fromTime)))));
    const tempMap = new Map<string, Map<string, Array<Assignment>>>();

    const maxDate = allDates?.reduce(function (a, b) { return a > b ? a : b; });
    const minDate = allDates?.reduce(function (a, b) { return a < b ? a : b; });
    for (const mission of missions) {
      for (const missionInstance of mission.missionInstances) {
        const date = this.parseStrToDate(missionInstance.fromTime);
        
        const startDateSpl = missionInstance.fromTime.split(' ');
        const datePart = startDateSpl[0];
        if(date >= (filter.from ?? minDate) && date <= (filter.to ?? maxDate)) {
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
      positionsCount: positions
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

  private parseStrToDate(dateStr: string): Date {
    const spl = dateStr.split(' ')[0].split('/').reverse().join('-');
    return new Date(spl);
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

}
