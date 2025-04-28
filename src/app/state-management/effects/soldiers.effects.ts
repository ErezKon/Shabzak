import { Injectable } from "@angular/core";
import { SoldierService } from "../../services/soldier.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AppState } from "../states/app.state";

import * as soldierActions from '../actions/soldiers.actions';
import { exhaustMap, map, catchError, of } from "rxjs";
import { Soldier } from "../../models/soldier.model";
import { SnackbarService } from "../../services/snackbar.service";
import { VacationRequestStatus } from "../../models/vacation-request-stats.enum";

@Injectable()
export class SoldiersEffects {

  constructor(private actions$: Actions,
    private soldiersService: SoldierService,
    private snackbar: SnackbarService,
    private store: Store<AppState>) {
  }

  getSoldiers$ = createEffect(() => this.actions$.pipe(
    ofType(soldierActions.getSoldiers),
    exhaustMap(() => this.soldiersService.getSoldiers()
      .pipe(
        map(res => {
          return soldierActions.getSoldiersSuccess({ soldiers: res as Array<Soldier> });
        }),
        catchError(err => {
          console.error(err);
          this.snackbar.openSnackBar('שגיאה בקבלת החיילים');
          return of(soldierActions.getSoldiersFailure());
        })
      ))
  ));

  addSoldier$ = createEffect(() => this.actions$.pipe(
    ofType(soldierActions.addSoldier),
    exhaustMap((action) => this.soldiersService.addSoldier(action.soldier)
      .pipe(
        map(res => {
          this.snackbar.openSnackBar('החייל הוסף בהצלחה');
          return soldierActions.addSoldierSuccess({ soldier: res });
        }),
        catchError(err => {
          console.error(err);
          this.snackbar.openSnackBar('שגיאה בהוספת חייל');
          return of(soldierActions.addSoldierFailure());
        })
      ))
  ));

  updateSoldier$ = createEffect(() => this.actions$.pipe(
    ofType(soldierActions.updateSoldier),
    exhaustMap((action) => this.soldiersService.updateSoldier(action.soldier)
      .pipe(
        map(res => {
          this.snackbar.openSnackBar('החייל עודכן בהצלחה');
          return soldierActions.updateSoldierSuccess({ soldier: res });
        }),
        catchError(err => {
          console.error(err);
          this.snackbar.openSnackBar('שגיאה בעדכון חייל');
          return of(soldierActions.updateSoldierFailure());
        })
      ))
  ));

  deleteSoldier$ = createEffect(() => this.actions$.pipe(
    ofType(soldierActions.deleteSoldier),
    exhaustMap((action) => this.soldiersService.deleteSoldier(action.soldierId)
      .pipe(
        map(res => {
          this.snackbar.openSnackBar('החייל הוסר בהצלחה');
          return soldierActions.deleteSoldierSuccess({soldierId:res});
        }),
        catchError(err => {
          console.error(err);
          this.snackbar.openSnackBar('שגיאה בהסרת חייל');
          return of(soldierActions.deleteSoldierFailure());
        })
      ))
  ));

  requestVacation$ = createEffect(() => this.actions$.pipe(
    ofType(soldierActions.requestVacation),
    exhaustMap((action) => this.soldiersService.requestVacation(action.soldierId, action.from, action.to)
      .pipe(
        map(res => {
          this.snackbar.openSnackBar('בקשת החופש נשלחה בהצלחה');
          return soldierActions.requestVacationSuccess({ vacation: res });
        }),
        catchError(err => {
          console.error(err);
          this.snackbar.openSnackBar('שגיאה בבקשת חופשה');
          return of(soldierActions.requestVacationFailure());
        })
      ))
  ));

  respondToVacation$ = createEffect(() => this.actions$.pipe(
    ofType(soldierActions.respondToVacation),
    exhaustMap((action) => this.soldiersService.respondToVacationRequest(action.vacationId, action.response)
      .pipe(
        map(res => {
          let message = action.response === VacationRequestStatus.Approved ? 'בקשת החופש אושרה בהצלחה' : 'בקשת החופש נדחתה בהצלחה';
          this.snackbar.openSnackBar(message);
          return soldierActions.respondToVacationSuccess({ vacation: res });
        }),
        catchError(err => {
          console.error(err);
          this.snackbar.openSnackBar('שגיאה במענה לבקשת חופשה');
          return of(soldierActions.respondToVacationFailure());
        })
      ))
  ));
}