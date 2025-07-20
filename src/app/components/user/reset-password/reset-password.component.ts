import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';
import { selectUser } from '../../../state-management/selectors/user.selector';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { CustomErrorStateMatcher } from '../../../utils/custom-state-matcher';


export const matchValidator = (otherControl: FormControl): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    otherControl.updateValueAndValidity();
    if(!control.value || !otherControl.value) {
      return null;
    }
    return control.value === otherControl.value ? null : { mismatch: true };
  };
};
  

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    MatInputModule,
    FormsModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent extends BaseComponent {
  @Output() resetPassword = new EventEmitter<{username: string, password: string}>();
  username?: string;
  password?: string;
  repassword?: string;

  passwordControl = new FormControl('', [Validators.required]);
  repasswordControl = new FormControl('', [Validators.required]);

  matcher = new CustomErrorStateMatcher();

  constructor(private store: Store<AppState>) {
    super();
    //this.passwordControl = new FormControl('', [Validators.required, matchValidator(this.repasswordControl)]);
    //this.repasswordControl = new FormControl('', [Validators.required, matchValidator(this.passwordControl)]);
    this.addSub(this.store.pipe(select(selectUser))
    .subscribe(user => {
      if(user?.name) {
        this.username = user.name;
      }
    }));
    this.addSub(this.passwordControl.valueChanges
    .subscribe(val => {
      if(val && this.repasswordControl.value) {
        if(val !== this.repasswordControl.value) {
          this.passwordControl.setErrors({'mismatch': true});
          this.repasswordControl.setErrors({'mismatch': true});
        } else {
          this.passwordControl.setErrors({'mismatch': null});
          this.repasswordControl.setErrors({'mismatch': null});
          this.passwordControl.updateValueAndValidity({onlySelf: true, emitEvent: false});
          this.repasswordControl.updateValueAndValidity({onlySelf: true, emitEvent: false});
        }
      }
    }));
    this.addSub(this.repasswordControl.valueChanges
    .subscribe(val => {
      if(val && this.passwordControl.value) {
        if(val !== this.passwordControl.value) {
          this.passwordControl.setErrors({'mismatch': true});
          this.repasswordControl.setErrors({'mismatch': true});
        } else {
          this.passwordControl.setErrors({'mismatch': null});
          this.repasswordControl.setErrors({'mismatch': null});
          this.passwordControl.updateValueAndValidity({onlySelf: true, emitEvent: false});
          this.repasswordControl.updateValueAndValidity({onlySelf: true, emitEvent: false});
        }
      }
    }));
  }

  onReset() {
    if(this.passwordControl.valid && this.repasswordControl.valid) {
      this.resetPassword.emit(
          {
            username: this.username ?? '',
            password: this.password ?? ''
          }
        );
    }
  }
}
