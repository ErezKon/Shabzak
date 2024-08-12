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
import { ConfirmationModule } from '../../../utils/confirmation/module/confirmation/confirmation.module';
import { ConfirmationService } from '../../../utils/confirmation/service/confirmation.service';
import { ConfirmationDialogResult } from '../../../utils/confirmation/models/dialog-result.model';

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
    BaseComponent,
    ConfirmationModule
  ],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}, ConfirmationService],
  templateUrl: './missions-add-edit.component.html',
  styleUrl: './missions-add-edit.component.scss'
})
export class MissionsAddEditComponent extends BaseComponent {
  
  title: string;
  startDate?: Date;
  endDate?: Date;

  startTimeForm!: FormControl;
  endTimeForm!: FormControl;


  startDateForm = new FormControl(new Date());
  endDateForm = new FormControl(new Date());
  positionForms = new Array<FormControl>();
  positionCountForms = new Array<FormControl<number | null>>();

  nameForm!: FormControl;
  durationForm!: FormControl;
  soldiersRequiredForm!: FormControl;
  commandersRequiredForm!: FormControl;
  


  datesRange: Array<Date> = [];
  datesInstances = new Map<string, Array<AddMissionInstance>>();

  specialTime?: Date;

  mission!: Partial<Mission>;

  positionOptions: Array<KeyValue<string, string>>;

  private readonly defaultStartEndTime = '14:00';

  constructor(public dialogRef: MatDialogRef<MissionsAddEditComponent>,
    public dialog: MatDialog,
    public confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Mission>) {
      super();
      let date = new Date();
      date.setDate(date.getDate() - 1);
      this.startDateForm.setValue(date);
      this.endDateForm.setValue(date);

      this.positionOptions = getPositionsKeyValue();

      this.title = data?.id ? 'עריכת משימה' : 'הוספת משימה';
      if(!data?.id) {
        data.isSpecial = false;
        data.requiredInstances = true;
        this.nameForm = new FormControl<string>('', [Validators.required]);
        this.durationForm = new FormControl('', [Validators.required, Validators.min(1)]);
        this.soldiersRequiredForm = new FormControl('', [Validators.required, Validators.min(1)]);
        this.commandersRequiredForm = new FormControl('', [Validators.required, Validators.min(1)]);
        this.startTimeForm = new FormControl(this.defaultStartEndTime, [Validators.required]);
        this.endTimeForm = new FormControl(this.defaultStartEndTime, [Validators.required]);
      } else {
        this.nameForm = new FormControl(data.name, [Validators.required]);
        this.durationForm = new FormControl(data.duration, [Validators.required, Validators.min(1)]);
        this.soldiersRequiredForm = new FormControl(data.soldiersRequired, [Validators.required, Validators.min(1)]);
        this.commandersRequiredForm = new FormControl(data.commandersRequired, [Validators.required, Validators.min(1)]);
        this.startTimeForm = new FormControl(data.fromTime, [Validators.required]);
        this.endTimeForm = new FormControl(data.toTime, [Validators.required]);

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
          this.addPosition({...pos});
        }
      }
      this.addSub(this.startDateForm.valueChanges.subscribe(startDate => {
        if(startDate) {
          this.startDate = startDate;
          if(this.endDate) {
            this.datesRange = getDates(this.startDate, this.endDate);
            this.autoCreateInstances();
          }
        }
      }));
      
      this.addSub(this.endDateForm.valueChanges.subscribe(endDate => {
        if(endDate) {
          this.endDate = endDate;
          if(this.startDate) {
            this.datesRange = getDates(this.startDate, this.endDate);
            this.autoCreateInstances();
          }
        }
      }));

      
      this.addSub(this.nameForm.valueChanges.subscribe(val => {
        this.mission.name = val;
      }));
      this.addSub(this.durationForm.valueChanges.subscribe(val => {
        this.mission.duration = val;
      }));
      this.addSub(this.soldiersRequiredForm.valueChanges.subscribe(val => {
        this.mission.soldiersRequired = val;
      }));
      this.addSub(this.commandersRequiredForm.valueChanges.subscribe(val => {
        this.mission.commandersRequired = val;
      }));
      this.addSub(this.startTimeForm.valueChanges.subscribe(val => {
        if(val) {
          this.mission.fromTime = val;
        }
      }));
      this.addSub(this.endTimeForm.valueChanges.subscribe(val => {
        if(val) {
          this.mission.toTime = val;
        }
      }));

      this.mission = {
        ...this.data,
        missionInstances: (this.data?.missionInstances ?? []).map(mi => { return {...mi}}),
        positions: this.data.positions?.map(p => { return {...p}}) ?? []
      }
  }

  private addPosition(pos: MissionPosition) {
    const posForm = new FormControl(Position[pos.position]);
    this.addSub(posForm.valueChanges.subscribe(val => {
      pos.position = Position[val as keyof typeof Position]
    }));
    const initialCount = pos.count > 0 ? pos.count : 1;
    const posCountForm = new FormControl<number>(initialCount, [Validators.required, Validators.min(1)]);
    this.addSub(posCountForm.valueChanges.subscribe((val: number | null) => {
      pos.count = (val ?? 0) > 0 ? (val ?? 1) : 1
    }));
    if(!pos.id) {
      pos.count = 1;
    }
    this.positionForms.push(posForm);
    this.positionCountForms.push(posCountForm);
  }

  onOk() {
    const totalSoldiersRequired = (this.mission.commandersRequired ?? 0) + (this.mission.soldiersRequired ?? 0);
    const totalPositionsAssigned = this.mission.positions
      ?.map(p => p.count)
      ?.reduce((sum, current) => sum + current, 0) ?? 0;

    if(totalPositionsAssigned !== totalSoldiersRequired) {
      this.addSub(this.confirmationService.showConfirmation(
        {
          title: 'הוספת משימה',
          confirmationMessage: 'שים לב, מספר התפקידים שהוקצה לא תואם למספר התפקידים שהוגדר.\nהאם ברצונך להמשיך?',
          yesButtonText: 'המשך',
          noButtonText: 'חזור'
        }
      ).subscribe(res => {
        if(res === ConfirmationDialogResult.Accept) {
          this.acceptAndCloseDialog();
        }
      }));
    } else {
      this.acceptAndCloseDialog();
    }
  }

  private acceptAndCloseDialog() {
    if(!this.mission.requiredInstances) {
      this.mission.duration = 0;
      this.mission.missionInstances = [
        {
          id: 0,
          fromTime: `${(this.startDateForm?.value ?? new Date()).toLocaleDateString('en-GB')} ${this.startTimeForm.value ?? this.defaultStartEndTime}`,
          toTime: `${(this.endDateForm?.value ?? new Date()).toLocaleDateString('en-GB')} ${this.endTimeForm.value ?? this.defaultStartEndTime}`,
          soldierMissions: []
        }
      ]
    }
    if(!this.mission.fromTime) {
      this.mission.fromTime = this.startTimeForm.value;
    }
    
    if(!this.mission.toTime) {
      this.mission.toTime = this.endTimeForm.value;
    }

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
      return this.datesInstances.get(str) ?? new Array<AddMissionInstance>();
    }
    return new Array<AddMissionInstance>();
  }

  autoCreateInstances() {
    if(!this.mission?.duration || !this.mission.requiredInstances) {
      return;
    }
    let lastTime = this.startTimeForm.value ?? '';
    let finalEndTime = this.endTimeForm.value?.split(':')?.map((t: string) => +t)[0] ?? 0;
    let index = 0;
    this.mission.missionInstances = [];
    let id = 0;
    for (const date of this.datesRange) {
      const key = date.toLocaleDateString('en-GB');
      const instances = new Array<AddMissionInstance>();
      let time = lastTime;
      let keepCreating = true;
      while(keepCreating) {
        const spl = time.split(":").map((s: string) => +s);
        const endTime = spl[0] + this.mission.duration;
        if(index === this.datesRange.length - 1 && endTime >= finalEndTime) {
          const instance: AddMissionInstance = {
            id: ++id,
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
            id: ++id,
            date: key,
            from: `${this.formatNumber(spl[0], 2)}:${this.formatNumber(spl[1], 2)}`,
            to: `${this.formatNumber(endTime,2)}:${this.formatNumber(spl[1], 2)}`
          }
          instances.push(instance);
          this.mission.missionInstances.push(this.convertMissionInstancetoBEModel(instance));
          time = `${this.formatNumber(endTime,2)}:${this.formatNumber(spl[1], 2)}`;
        } else {
          const instance: AddMissionInstance = {
            id: ++id,
            date: key,
            from: `${this.formatNumber(spl[0], 2)}:${this.formatNumber(spl[1], 2)}`,
            to: `${this.formatNumber(endTime % 24,2)}:${this.formatNumber(spl[1], 2)}`
          }
          instances.push(instance);
          this.mission.missionInstances.push(this.convertMissionInstancetoBEModel(instance));
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
        let foundInstance = false;
        for (const date of this.datesRange) {
          const instances = this.getInstances(date);
          for (const instance of instances) {
            if(instance.id === result.id) {
              instance.from = result.from;
              instance.to = result.to;
              foundInstance = true;
              break;
            }
          }
          if(foundInstance) {
            break;
          }
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

  isValid(): boolean {
    const ret = this.nameForm.valid &&
           ((this.mission.requiredInstances && this.durationForm.valid) || !this.mission.requiredInstances) &&
           this.soldiersRequiredForm.valid &&
           this.commandersRequiredForm.valid &&
           this.startTimeForm.valid &&
           this.endDateForm.valid &&
           (this.mission?.positions?.length ?? 0) > 0 &&
           (this.positionCountForms?.filter(f => !f.valid)?.length ?? 0) === 0
    return ret;
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
