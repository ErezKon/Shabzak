import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Mission } from '../models/mission.model';
import { MissionInstance } from '../models/mission-instance.model';
import { GetAvailableSoldiers } from '../models/get-available-soldier.model';
import { SoldierMission } from '../models/soldier-mission.model';

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
          ...s.mission,
          soldierMissions: []
        },
        soldier: s.soldier,
        missionPosition: s.missionPosition
      }
    })
    console.log(JSON.stringify(data));
    return this.http.post<void>(`${this.serverURL}/AssignSoldiersToMissionInstance`, data);
  }
}
