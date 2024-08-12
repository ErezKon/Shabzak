import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AssignmentsPerSoldier } from '../models/metadata/assignments-per-soldier.model';
import { Observable } from 'rxjs';
import { HoursPerSoldier } from '../models/metadata/hours-per-soldier.model';
import { AssignmentBreakdownPerSoldier } from '../models/metadata/assignment-breakdown-per-soldier.model';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  private serverURL: string;
  constructor(private http: HttpClient) { 
    this.serverURL = `${environment.serverURL}/Metadata`;
  }

  getAssignmentsPerSoldiers(from: Date, to: Date): Observable<Array<AssignmentsPerSoldier>> {
    return this.http.post<Array<AssignmentsPerSoldier>>(`${this.serverURL}/GetAssignmentsPerSoldiers`, {from, to});
  }

  getHoursPerSoldiers(from: Date, to: Date): Observable<Array<HoursPerSoldier>> {
    return this.http.post<Array<HoursPerSoldier>>(`${this.serverURL}/GetHoursPerSoldiers`, {from, to});
  }

  getAssignmentsBreakdownPerSoldiers(from: Date, to: Date): Observable<Array<AssignmentBreakdownPerSoldier>> {
    return this.http.post<Array<AssignmentBreakdownPerSoldier>>(`${this.serverURL}/GetAssignmentsBreakdownPerSoldiers`, {from, to});
  }
}
