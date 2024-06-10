import { Component, Inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { getPositionsKeyValue } from '../../../utils/position.translator';
import { KeyValue } from '@angular/common';
import { Position } from '../../../models/position.enum';
import { MissionPosition } from '../../../models/mission-position.model';

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
    MatButtonModule,
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

  startTimeForm = new FormControl('14:00', [Validators.required]);
  endTimeForm = new FormControl('14:00', [Validators.required]);


  startDateForm = new FormControl(new Date());
  endDateForm = new FormControl(new Date());
  positionForms = new Array<FormControl>();

  datesRange: Array<Date> = [];
  datesInstances = new Map<string, Array<AddMissionInstance>>();

  specialTime?: Date;

  mission!: Partial<Mission>;

  positionOptions: Array<KeyValue<string, string>>;

  constructor(public dialogRef: MatDialogRef<MissionsAddEditComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Mission>) {
      super();
      let date = new Date();
      date.setDate(date.getDate() - 1);
      this.startDateForm.setValue(date);
      this.endDateForm.setValue(date);

      this.positionOptions = getPositionsKeyValue();

      this.addSub(this.startTimeForm.valueChanges.subscribe(val => {
        if(val) {
          this.mission.fromTime = val;
        }
      }));
      this.addSub(this.endTimeForm.valueChanges.subscribe(val => {
        if(val) {
          this.mission.toTIme = val;
        }
      }));

      this.title = data?.id ? 'עריכת משימה' : 'הוספת משימה';
      if(!data?.id) {
        data.isSpecial = false;
        data.fromTime = this.startTimeForm.value ?? '';
        data.toTIme = this.endTimeForm.value ?? '';
      } else {
        for (const instance of data?.missionInstances ?? []) {
          const inst: AddMissionInstance = {
            id: instance.id,
            date: instance.fromTime.split(' ')[0],
            from: this.getTimeString(instance.fromTime),
            to: this.getTimeString(instance.toTime),
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
        for (const pos of data?.positions ?? []) {
          this.addPosition(pos);
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
        missionInstances: (this.data?.missionInstances ?? []).map(mi => { return {...mi}}),
        positions: [...(data.positions ?? [])]
      }
  }

  private addPosition(pos: MissionPosition) {
    const posForm = new FormControl(Position[pos.position]);
      this.addSub(posForm.valueChanges.subscribe(val => {
        pos.position = Position[val as keyof typeof Position]
      }))
    this.positionForms.push(posForm);
  }

  onOk() {
    if(this.startDate && this.endDate) {
      const dates = getDates(this.startDate, this.endDate);
      const str = dates[0]?.toLocaleDateString('en-GB');
      //console.log(str);

    }
    console.log(JSON.stringify(this.mission));
    this.dialogRef.close({
      ...this.mission,
      soldiers: []
    });
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
    let lastTime = this.startTimeForm.value ?? '';
    let finalEndTime = this.endTimeForm.value?.split(':')?.map(t => +t)[0] ?? 0;
    let index = 0;
    this.mission.missionInstances = [];
    for (const date of this.datesRange) {
      const key = date.toLocaleDateString('en-GB');
      const instances = new Array<AddMissionInstance>();
      let time = lastTime;
      let keepCreating = true;
      let id = 0;
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
          this.mission.missionInstances.push(this.convertMissionInstancetoBEModel(instance));
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
          this.mission.missionInstances.push(this.convertMissionInstancetoBEModel(instance));
          time = `${this.formatNumber(endTime,2)}:${this.formatNumber(spl[1], 2)}`;
        } else {
          const instance: AddMissionInstance = {
            id: id,
            date: key,
            from: `${this.formatNumber(spl[0], 2)}:${this.formatNumber(spl[1], 2)}`,
            to: `${this.formatNumber(endTime % 24,2)}:${this.formatNumber(spl[1], 2)}`
          }
          instances.push(instance);
          this.mission.missionInstances.push(this.convertMissionInstancetoBEModel(instance));
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
      height: '35vh'
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
      height: '30vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.datesInstances.get(result.date)?.push(result);
      }
    });
  }

  onAddPosition() {
    if(!this.mission?.positions) {
      this.mission.positions = [];
    }
    const position: MissionPosition = {
      id: 0,
      position: 0,
      count: 0
    }
    this.mission.positions.push(position);
    this.addPosition(position);
  }

  private getTimeString(date: string): string {
    const spl = date.split(' ')[1].split(':');
    return `${this.formatNumber(+spl[0], 2)}:${this.formatNumber(+spl[1], 2)}`;
  }

  private convertMissionInstancetoBEModel(instance: AddMissionInstance): MissionInstance {
    const ret: MissionInstance = {
      id: instance.id,
      fromTime: `${instance.date} ${instance.from}`,
      toTime: `${instance.date} ${instance.to}`,
      soldierMissions: instance.soldiers ?? []
    };

    const fromHour = +(instance.from.split(':')[0]);
    const toHour = +(instance.to.split(':')[0]);

    let date = new Date(instance.date.split('/').reverse().join('/'));
    if(toHour < fromHour) {
      date = new Date(date.setDate(date.getDate() + 1));
      ret.toTime = `${date.toLocaleDateString('en-GB')} ${instance.to}`
    }
    return ret;
  }
}
