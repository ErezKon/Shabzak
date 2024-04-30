import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Soldier } from '../../../models/soldier.model';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Position } from '../../../models/position.enum';
import { translatePosition } from '../../../utils/position.tranbslator';
import { BaseComponent } from '../../../utils/base-component/base-component.component';

@Component({
  selector: 'app-soldiers-add-edit',
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
    MatSelectModule,
    ReactiveFormsModule,
    BaseComponent
  ],
  templateUrl: './soldiers-add-edit.component.html',
  styleUrl: './soldiers-add-edit.component.scss'
})
export class SoldiersAddEditComponent extends BaseComponent{
  title: string;
  positions = new FormControl();

  positionOptions:Array<any>;
  
  constructor(public dialogRef: MatDialogRef<SoldiersAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Soldier>) {
      super();
      this.title = data?.id ? 'עריכת חייל' : 'הוספת חייל';
      this.positionOptions = Object.keys(Position).filter((v) => Number.isInteger((Number(v)))).map(p => {
        return {
          value: Position[+p],
          title: translatePosition(+p)
        }
      });
      if(data?.positions) {
        const positionValues = data.positions.map(p => p.toString());
        const initialValues = [];
        for (const pos of positionValues) {
          const filtered = this.positionOptions.filter(p => Position[+pos] === p.value);
          if(filtered?.length) {
            initialValues.push(filtered[0].value);
          }
        }
        this.positions.setValue(initialValues);
        this.addSub(this.positions.valueChanges.subscribe(val => {
          data.positions = val;
        }));
      }
      
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
}
