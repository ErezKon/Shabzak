import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { GeneralResponse } from '../models/general-response.model';
import { decryptAES } from '../utils/aes';
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

  setLoggeduser(user: User) {
    this.loggedUser = user;
  }
  
  getLoggeduser() {
    if(this.loggedUser) {
      return this.loggedUser;
    }
    const usr = localStorage?.getItem('user');
    if(usr) {
      const dec = decryptAES(usr);
      const user = JSON.parse(dec);
      user.valid = new Date(user.valid);
      if(user.valid.getTime() < new Date().getTime()) {
        localStorage?.removeItem('user');
      } else {
        this.store.dispatch(userActions.loginSuccess({user: user}))
        this.loggedUser = user;
      }
    }
    return this.loggedUser;
  }
}
