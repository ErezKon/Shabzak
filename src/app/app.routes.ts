import { Routes } from '@angular/router';
import { SoldiersContainerComponent } from './components/soldiers/soldiers-container/soldiers-container.component';
import { MissionsContainerComponent } from './components/missions/missions-container/missions-container.component';

export const routes: Routes = [
    
    {
    path: 'soldiers',
    component: SoldiersContainerComponent,
    children: []
  },
  {
    path: 'missions',
    component: MissionsContainerComponent,
    children: []
  },
  {
    path: '', redirectTo: '/soldiers', pathMatch: 'full'
  },
  {
    path: '**', redirectTo: '/soldiers', pathMatch: 'full'
  }
];
