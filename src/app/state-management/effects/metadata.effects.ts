import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../states/app.state';

import * as metadataActions from '../actions/metadata.actions';
import { exhaustMap, map, catchError, of } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';
import { MetadataService } from '../../services/metadata.service';

@Injectable()
export class MetadataEffects {

  constructor(private actions$: Actions,
    private metadataService: MetadataService,
    private snackbar: SnackbarService,
    private store: Store<AppState>) {
  }

  getAssignmentsPerSoldiers$ = createEffect(() => this.actions$.pipe(
    ofType(metadataActions.getAssignmentsPerSoldiers),
    exhaustMap((action) => this.metadataService.getAssignmentsPerSoldiers(action.range.from, action.range.to)
      .pipe(
        map(res => {
          return metadataActions.getAssignmentsPerSoldiersSuccess({ assignmentsPerSoldier: res });
        }),
        catchError(err => {
          console.error(err);
          this.snackbar.openSnackBar('שגיאה בקבלת הנתונים');
          return of(metadataActions.getAssignmentsPerSoldiersFailure());
        })
      ))
  ));

  getHoursPerSoldiers$ = createEffect(() => this.actions$.pipe(
    ofType(metadataActions.getHoursPerSoldiers),
    exhaustMap((action) => this.metadataService.getHoursPerSoldiers(action.range.from, action.range.to)
      .pipe(
        map(res => {
          return metadataActions.getHoursPerSoldiersSuccess({ hoursPerSoldier: res });
        }),
        catchError(err => {
          console.error(err);
          this.snackbar.openSnackBar('שגיאה בקבלת הנתונים');
          return of(metadataActions.getHoursPerSoldiersFailure());
        })
      ))
  ));

  updateMission$ = createEffect(() => this.actions$.pipe(
    ofType(metadataActions.getAssignmentsBreakdownPerSoldiers),
    exhaustMap((action) => this.metadataService.getAssignmentsBreakdownPerSoldiers(action.range.from, action.range.to)
      .pipe(
        map(res => {
          return metadataActions.getAssignmentsBreakdownPerSoldiersSuccess({ assignmentsBreakdownPerSoldier: res });
        }),
        catchError(err => {
          console.error(err);
          this.snackbar.openSnackBar('שגיאה בקבלת הנתונים');
          return of(metadataActions.getAssignmentsBreakdownPerSoldiersFailure());
        })
      ))
  ));
}