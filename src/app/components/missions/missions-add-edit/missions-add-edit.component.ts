import { Component, Inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { Mission } from '../../../models/mission.model';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { getDates } from '../../../utils/date.util';
import { MissionInstance } from '../../../models/mission-instance.model';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MissionInstanceAddEditComponent } from '../mission-instance-add-edit/mission-instance-add-edit.component';
import { AddMissionInstance } from '../../../models/add-mission-instance.model';

@Component({
  selector: 'app-missions-add-edit',
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
    MatDatepickerModule,
    MatRadioModule,
    MatChipsModule,
    MatIconModule,
    ReactiveFormsModule,
    BaseComponent
  ],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}],
  templateUrl: './missions-add-edit.component.html',
  styleUrl: './missions-add-edit.component.scss'
})
export class MissionsAddEditComponent extends BaseComponent {
  
  title: string;
  regularStartTime = '14:00';
  regularEndTime = '14:00';
  startDate?: Date;
  endDate?: Date;


  startDateForm = new FormControl(new Date());
  endDateForm = new FormControl(new Date());

  datesRange: Array<Date> = [];
  datesInstances = new Map<string, Array<AddMissionInstance>>();

  specialTime?: Date;

  mission!: Partial<Mission>;

  constructor(public dialogRef: MatDialogRef<MissionsAddEditComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Mission>) {
      super();
      this.title = data?.id ? 'עריכת משימה' : 'הוספת משימה';
      if(!data?.id) {
        data.isSpecial = false;
      } else {
        for (const instance of data?.missionInstances ?? []) {
          const inst: AddMissionInstance = {
            id: instance.id,
            date: instance.fromTime.split(' ')[0],
            from: this.getTimeString(new Date(instance.fromTime)),
            to: this.getTimeString(new Date(instance.toTime)),
            soldiers: instance.soldierMissions ?? []
          }
          const key = inst.date;
          if(this.datesInstances.has(key)) {
            const arr = this.datesInstances.get(key) ?? [];
            this.datesInstances.set(key, [...arr, inst])
          } else {
            this.datesRange.push(new Date(inst.date.split('/').reverse().join('/')));
            this.datesInstances.set(key, [inst]);
          }
        }
      }
      this.startDateForm.valueChanges.subscribe(startDate => {
        if(startDate) {
          this.startDate = startDate;
          if(this.endDate) {
            this.datesRange = getDates(this.startDate, this.endDate);
            this.autoCreateInstances();
          }
        }
      });
      
      this.endDateForm.valueChanges.subscribe(endDate => {
        if(endDate) {
          this.endDate = endDate;
          if(this.startDate) {
            this.datesRange = getDates(this.startDate, this.endDate);
            this.autoCreateInstances();

          }
        }
      });

      this.mission = {
        ...this.data,
        missionInstances: (this.data?.missionInstances ?? []).map(mi => { return {...mi}})
      }
  }

  onOk() {
    if(this.startDate && this.endDate) {
      const dates = getDates(this.startDate, this.endDate);
      const str = dates[0]?.toLocaleDateString('en-GB');
      //console.log(str);

    }
    console.log(JSON.stringify(this.mission));
    this.dialogRef.close(this.mission);
  }

  
  onNoClick(): void {
    this.dialogRef.close();
  }

  getInstances(date: Date): Array<AddMissionInstance> {
    const str = date.toLocaleDateString('en-GB');
    if(this.datesInstances.has(str)) {
      //console.log(this.datesInstances.get(str));
      return this.datesInstances.get(str) ?? new Array<AddMissionInstance>();
    }
    return new Array<AddMissionInstance>();
  }

  autoCreateInstances() {
    if(!this.mission?.duration) {
      return;
    }
    let lastTime = this.regularStartTime;
    let finalEndTime = this.regularEndTime.split(':').map(t => +t)[0];
    let index = 0;
    for (const date of this.datesRange) {
      const key = date.toLocaleDateString('en-GB');
      const instances = new Array<AddMissionInstance>();
      let time = lastTime;
      let keepCreating = true;
      let id = 1;
      while(keepCreating) {
        const spl = time.split(":").map(s => +s);
        const endTime = spl[0] + this.mission.duration;
        if(index === this.datesRange.length - 1 && endTime >= finalEndTime) {
          const instance: AddMissionInstance = {
            id: id,
            date: key,
            from: `${this.formatNumber(spl[0], 2)}:${this.formatNumber(spl[1], 2)}`,
            to: `${this.formatNumber(finalEndTime,2)}:${this.formatNumber(spl[1], 2)}`
          }
          instances.push(instance);
          break;
        }
        if(endTime < 24) {
          const instance: AddMissionInstance = {
            id: id,
            date: key,
            from: `${this.formatNumber(spl[0], 2)}:${this.formatNumber(spl[1], 2)}`,
            to: `${this.formatNumber(endTime,2)}:${this.formatNumber(spl[1], 2)}`
          }
          instances.push(instance);
          time = `${this.formatNumber(endTime,2)}:${this.formatNumber(spl[1], 2)}`;
        } else {
          const instance: AddMissionInstance = {
            id: id,
            date: key,
            from: `${this.formatNumber(spl[0], 2)}:${this.formatNumber(spl[1], 2)}`,
            to: `${this.formatNumber(endTime % 24,2)}:${this.formatNumber(spl[1], 2)}`
          }
          instances.push(instance);
          id++;
          lastTime = `${this.formatNumber(endTime % 24,2)}:${this.formatNumber(spl[1], 2)}`;
          keepCreating = false;
        }
      } 
      this.datesInstances.set(key, instances);
      index++;
    }
  }

  formatNumber(num: number, digits: number): string {
    return num.toLocaleString('en-US', {
      minimumIntegerDigits: digits,
      useGrouping: false
    })
  }

  onRemovedInstance(date: Date, instance: AddMissionInstance) {
    const key = date.toLocaleDateString('en-GB');
    const instances = this.datesInstances.get(key)
      ?.filter(i => i.from !== instance.from && i.to !== instance.to) ?? [];
    this.datesInstances.set(key, instances);
  }

  onEdtMissionInstance(instance: AddMissionInstance) {
    const dialogRef = this.dialog.open(MissionInstanceAddEditComponent, {
      data: instance,
      width: '30vw',
      height: '45vh'
    });

    dialogRef.afterClosed().subscribe((result: AddMissionInstance) => {
      if(result) {
        if(this.mission.missionInstances) {
          const newInstances = new Array<MissionInstance>();
          for (let i = 0; i < this.mission.missionInstances.length; i++) {
            let mi = this.mission.missionInstances[i];
            if(mi.id === result.id) {
              mi = {
                ...mi,
                fromTime: `${result.date} ${result.from}`,
                toTime: `${result.date} ${result.to}`
              };
              newInstances.push(mi);
            } else {
              newInstances.push(mi);
            }
          }
          this.mission.missionInstances = newInstances;
        }
      }
    });
  }

  onAddMissionInstance(date: Date) {
    const dialogRef = this.dialog.open(MissionInstanceAddEditComponent, {
      data: {
        date: date.toLocaleDateString('en-GB')
      },
      width: '30vw',
      height: '45vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.datesInstances.get(result.date)?.push(result);
      }
    });
  }

  private getTimeString(date: Date): string {
    return `${this.formatNumber(date.getHours(), 2)}:${this.formatNumber(date.getMinutes(), 2)}`;
  }
}
