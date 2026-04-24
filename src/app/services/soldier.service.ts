import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Soldier } from '../models/soldier.model';
import { Vacation } from '../models/vacation.model';
import { toServerString } from '../utils/date.util';
import { VacationRequestStatus } from '../models/vacation-request-stats.enum';
import { SoldierSummary } from '../models/soldier-summary.model';

@Injectable({
  providedIn: 'root'
})
export class SoldierService {

  private serverURL: string;
  constructor(private http: HttpClient) { 
    this.serverURL = `${environment.serverURL}/Soldiers`;
  }

  getSoldiers(reloadCache?: boolean): Observable<Array<Soldier>> {
    const url = reloadCache ? `${this.serverURL}/GetSoldiers?reloadCache=${reloadCache}` : `${this.serverURL}/GetSoldiers`; 
    return this.http.get<Array<Soldier>>(url);
  }
  
  addSoldier(soldier: Soldier): Observable<Soldier> {
    return this.http.post<Soldier>(`${this.serverURL}/AddSoldier`, soldier);
  }
  
  updateSoldier(soldier: Soldier): Observable<Soldier> {
    return this.http.post<Soldier>(`${this.serverURL}/UpdateSoldier`,soldier);
  }
  
  deleteSoldier(soldierId: number): Observable<number> {
    return this.http.post<number>(`${this.serverURL}/DeleteSoldier?soldierId=${soldierId}`, {});
  }

  requestVacation(soldierId: number, from: Date, to: Date): Observable<Vacation> {
    return this.http.post<Vacation>(`${this.serverURL}/RequestVacation`, {
      soldierId,
      from: toServerString(from),
      to: toServerString(to)
    });
  }

  respondToVacationRequest(vacationId: number, response: VacationRequestStatus): Observable<Vacation> {
    return this.http.post<Vacation>(`${this.serverURL}/RespondToVacationRequest`, {
      vacationId,
      response
    });
  }

  getVacations(soldierId?: number, vacationId?: number): Observable<Array<Vacation>> {
    return this.http.post<Array<Vacation>>(`${this.serverURL}/GetVacations`, {
      soldierId,
      vacationId
    });
  }

  getSummary(soldierId: number): Observable<SoldierSummary> {
    return this.http.post<SoldierSummary>(`${this.serverURL}/GetSummary?soldierId=${soldierId}`, {});
  }
}
