import { Component, Inject } from '@angular/core';
import { MissionInstance } from '../../../models/mission-instance.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddMissionInstance } from '../../../models/add-mission-instance.model';

@Component({
  selector: 'app-mission-instance-add-edit',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule
  ],
  templateUrl: './mission-instance-add-edit.component.html',
  styleUrl: './mission-instance-add-edit.component.scss'
})
export class MissionInstanceAddEditComponent {

  title: string;

  constructor(public dialogRef: MatDialogRef<MissionInstanceAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<AddMissionInstance>) {
      this.title = data?.from ? 'עריכת מופע' : 'הוספת מופע';

    }
  onNoClick() {
    this.dialogRef.close();
  }

  onOk() {
    this.dialogRef.close(this.data);
  }
}
