import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { AssignmentMode, assignmentModeTextual } from '../models/show-assignment-mode.model';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { BehaviorSubject, combineLatest, forkJoin } from 'rxjs';
import { AssignmentsFilter } from '../models/assignments-filter.model';

@Component({
  selector: 'app-assignments-filter',
  standalone: true,
  imports: 
  [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    BaseComponent
  ],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}],
  templateUrl: './assignments-filter.component.html',
  styleUrl: './assignments-filter.component.scss'
})
export class AssignmentsFilterComponent extends BaseComponent {
  @Input() filter$!: BehaviorSubject<AssignmentsFilter>;

  @Output() startDateSelected = new EventEmitter<Date>();
  @Output() endDateSelected = new EventEmitter<Date>();
  @Output() modeSelected = new EventEmitter<AssignmentMode>();

  startDateForm = new FormControl(new Date());
  endDateForm = new FormControl(new Date());
  showAssignmentMode = new FormControl(AssignmentMode.ByDay);

  showAssignmentModeOptions = [
    {
      value: AssignmentMode.ByDay,
      text: assignmentModeTextual.get(AssignmentMode.ByDay)
    }, {
      value: AssignmentMode.ByMission,
      text: assignmentModeTextual.get(AssignmentMode.ByMission)
    }, {
      value: AssignmentMode.BySoldier,
      text: assignmentModeTextual.get(AssignmentMode.BySoldier)
    }
  ];

  private defaultFromDate: Date;
  private defaultToDate = new Date();

  constructor() {
    super();
    let date = new Date();
    date.setDate(date.getDate() - 1);
    this.defaultFromDate = date;
    this.startDateForm.setValue(date);
    this.endDateForm.setValue(date);

    // const obs$ = combineLatest({
    //   from: this.startDateForm.valueChanges,
    //   to: this.endDateForm.valueChanges,
    //   showMode: this.showAssignmentMode.valueChanges
    // });

    this.addSub(this.startDateForm.valueChanges.subscribe(val => {
      if(val) {
        this.startDateSelected.emit(val);
      }
    }));
    this.addSub(this.endDateForm.valueChanges.subscribe(val => {
      if(val) {
        this.endDateSelected.emit(val);
      }
    }));
    this.addSub(this.showAssignmentMode.valueChanges.subscribe(val => {
      if(val) {
        this.modeSelected.emit(val);
      }
    }));

    const obs$ = forkJoin([this.startDateForm.valueChanges, this.endDateForm.valueChanges, this.showAssignmentMode.valueChanges]);
    // this.addSub(obs$ .subscribe(val => {
    //   if(val) {
    //     this.filter$.next({
    //       from: val[0] ?? this.defaultFromDate,
    //       to: val[1] ?? this.defaultToDate,
    //       showMode: val[2] ?? AssignmentMode.ByDay
    //   });
    //   }
    // }));
  }

}
