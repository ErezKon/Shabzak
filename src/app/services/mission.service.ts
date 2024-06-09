import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Mission } from '../models/mission.model';
import { MissionInstance } from '../models/mission-instance.model';
import { GetAvailableSoldiers } from '../models/get-available-soldier.model';

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
    return this.http.post<Mission>(`${this.serverURL}/AddMission`, mission);
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
}
