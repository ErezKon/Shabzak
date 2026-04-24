import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { Position } from '../../../models/position.enum';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';
import { ReplacementCandidate } from '../../../models/replacement-candidate.model';
import * as missionActions from '../../../state-management/actions/missions.actions';
import { selectReplacementCandidates, selectFetchingReplacementCandidates } from '../../../state-management/selectors/missions.selector';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest } from 'rxjs';

export interface ReplaceSoldierDialogData {
    missionInstanceId: number;
    excludeSoldierId: number;
    soldierPosition: Position;
}

@Component({
  selector: 'app-replace-soldier-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './replace-soldier-dialog.component.html',
  styleUrl: './replace-soldier-dialog.component.scss'
})
export class ReplaceSoldierDialogComponent extends BaseComponent {

  candidates$!: Observable<Array<ReplacementCandidate>>;
  loading$!: Observable<boolean>;
  filteredCandidates: Array<ReplacementCandidate> = [];
  nameFilterControl = new FormControl('');

  private allCandidates: Array<ReplacementCandidate> = [];

  constructor(
    public dialogRef: MatDialogRef<ReplaceSoldierDialogComponent>,
    public dialog: MatDialog,
    private store: Store<AppState>,
    @Inject(MAT_DIALOG_DATA) public data: ReplaceSoldierDialogData
  ) {
    super();
    this.load();
  }

  private load() {
    this.store.dispatch(missionActions.getReplacementCandidates({
      missionInstanceId: this.data.missionInstanceId,
      excludeSoldierId: this.data.excludeSoldierId
    }));
    this.candidates$ = this.store.pipe(select(selectReplacementCandidates));
    this.loading$ = this.store.pipe(select(selectFetchingReplacementCandidates));

    this.addSub(this.candidates$.subscribe(candidates => {
      this.allCandidates = candidates;
      this.applyFilter(this.nameFilterControl.value ?? '');
    }));

    this.addSub(this.nameFilterControl.valueChanges.subscribe(val => {
      this.applyFilter(val ?? '');
    }));
  }

  private applyFilter(val: string) {
    if (val) {
      this.filteredCandidates = this.allCandidates.filter(c =>
        c.soldier.name.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1
      );
    } else {
      this.filteredCandidates = this.allCandidates;
    }
  }

  onCandidateSelected(candidate: ReplacementCandidate) {
    if (candidate.isAssignedToThisInstance) {
      return;
    }

    if (candidate.hasOverlap) {
      const message = `החייל כבר משובץ ל${candidate.overlappingMissionName} בזמן זה. האם ברצונך להחליף בין החיילים?`;
      if (confirm(message)) {
        this.store.dispatch(missionActions.replaceSoldierInMissionInstance({
          missionInstanceId: this.data.missionInstanceId,
          oldSoldierId: this.data.excludeSoldierId,
          newSoldierId: candidate.soldier.id,
          swap: true,
          swapMissionInstanceId: candidate.overlappingMissionInstanceId
        }));
        this.dialogRef.close();
      }
    } else {
      this.store.dispatch(missionActions.replaceSoldierInMissionInstance({
        missionInstanceId: this.data.missionInstanceId,
        oldSoldierId: this.data.excludeSoldierId,
        newSoldierId: candidate.soldier.id,
        swap: false
      }));
      this.dialogRef.close();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
