import { Injectable } from "@angular/core";
import { SoldierService } from "../../services/soldier.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AppState } from "../states/app.state";

import * as soldierActions from '../actions/soldiers.actions';
import { exhaustMap, map, catchError, of } from "rxjs";
import { Soldier } from "../../models/soldier.model";
import { SnackbarService } from "../../services/snackbar.service";

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
}