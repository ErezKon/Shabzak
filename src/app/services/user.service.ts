import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { LoginResponse } from '../models/login-response.model';
import { GeneralResponse, GeneralResponseBase } from '../models/general-response.model';
import { Store } from '@ngrx/store';
import { AppState } from '../state-management/states/app.state';

import * as userActions from '../state-management/actions/user.actions';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loggedUser?: User;

  private serverURL: string;
  constructor(private http: HttpClient, private store: Store<AppState>) { 
    this.serverURL = `${environment.serverURL}/User`;
  }

  // SECURITY: Login now returns LoginResponse (User + JWT token) instead of just User.
  login(username: string, password: string): Observable<GeneralResponse<LoginResponse>> {
    const user = {
      username,
      password
    };
    return this.http.post<GeneralResponse<LoginResponse>>(`${this.serverURL}/Login`, user);
  }

  createUsersForSoldiers(soldierIds: number[]): Observable<GeneralResponse<number>> {
    return this.http.post<GeneralResponse<number>>(`${this.serverURL}/CreateUsersForSoldiers`, soldierIds);
  }

  setLoggeduser(user: User) {
    this.loggedUser = user;
  }

  // SECURITY: Retrieve the JWT token for the Authorization header.
  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null; // SSR safety
    return localStorage.getItem('token');
  }
  
  getLoggeduser() {
    if(this.loggedUser) {
      return this.loggedUser;
    }
    // SECURITY: User data is now stored as plain JSON (no AES encryption in the client).
    // Session validity is determined by the JWT token expiry, not a custom 'valid' field.
    // SSR safety: check typeof localStorage before access.
    if (typeof localStorage === 'undefined') return undefined;
    const token = localStorage.getItem('token');
    const usr = localStorage.getItem('user');
    if(token && usr) {
      try {
        // Check JWT expiry by decoding the payload (base64).
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // JWT exp is in seconds
        if(expiry < Date.now()) {
          // Token expired — clear stored data.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return undefined;
        }
        const user: User = JSON.parse(usr);
        this.store.dispatch(userActions.loginSuccess({user}));
        this.loggedUser = user;
      } catch {
        // Corrupted token/user data — clear and return undefined.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return undefined;
      }
    }
    return this.loggedUser;
  }

  resetPassword(username: string, password: string): Observable<GeneralResponseBase> {
    return this.http.post<GeneralResponseBase>(`${this.serverURL}/ResetPassword`, {username, password, encrypted: true});
  }
}
