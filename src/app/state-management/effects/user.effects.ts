import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { UserService } from '../../services/user.service';
import { AppState } from '../states/app.state';

import * as userActions from '../actions/user.actions';
import { exhaustMap, map, catchError, of } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';
import { addDays } from '../../utils/date.util';
import { encryptAES } from '../../utils/aes';

@Injectable()
export class UserEffects {

  constructor(private actions$: Actions,
    private usersService: UserService,
    private router: Router,
    private snackbar: SnackbarService,
    private store: Store<AppState>) {
  }

  login$ = createEffect(() => this.actions$.pipe(
    ofType(userActions.login),
    exhaustMap((action) => this.usersService.login(action.username, action.password)
      .pipe(
        map(res => {
            if(res.success && res.value) {
                this.usersService.setLoggeduser(res.value);
                const json = JSON.stringify({...res.value, valid: addDays(new Date(), 7)});
                const userJson = encryptAES(json);
                localStorage.setItem('user', userJson);
                this.router.navigateByUrl('personal-page');
                return userActions.loginSuccess({ user: res.value });
            }
            if(res.errorMessage) {
                this.snackbar.openSnackBar(res.errorMessage);
            }
            return userActions.loginFailure();
        }),
        catchError(err => {
            console.error(err);
            this.snackbar.openSnackBar('שגיאה במהלך ההתחברות');
            return of(userActions.loginFailure());
        })
      ))
  ));

  createUsersForSoldiers$ = createEffect(() => this.actions$.pipe(
    ofType(userActions.createUsersForSoldiers),
    exhaustMap((action) => this.usersService.createUsersForSoldiers(action.soldierIds)
      .pipe(
        map(res => {
            if(res.success && res.value) {
                this.snackbar.openSnackBar(`נוספו בהצלחה ${res.value} משתמשים`);
                return userActions.createUsersForSoldiersSuccess();
            }
            if(res.errorMessage) {
                this.snackbar.openSnackBar(res.errorMessage);
            }
            return userActions.createUsersForSoldiersFailure();
        }),
        catchError(err => {
            console.error(err);
            this.snackbar.openSnackBar('שגיאה בהוספת משתמשים');
            return of(userActions.createUsersForSoldiersFailure());
        })
      ))
  ));
}