import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { AppState } from '../../../state-management/states/app.state';
import { selectAutoAssigning, selectCandidateAssignments as selectCandidateAssignment, selectCandidatesIds } from '../../../state-management/selectors/missions.selector';
import { CommonModule, KeyValue, KeyValuePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle, MatDialog } from '@angular/material/dialog';
import { AssignmentValidation } from '../../../models/auto-assign/assignment-validation.model';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MyKeyValue } from '../../../utils/key-value.model';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import * as missionActions from '../../../state-management/actions/missions.actions';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { CandidateRankBreakdownComponent } from '../candidate-rank-breakdown/candidate-rank-breakdown.component';
import { SoldierPositionComponent } from '../../soldiers/soldier-position/soldier-position.component';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CandidateMissionInstance } from '../../../models/auto-assign/candidate-mission-instance.model';
import { MatIconModule } from '@angular/material/icon';
import { TreeViewComponent } from '../../../utils/tree-view/tree-view.component';

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

interface InstanceNode {
  name: string;
  children?: InstanceNode[];
  instances?: CandidateMissionInstance[];
}

@Component({
  selector: 'app-auto-assign-candidates',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinner,
    MatFormFieldModule, 
    MatSelectModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatExpansionModule,
    MatInputModule, 
    MatTreeModule,
    MatIconModule,
    FormsModule,
    SoldierPositionComponent,
    TreeViewComponent
  ],
  providers: [KeyValuePipe],
  templateUrl: './auto-assign-candidates.component.html',
  styleUrl: './auto-assign-candidates.component.scss'
})
export class AutoAssignCandidatesComponent extends BaseComponent{

  loading$: Observable<boolean>;
  candidatesIds$: Observable<Array<MyKeyValue<string>>>;
  selectedCandidate$: Observable<AssignmentValidation>;
  selectedCandidateId!: string;
  //selectedCandidate$!: Observable<AssignmentValidation>;
  selectedCandidate?: AssignmentValidation;
  selectedRank?: string;

  treeNodeExpanded = new Map<number,boolean>();
  innerTreeNodeExpanded = new Map<number,boolean>();

  private _transformer = (node:InstanceNode, level: number) => {
    return {
      expandable: true,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(public dialogRef: MatDialogRef<AutoAssignCandidatesComponent>,
    private keyValuePipe: KeyValuePipe,
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private dialog: MatDialog,
    private store: Store<AppState>) {
      super();
      this.loading$ = store.pipe(select(selectAutoAssigning));
      this.candidatesIds$ = store.pipe(select(selectCandidatesIds))
        .pipe(map(ids => {
          const ret: Array<MyKeyValue<string>> = [];
          for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            ret.push({
              text: (i + 1).toString(),
              value: id
            });
          }
          if(ids.length) {
            this.updateSelectedCandidate(ids[0]);
          }
          return ret;
      }));
    this.selectedCandidate$ = store.pipe(select(selectCandidateAssignment));
  }

  candidateIdSelected(id: string) {
    this.updateSelectedCandidate(id);
  }

  private updateSelectedCandidate(id: string) {
    if(id) {
      this.selectedCandidateId = id;
      this.store.dispatch(missionActions.getCandidate({guid: id}));
    }
  }

  onRankClick(rankBreakdown: Map<string, number>) {
    const dialogRef = this.dialog.open(CandidateRankBreakdownComponent, {
      data: rankBreakdown,
      width: '45vw',
      height: '45vh',
      panelClass: []
    });
  }

  onOk() {
    this.dialogRef.close({candidateId: this.selectedCandidateId});
  }

  onNoClick() {

  }

  safeTreeNodeExpanded(map:Map<number,boolean>, index: number): boolean {
    if(map.has(index)) {
      return map.get(index) as boolean;
    }
    return false;
  }

  onTreeExpandStateChanged(expanded: boolean, map:Map<number,boolean>, index: number) {
    map.set(index, expanded);
  }
}
