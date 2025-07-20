import { Component } from '@angular/core';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ResetPasswordComponent } from "../reset-password/reset-password.component";
import { RequestVacationComponent } from "../request-vacation/request-vacation.component";
import { ShowVacationsComponent } from "../show-vacations/show-vacations.component";
import { SummaryComponent } from "../summary/summary.component";
import { encryptSHA } from '../../../utils/sha256';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';


import * as userActions from '../../../state-management/actions/user.actions';
import * as soldierActions from '../../../state-management/actions/soldiers.actions';
import { SoldierSummary } from '../../../models/soldier-summary.model';
import { Observable } from 'rxjs';
import { selectSummary } from '../../../state-management/selectors/soldiers.selector';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    ResetPasswordComponent,
    RequestVacationComponent,
    ShowVacationsComponent,
    SummaryComponent
],
  templateUrl: './personal-page.component.html',
  styleUrl: './personal-page.component.scss'
})
export class PersonalPageComponent {
  user?: User;
  selectedAction: 'summary' | 'details' | 'reset-password' | 'request-vacation' | 'show-vacations' = 'summary';
  summary$: Observable<SoldierSummary>;

  constructor(userService: UserService, private store: Store<AppState>) {
    this.user = userService.getLoggeduser();
    store.dispatch(soldierActions.getSummary({soldierId: this.user?.soldierId ?? 0}));
    this.summary$ = store.pipe(select(selectSummary));
  }

  onSummaryState() {
    this.selectedAction = 'summary';
  }

  onShowDetailsState() {
    this.selectedAction = 'details';
  }

  onResetPasswordState() {
    this.selectedAction = 'reset-password';
  }

  onVacationRequestState() {
    this.selectedAction = 'request-vacation';
  }

  onShowVacationsState() {
    this.selectedAction = 'show-vacations';
  }

  onResetPassword(data: {username: string, password: string}) {
    const username = encryptSHA(data.username);
    const password = encryptSHA(data.password);
    this.store.dispatch(userActions.resetPassword({
      username,
      password
    }));
  }
}
