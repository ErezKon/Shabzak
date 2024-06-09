import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { Mission } from '../../../../models/mission.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { BaseComponent } from '../../../../utils/base-component/base-component.component';
import { InstanceViewComponent } from '../instance-view/instance-view.component';
import { SoldiersSelectComponent } from '../soldiers-select/soldiers-select.component';

import * as missionActions from '../../../../state-management/actions/missions.actions';
import * as soldierActions from '../../../../state-management/actions/soldiers.actions';

import { Store, select } from '@ngrx/store';
import { AppState } from '../../../../state-management/states/app.state';
import { MissionInstance } from '../../../../models/mission-instance.model';
import { AvailableSoldiersComponent } from '../available-soldiers/available-soldiers.component';
import { Observable } from 'rxjs';
import { Soldier } from '../../../../models/soldier.model';
import { selectSoldiers } from '../../../../state-management/selectors/soldiers.selector';
import { CommonModule } from '@angular/common';
import { GetAvailableSoldiers } from '../../../../models/get-available-soldier.model';
import { selectAvalableSoldiers } from '../../../../state-management/selectors/missions.selector';
import { SelectionSummaryComponent } from '../selection-summary/selection-summary.component';

@Component({
  selector: 'app-manually-assign-container',
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
    MatDialogClose,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatChipsModule,
    MatIconModule,
    ReactiveFormsModule,
    BaseComponent,
    InstanceViewComponent,
    SoldiersSelectComponent,
    AvailableSoldiersComponent,
    SelectionSummaryComponent
  ],
  templateUrl: './manually-assign-container.component.html',
  styleUrl: './manually-assign-container.component.scss'
})
export class ManuallyAssignContainerComponent {

  selectedInstance?: MissionInstance;
  soldiersSelected: Array<number> = [];
  soldiers$!: Observable<Array<Soldier>>;
  availableSoldiers$!: Observable<Array<GetAvailableSoldiers>>;

  selectedAvailableSoldiers?: Array<Soldier>;

  constructor(public dialogRef: MatDialogRef<ManuallyAssignContainerComponent>,
    public dialog: MatDialog,
    private store: Store<AppState>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Mission>) {
      this.store.dispatch(soldierActions.getSoldiers());
      if(data.missionInstances?.length) {
        this.store.dispatch(missionActions.getAvailableSoldiers({
          missionInstanceId: data.missionInstances[0].id, 
          soldiersPool: this.soldiersSelected?.length ? this.soldiersSelected : undefined
        }));
      }
      if(data.missionInstances && (data.missionInstances?.length ?? 0) > 0) {
        this.selectedInstance = data.missionInstances[0];
      }
      this.soldiers$ = this.store.pipe(select(selectSoldiers));
      this.availableSoldiers$ = this.store.pipe(select(selectAvalableSoldiers));
    }

    

  onOk() {
    //this.dialogRef.close(this.mission);
  }

  
  onNoClick(): void {
    this.dialogRef.close();
  }
  
  onInstanceSelect(instance: MissionInstance) {
    this.selectedInstance = instance;
    this.store.dispatch(missionActions.getAvailableSoldiers({
      missionInstanceId: instance.id, 
      soldiersPool: this.soldiersSelected?.length ? this.soldiersSelected : undefined
    }));
  }

  onSoldiersSelected(soldiersSelected: Array<number>) {
    this.soldiersSelected = soldiersSelected;
    this.store.dispatch(missionActions.getAvailableSoldiers({
      missionInstanceId: this.selectedInstance?.id ?? 0, 
      soldiersPool: this.soldiersSelected?.length ? this.soldiersSelected : undefined
    }));
  }

  onAvailableSoldiersSelected(soldiers: Array<Soldier>) {
    this.selectedAvailableSoldiers = soldiers;
  }
}
