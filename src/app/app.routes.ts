import { Routes } from '@angular/router';
import { SoldiersContainerComponent } from './components/soldiers/soldiers-container/soldiers-container.component';
import { MissionsContainerComponent } from './components/missions/missions-container/missions-container.component';
import { MetadataContainerComponent } from './components/metadata/metadata-container/metadata-container.component';
import { AssignmentsContainerComponent } from './components/assignments/assignments-container/assignments-container.component';
import { LoginComponent } from './components/user/login/login.component';
import { loggedInGuard } from './guards/logged-in.guard';
import { PersonalPageComponent } from './components/user/personal-page/personal-page.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    children: []
  },
  {
    path: 'soldiers',
    component: SoldiersContainerComponent,
    children: [],
    canActivate: [adminGuard()]
  },
  {
    path: 'missions',
    component: MissionsContainerComponent,
    children: [],
    canActivate: [adminGuard()]
  },
  {
    path: 'assignments',
    component: AssignmentsContainerComponent,
    children: [],
    canActivate: [loggedInGuard()]
  },
  {
    path: 'justice',
    component: MetadataContainerComponent,
    children: [],
    canActivate: [adminGuard()]
  },
  {
    path: 'personal-page',
    component: PersonalPageComponent,
    children: [],
    canActivate: [loggedInGuard()]
  },
  {
    path: '', redirectTo: '/login', pathMatch: 'full'
  },
  {
    path: '**', redirectTo: '/login', pathMatch: 'full'
  }
];
