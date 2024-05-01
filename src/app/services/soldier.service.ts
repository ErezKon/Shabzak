import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Soldier } from '../models/soldier.model';

@Injectable({
  providedIn: 'root'
})
export class SoldierService {

  private serverURL: string;
  private httpOptions: any;
  constructor(private http: HttpClient) { 
    this.serverURL = `${environment.serverURL}/Soldiers`;
    this.httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }
  }

  getSoldiers(): Observable<Array<Soldier>> {
    return this.http.get<Array<Soldier>>(`${this.serverURL}/GetSoldiers`)
  }
  
  addSoldier(soldier: Soldier): Observable<Soldier> {
    return this.http.post<Soldier>(`${this.serverURL}/AddSoldier`, {soldier: soldier});
  }
  
  updateSoldier(soldier: Soldier): Observable<Soldier> {
    //return this.http.post<Soldier>(`${this.serverURL}/UpdateSoldier`, {soldier: soldier}, {headers: new HttpHeaders({'Content-Type': 'application/json'})});

    return this.http.post<Soldier>(`${this.serverURL}/UpdateSoldier`, {soldier: soldier});
  }
  
  deleteSoldier(soldier: Soldier): Observable<Soldier> {
    return this.http.post<Soldier>(`${this.serverURL}/DeleteSoldier`, soldier);
  }
}
