import { Injectable } from "@angular/core";
import { MissionService } from "../../services/mission.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AppState } from "../states/app.state";

import * as missionActions from '../actions/missions.actions';
import { exhaustMap, map, catchError, of } from "rxjs";
import { Mission } from "../../models/mission.model";
import { SnackbarService } from "../../services/snackbar.service";

@Injectable()
export class MissionsEffects {

  constructor(private actions$: Actions,
    private missionsService: MissionService,
    private snackbar: SnackbarService,
    private store: Store<AppState>) {
  }

  getMissions$ = createEffect(() => this.actions$.pipe(
    ofType(missionActions.getMissions),
    exhaustMap(() => this.missionsService.getMissions()
      .pipe(
        map(res => {
            return missionActions.getMissionsSuccess({ missions: res as Array<Mission> });
        }),
        catchError(err => {
            console.error(err);
            this.snackbar.openSnackBar('שגיאה בקבלת המשימות');
            return of(missionActions.getMissionsFailure());
        })
      ))
  ));

  addMission$ = createEffect(() => this.actions$.pipe(
    ofType(missionActions.addMission),
    exhaustMap((action) => this.missionsService.addMission(action.mission)
      .pipe(
        map(res => {
            this.snackbar.openSnackBar('המשימה נוספה בהצלחה');
            return missionActions.addMissionSuccess({ mission: res });
        }),
        catchError(err => {
            console.error(err);
            this.snackbar.openSnackBar('שגיאה בהוספת משימה');
            return of(missionActions.addMissionFailure());
        })
      ))
  ));

  updateMission$ = createEffect(() => this.actions$.pipe(
    ofType(missionActions.updateMission),
    exhaustMap((action) => this.missionsService.updateMission(action.mission)
      .pipe(
        map(res => {
            this.snackbar.openSnackBar('המשימה עודכנה בהצלחה');
            return missionActions.updateMissionSuccess({ mission: res });
        }),
        catchError(err => {
            console.error(err);
            this.snackbar.openSnackBar('שגיאה בעדכון משימה');
            return of(missionActions.updateMissionFailure());
        })
      ))
  ));

  deleteMission$ = createEffect(() => this.actions$.pipe(
    ofType(missionActions.deleteMission),
    exhaustMap((action) => this.missionsService.deleteMission(action.missionId)
      .pipe(
        map(res => {
            this.snackbar.openSnackBar('המשימה הוסרה בהצלחה');
            return missionActions.deleteMissionSuccess({missionId:res});
        }),
        catchError(err => {
            console.error(err);
            this.snackbar.openSnackBar('שגיאה בהסרת משימה');
            return of(missionActions.deleteMissionFailure());
        })
      ))
  ));
}