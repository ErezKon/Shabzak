import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle, MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AppState } from '../../../state-management/states/app.state';
import { selectInteractiveLoading, selectInteractiveSession } from '../../../state-management/selectors/missions.selector';
import { InteractiveAutoAssignStep } from '../../../models/auto-assign/interactive-auto-assign-step.model';
import { CandidateSoldierAssignment } from '../../../models/auto-assign/candidate-soldier-assignment.model';
import { CandidatePick } from '../../../models/auto-assign/candidate-pick.model';
import { CandidateCardComponent } from '../candidate-card/candidate-card.component';
import { CandidateRankBreakdownComponent } from '../candidate-rank-breakdown/candidate-rank-breakdown.component';
import { SoldierPositionComponent } from '../../soldiers/soldier-position/soldier-position.component';
import * as missionActions from '../../../state-management/actions/missions.actions';

export interface InteractiveAutoAssignDialogData {
  from: Date;
  to: Date;
  soldiers: number[];
  missions: number[];
}

@Component({
  selector: 'app-interactive-auto-assign',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatProgressBarModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinner,
    FormsModule,
    CandidateCardComponent,
    SoldierPositionComponent
  ],
  templateUrl: './interactive-auto-assign.component.html',
  styleUrl: './interactive-auto-assign.component.scss'
})
export class InteractiveAutoAssignComponent implements OnInit, OnDestroy {
  session$: Observable<InteractiveAutoAssignStep | null>;
  loading$: Observable<boolean>;

  selectedSoldierIds = new Set<number>();
  positionOverrides = new Map<number, number>();

  private destroy$ = new Subject<void>();
  private currentSession: InteractiveAutoAssignStep | null = null;

  constructor(
    public dialogRef: MatDialogRef<InteractiveAutoAssignComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InteractiveAutoAssignDialogData,
    private dialog: MatDialog,
    private store: Store<AppState>,
    private actions$: Actions
  ) {
    this.session$ = this.store.pipe(select(selectInteractiveSession));
    this.loading$ = this.store.pipe(select(selectInteractiveLoading));
  }

  ngOnInit() {
    this.session$.pipe(takeUntil(this.destroy$)).subscribe(session => {
      this.currentSession = session;
      if (session?.status === 'Completed') {
        this.dialogRef.close({ completed: true, result: session.result });
      }
      if (session?.status === 'Paused') {
        this.selectedSoldierIds.clear();
        this.positionOverrides.clear();
      }
    });

    this.actions$.pipe(
      ofType(
        missionActions.startInteractiveAutoAssignFailure,
        missionActions.continueInteractiveAutoAssignFailure
      ),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.dialogRef.close({ completed: false });
    });

    this.store.dispatch(missionActions.startInteractiveAutoAssign({
      from: this.data.from,
      to: this.data.to,
      soldiers: this.data.soldiers,
      missions: this.data.missions
    }));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get progressPercent(): number {
    if (!this.currentSession || this.currentSession.totalInstancesCount === 0) return 0;
    return (this.currentSession.currentIndex / this.currentSession.totalInstancesCount) * 100;
  }

  get maxSelections(): number {
    return this.currentSession?.pending?.maxSelections ?? 0;
  }

  get canContinue(): boolean {
    return this.selectedSoldierIds.size > 0;
  }

  isCandidateSelected(soldierId: number): boolean {
    return this.selectedSoldierIds.has(soldierId);
  }

  isSelectionDisabled(soldierId: number): boolean {
    return !this.selectedSoldierIds.has(soldierId) && this.selectedSoldierIds.size >= this.maxSelections;
  }

  onToggleCandidate(soldierId: number) {
    if (this.selectedSoldierIds.has(soldierId)) {
      this.selectedSoldierIds.delete(soldierId);
    } else if (this.selectedSoldierIds.size < this.maxSelections) {
      this.selectedSoldierIds.add(soldierId);
    }
  }

  onRankClicked(rankBreakdown: Map<string, number>) {
    this.dialog.open(CandidateRankBreakdownComponent, {
      data: rankBreakdown,
      width: '45vw',
      height: '45vh',
      panelClass: []
    });
  }

  onContinue() {
    if (!this.currentSession) return;
    const picks: CandidatePick[] = [];
    for (const soldierId of this.selectedSoldierIds) {
      const overridePos = this.positionOverrides.get(soldierId);
      picks.push({
        soldierId,
        missionPositionId: overridePos ?? 0
      });
    }
    this.store.dispatch(missionActions.continueInteractiveAutoAssign({
      sessionId: this.currentSession.sessionId,
      picks,
      skipInstance: false
    }));
  }

  onSkip() {
    if (!this.currentSession) return;
    this.store.dispatch(missionActions.continueInteractiveAutoAssign({
      sessionId: this.currentSession.sessionId,
      picks: [],
      skipInstance: true
    }));
  }

  onCancel() {
    if (this.currentSession?.sessionId) {
      this.store.dispatch(missionActions.cancelInteractiveAutoAssign({
        sessionId: this.currentSession.sessionId
      }));
    }
    this.dialogRef.close({ completed: false });
  }
}
