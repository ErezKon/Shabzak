import { Component } from '@angular/core';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-personal-page',
  standalone: true,
  imports: [],
  templateUrl: './personal-page.component.html',
  styleUrl: './personal-page.component.scss'
})
export class PersonalPageComponent {
  user?: User;

  constructor(userService: UserService) {
    this.user = userService.getLoggeduser();
  }
}
