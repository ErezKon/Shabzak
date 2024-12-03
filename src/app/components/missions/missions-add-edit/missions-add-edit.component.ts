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
import { AddEditMissionModel } from './mission-add-edit-data.model';
import { MissionAddEditMode } from './mission-add-edit-mode.enum';
import { formatNumber } from '../../../utils/number.utils';
import { defaultStartEndTime } from '../missions-container/missions-container.component';

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
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatChipsModule,
    MatIconModule,
    ReactiveFormsModule,
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

  constructor(public dialogRef: MatDialogRef<MissionsAddEditComponent>,
    public dialog: MatDialog,
    public confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: AddEditMissionModel) {
      super();
      let date = new Date();
      date.setDate(date.getDate() - 1);
      this.startDateForm.setValue(date);
      this.endDateForm.setValue(date);

      this.positionOptions = getPositionsKeyValue();

      switch(data.mode){
        case MissionAddEditMode.Add:
          this.title = 'הוספת משימה';
          break;
        case MissionAddEditMode.Edit:
          this.title = 'עריכת משימה';
          break;
        case MissionAddEditMode.Clone:
          this.title = 'שכפול משימה';
          break;
      }

      if(data.mode === MissionAddEditMode.Add) {
        data.mission.isSpecial = false;
        data.mission.requiredInstances = true;
        this.nameForm = new FormControl<string>('', [Validators.required]);
        this.durationForm = new FormControl(1, [Validators.required, Validators.min(1)]);
        this.soldiersRequiredForm = new FormControl(0, [Validators.required, Validators.min(1)]);
        this.commandersRequiredForm = new FormControl(0, [Validators.required, Validators.min(0)]);
        this.startTimeForm = new FormControl(defaultStartEndTime, [Validators.required]);
        this.endTimeForm = new FormControl(defaultStartEndTime, [Validators.required]);
      } else {
        this.nameForm = new FormControl(data.mission.name, [Validators.required]);
        this.durationForm = new FormControl(data.mission.duration, [Validators.required, Validators.min(1)]);
        this.soldiersRequiredForm = new FormControl(data.mission.soldiersRequired, [Validators.required, Validators.min(1)]);
        this.commandersRequiredForm = new FormControl(data.mission.commandersRequired, [Validators.required, Validators.min(0)]);
        this.startTimeForm = new FormControl(data.mission.fromTime, [Validators.required]);
        this.endTimeForm = new FormControl(data.mission.toTime, [Validators.required]);

        for (const instance of data.mission?.missionInstances ?? []) {
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
        for (const pos of data.mission?.positions ?? []) {
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
        ...this.data.mission,
        missionInstances: (this.data.mission?.missionInstances ?? []).map(mi => { return {...mi}}),
        positions: this.data.mission.positions?.map(p => { return {...p}}) ?? []
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
          fromTime: `${(this.startDateForm?.value ?? new Date()).toLocaleDateString('en-GB')} ${this.startTimeForm.value ?? defaultStartEndTime}`,
          toTime: `${(this.endDateForm?.value ?? new Date()).toLocaleDateString('en-GB')} ${this.endTimeForm.value ?? defaultStartEndTime}`,
          isFilled: false,
          soldierMissions: []
        }
      ]
    }
    if(this.mission.isSpecial) {
      const startDateSpl = `${(this.specialTime ?? new Date()).toLocaleDateString('en-GB')}`.split('/').reverse();
      const startTimeSpl = this.mission.fromTime?.split(':') ?? ['00', '00'];
      const startDate = new Date(+startDateSpl[0], (+startDateSpl[1] - 1), +startDateSpl[2], +startTimeSpl[0], +startTimeSpl[1]);
      this.mission.missionInstances = [
        {
          id: 0,
          fromTime: `${startDate.toLocaleString('en-GB').replace(',', '')}`,
          toTime: `${this.mission.toTime}`,
          isFilled: false,
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
    const finalEndTime = this.endTimeForm.value?.split(':')?.map((t: string) => +t)[0] ?? 0;
    const finalEndTimeMinutes = this.endTimeForm.value?.split(':')?.map((t: string) => +t)[1] ?? 0;
    const finalInstanceEndTime = this.datesRange[this.datesRange.length - 1];
    finalInstanceEndTime.setHours(finalEndTime);
    finalInstanceEndTime.setMinutes(finalEndTimeMinutes);
    let index = 0;
    this.mission.missionInstances = [];
    let id = 0;
    for (const date of this.datesRange) {
      const key = date.toLocaleDateString('en-GB');
      const instances = new Array<AddMissionInstance>();
      let time = lastTime;
      const lastInstanceEndTimeHours = lastTime.split(':')[0];
      const lastInstanceEndTimeMinutes = lastTime.split(':')[1];
      const keyRearrange = key.split('/').reverse().join('-');
      const instanceEndTime = new Date(keyRearrange);
      instanceEndTime.setHours(lastInstanceEndTimeHours);
      instanceEndTime.setMinutes(lastInstanceEndTimeMinutes);
      if(instanceEndTime >= finalInstanceEndTime ) {
        break;
      }

      let keepCreating = true;
      while(keepCreating) {
        const spl = time.split(":").map((s: string) => +s);
        const endTime = spl[0] + this.mission.duration;
        if(index === this.datesRange.length - 1 && endTime >= finalEndTime) {
          const instance: AddMissionInstance = {
            id: ++id,
            date: key,
            from: `${formatNumber(spl[0], 2)}:${formatNumber(spl[1], 2)}`,
            to: `${formatNumber(finalEndTime,2)}:${formatNumber(spl[1], 2)}`
          }
          instances.push(instance);
          this.mission.missionInstances.push(this.convertMissionInstancetoBEModel(instance));
          break;
        }
        if(endTime < 24) {
          const instance: AddMissionInstance = {
            id: ++id,
            date: key,
            from: `${formatNumber(spl[0], 2)}:${formatNumber(spl[1], 2)}`,
            to: `${formatNumber(endTime,2)}:${formatNumber(spl[1], 2)}`
          }
          instances.push(instance);
          this.mission.missionInstances.push(this.convertMissionInstancetoBEModel(instance));
          time = `${formatNumber(endTime,2)}:${formatNumber(spl[1], 2)}`;
        } else {
          const instance: AddMissionInstance = {
            id: ++id,
            date: key,
            from: `${formatNumber(spl[0], 2)}:${formatNumber(spl[1], 2)}`,
            to: `${formatNumber(endTime % 24,2)}:${formatNumber(spl[1], 2)}`
          }
          instances.push(instance);
          this.mission.missionInstances.push(this.convertMissionInstancetoBEModel(instance));
          lastTime = `${formatNumber(endTime % 24,2)}:${formatNumber(spl[1], 2)}`;
          keepCreating = false;
        }
      } 
      this.datesInstances.set(key, instances);
      index++;
    }
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
    return `${formatNumber(+spl[0], 2)}:${formatNumber(+spl[1], 2)}`;
  }

  private convertMissionInstancetoBEModel(instance: AddMissionInstance): MissionInstance {
    const ret: MissionInstance = {
      id: instance.id,
      fromTime: `${instance.date} ${instance.from}`,
      toTime: `${instance.date} ${instance.to}`,
      isFilled: false,
      soldierMissions: instance.soldiers ?? []
    };

    const fromHour = +(instance.from.split(':')[0]);
    const toHour = +(instance.to.split(':')[0]);

    let date = new Date(instance.date.split('/').reverse().join('/'));
    if(toHour <= fromHour) {
      date = new Date(date.setDate(date.getDate() + 1));
      ret.toTime = `${date.toLocaleDateString('en-GB')} ${instance.to}`
    }
    return ret;
  }
}
