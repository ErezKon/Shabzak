import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Mission } from '../models/mission.model';
import { MissionInstance } from '../models/mission-instance.model';
import { GetAvailableSoldiers } from '../models/get-available-soldier.model';
import { SoldierMission } from '../models/soldier-mission.model';
import { toServerString } from '../utils/date.util';
import { AssignmentValidation } from '../models/auto-assign/assignment-validation.model';
import { InteractiveAutoAssignStep } from '../models/auto-assign/interactive-auto-assign-step.model';
import { InteractivePauseOn } from '../models/auto-assign/interactive-auto-assign-status';
import { CandidatePick } from '../models/auto-assign/candidate-pick.model';
import { ReplacementCandidate } from '../models/replacement-candidate.model';

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  private serverURL: string;
  constructor(private http: HttpClient) { 
    this.serverURL = `${environment.serverURL}/Mission`;
  }

  

  getMissions(): Observable<Array<Mission>> {
    return this.http.get<Array<Mission>>(`${this.serverURL}/GetMissions`)
  }
  
  addMission(mission: Mission): Observable<Mission> {
    const data: Mission = {
      ...mission,
      missionInstances: mission.missionInstances.map(mi => {
        return {
          ...mi
        };
      }),
      positions: mission.positions.map(mp => {
        return {
          ...mp
        };
      })
    }
    for (const mi of data.missionInstances) {
      mi.id = 0;
    }
    return this.http.post<Mission>(`${this.serverURL}/AddMission`, data);
  }
  
  updateMission(mission: Mission): Observable<Mission> {
    return this.http.post<Mission>(`${this.serverURL}/UpdateMission`,mission);
  }
  
  deleteMission(missionId: number): Observable<number> {
    return this.http.post<number>(`${this.serverURL}/DeleteMission?missionId=${missionId}`, {});
  }
  
  getMissionInstances(missionId: number): Observable<Array<MissionInstance>> {
    return this.http.post<Array<MissionInstance>>(`${this.serverURL}/GetMissionInstances?missionId=${missionId}`, {});
  }
  
  getAvalableSoldiers(missionInstanceId: number, soldiersPool?: Array<number>): Observable<Array<GetAvailableSoldiers>> {
    return this.http.post<Array<GetAvailableSoldiers>>(`${this.serverURL}/GetAvailableSoldiers`, {missionInstanceId, soldiersPool});
  }

  assignSoldiersToMissionInstance(soldiers: Array<SoldierMission>): Observable<void> {
    const data = soldiers.map(s => {
      return {
        id: s.id,
        missionInstance: {
          ...s.missionInstance,
          soldierMissions: []
        },
        soldier: s.soldier,
        missionPosition: s.missionPosition
      }
    })
    console.log(JSON.stringify(data));
    return this.http.post<void>(`${this.serverURL}/AssignSoldiersToMissionInstance`, data);
  }
  
  
  getMissionInstancesInRange(from: Date, to: Date, fullDay: boolean = true, unassignedOnly: boolean = true): Observable<Array<MissionInstance>> {
    return this.http.post<Array<MissionInstance>>(`${this.serverURL}/GetMissionInstancesInRange`, {
      from: toServerString(from), 
      to: toServerString(to), 
      fullDay, 
      unassignedOnly
    });
  }

  autoAssign(from: Date, to: Date, soldiers: number[], missions: number[]): Observable<Array<AssignmentValidation>> {
    return this.http.post<Array<AssignmentValidation>>(`${this.serverURL}/AutoAssign`, {
      startDate: toServerString(from), 
      endDate: toServerString(to), 
      soldiers,
      missions
    });
  }

  getAllCandidates(): Observable<Array<string>> {
    return this.http.get<Array<string>>(`${this.serverURL}/GetAllCandidates`);
  }

  getCandidate(guid: string): Observable<AssignmentValidation> {
    return this.http.post<AssignmentValidation>(`${this.serverURL}/GetCandidate?guid=${guid}`, {});
  }

  acceptAutoAssignCandidate(id: string): Observable<Array<Mission>> {
    return this.http.post<Array<Mission>>(`${this.serverURL}/AcceptAssignCandidate?candidateId=${id}`, {});
  }

  createInstanceToMissionNameDictionary(missions: Array<Mission>): Map<number, string> {
    const ret = new Map<number, string>();
    for (const mission of missions) {
      for (const instance of mission.missionInstances) {
        ret.set(instance.id, mission.name);
      }
    }
    return ret;
  }

  removeSoldierFromMissionInstance(soldierId: number, missionInstanceId: number): Observable<Array<Mission>> {
    return this.http.post<Array<Mission>>(`${this.serverURL}/RemoveSoldierFromMissionInstance?soldierId=${soldierId}&missionInstanceId=${missionInstanceId}`, {});
  }

  startInteractiveAutoAssign(
    from: Date, to: Date, soldiers: number[], missions: number[],
    pauseOn: InteractivePauseOn = 'FaultyOnly', showAllSoldiersOnPause: boolean = false
  ): Observable<InteractiveAutoAssignStep> {
    return this.http.post<InteractiveAutoAssignStep>(`${this.serverURL}/StartInteractiveAutoAssign`, {
      startDate: toServerString(from),
      endDate: toServerString(to),
      soldiers,
      missions,
      pauseOn,
      showAllSoldiersOnPause
    });
  }

  continueInteractiveAutoAssign(
    sessionId: string, picks: CandidatePick[], skipInstance: boolean
  ): Observable<InteractiveAutoAssignStep> {
    return this.http.post<InteractiveAutoAssignStep>(`${this.serverURL}/ContinueInteractiveAutoAssign`, {
      sessionId,
      picks,
      skipInstance
    });
  }

  cancelInteractiveAutoAssign(sessionId: string): Observable<void> {
    return this.http.post<void>(`${this.serverURL}/CancelInteractiveAutoAssign?sessionId=${sessionId}`, {});
  }

  getReplacementCandidates(missionInstanceId: number, excludeSoldierId: number): Observable<Array<ReplacementCandidate>> {
    return this.http.post<Array<ReplacementCandidate>>(
      `${this.serverURL}/GetReplacementCandidates`,
      { missionInstanceId, excludeSoldierId }
    );
  }

  replaceSoldierInMissionInstance(
    missionInstanceId: number,
    oldSoldierId: number,
    newSoldierId: number,
    swap: boolean,
    swapMissionInstanceId?: number
  ): Observable<Array<Mission>> {
    return this.http.post<Array<Mission>>(
      `${this.serverURL}/ReplaceSoldierInMissionInstance`,
      { missionInstanceId, oldSoldierId, newSoldierId, swap, swapMissionInstanceId }
    );
  }
}
