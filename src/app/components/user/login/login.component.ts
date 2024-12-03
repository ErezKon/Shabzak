import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import * as userActions from '../../../state-management/actions/user.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';
import { encryptSHA } from '../../../utils/sha256';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private store: Store<AppState>, userService: UserService, router: Router) {
    if(userService.getLoggeduser()) {
      router.navigateByUrl('personal-page');
    }
  }

  onLogin() {
    const encPass = encryptSHA(this.password);
    const encUser= encryptSHA(this.username);
    this.store.dispatch(userActions.login({username: encUser, password: encPass}));
  }
  
}
