import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { UserService } from '../../services/user.service';
import { AppState } from '../states/app.state';

import * as userActions from '../actions/user.actions';
import { exhaustMap, map, catchError, of } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';

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
            if(res.success) {
              if(res.value) {
                // SECURITY: Store JWT token and user data separately.
                // - Token is stored as-is (it's signed by the server).
                // - User data stored as plain JSON (no client-side AES — the key was bundled).
                // - Session validity is now determined by JWT expiry, not a custom 7-day field.
                const { user, token } = res.value;
                this.usersService.setLoggeduser(user);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                this.router.navigateByUrl('personal-page');
                return userActions.loginSuccess({ user });
              } else {
                this.snackbar.openSnackBar("Wrong credentials.");
                return userActions.loginFailure();
              }
                
            }
            if(res.errorMessage) {
                this.snackbar.openSnackBar(res.errorMessage);
            } else {
              this.snackbar.openSnackBar("Failed to login.");
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
  

  resetPassword$ = createEffect(() => this.actions$.pipe(
    ofType(userActions.resetPassword),
    exhaustMap((action) => this.usersService.resetPassword(action.username, action.password)
      .pipe(
        map(res => {
            if(res.success) {
                this.snackbar.openSnackBar(`הסיסמא שונתה בהצלחה`);
                return userActions.resetPasswordSuccess();
            }
            if(res.errorMessage) {
                this.snackbar.openSnackBar(res.errorMessage);
            }
            return userActions.resetPasswordFailure();
        }),
        catchError(err => {
            console.error(err);
            this.snackbar.openSnackBar('שגיאה בשינוי סיסמא');
            return of(userActions.resetPasswordFailure());
        })
      ))
  ));
}