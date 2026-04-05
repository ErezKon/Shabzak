import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';

import * as soldierActions from '../../../state-management/actions/soldiers.actions';

@Component({
  selector: 'app-request-vacation',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    ReactiveFormsModule
  ],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}],
  templateUrl: './request-vacation.component.html',
  styleUrl: './request-vacation.component.scss'
})
export class RequestVacationComponent {
  @Input() soldierId?: number;

  startDateForm = new FormControl<Date | null>(null, [Validators.required]);
  endDateForm = new FormControl<Date | null>(null, [Validators.required]);

  constructor(private store: Store<AppState>) {}

  onSendRequest() {
    if (this.startDateForm.valid && this.endDateForm.valid && this.soldierId) {
      this.store.dispatch(soldierActions.requestVacation({
        soldierId: this.soldierId,
        from: this.startDateForm.value!,
        to: this.endDateForm.value!
      }));
      this.startDateForm.reset();
      this.endDateForm.reset();
    }
  }
}
