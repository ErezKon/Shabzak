import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { UserRole } from '../models/user-role.enum';
import { encryptSHA } from '../utils/sha256';
import { GeneralResponse } from '../models/general-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private serverURL: string;
  constructor(private http: HttpClient) { 
    this.serverURL = `${environment.serverURL}/User`;
  }

  login(username: string, password: string): Observable<GeneralResponse<User>> {
    const user = {
      username,
      password
    };
    return this.http.post<GeneralResponse<User>>(`${this.serverURL}/Login`, user);
  }

  createUsersForSoldiers(soldierIds: number[]): Observable<GeneralResponse<number>> {
    return this.http.post<GeneralResponse<number>>(`${this.serverURL}/CreateUsersForSoldiers`, soldierIds);
  }
}
