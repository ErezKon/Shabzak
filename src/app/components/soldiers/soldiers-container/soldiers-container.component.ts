import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';

import * as soldierActions from '../../../state-management/actions/soldiers.actions';
import { Soldier } from '../../../models/soldier.model';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { selectSoldiers } from '../../../state-management/selectors/soldiers.selector';
import { SoldiersComponent } from '../soldiers/soldiers.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { SoldiersAddEditComponent } from '../soldiers-add-edit/soldiers-add-edit.component';
import { SoldiersFilterComponent } from '../soldiers-filter/soldiers-filter.component';
import { SoldiersFilter } from '../soldiers-filter/soldiers-filter.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { UserService } from '../../../services/user.service';
import { log } from 'console';

@Component({
  selector: 'app-soldiers-container',
  standalone: true,
  imports: [CommonModule, SoldiersComponent, SoldiersFilterComponent, MatIconModule, MatButtonModule, BaseComponent],
  templateUrl: './soldiers-container.component.html',
  styleUrl: './soldiers-container.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SoldiersContainerComponent extends BaseComponent{

  soldiers$ = new BehaviorSubject<Array<Soldier>>([]);
  allSoldiers: Array<Soldier> = [];

  constructor(private store: Store<AppState>, public dialog: MatDialog, private userService: UserService) {
    super();
    this.store.dispatch(soldierActions.getSoldiers());
    this.addSub(this.store.pipe(select(selectSoldiers))
    .subscribe(soldiers => {
      this.soldiers$.next(soldiers);
      this.allSoldiers = soldiers;
    }));
  }

  onEditSoldier(soldier: Soldier) {
    const dialogRef = this.dialog.open(SoldiersAddEditComponent, {
      data: soldier,
      width: '80vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        const action = soldierActions.updateSoldier({soldier:result});
        this.store.dispatch(action);
      }
    });
  }

  onFilterSoldiers(filter: SoldiersFilter) {
      let filtered = [...this.allSoldiers];
      if(filter.text) {
        filtered = filtered.filter(s => s.name.indexOf(filter.text as string) !== -1 || s.personalNumber.indexOf(filter.text as string) !== -1 || s.phone.indexOf(filter.text as string) !== -1);
      }
      if(filter.platoon) {
        filtered = filtered.filter(s => s.platoon === filter.platoon);
      }
      if(filter.company) {
        filtered = filtered.filter(s => s.company === filter.company);
      }
      this.soldiers$.next(filtered);
  }

  onAddSoldier() {
    const dialogRef = this.dialog.open(SoldiersAddEditComponent, {
      data: {},
      width: '80vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.store.dispatch(soldierActions.addSoldier({soldier: {...result, vacations: []}}));
      }
    });
  }

  onDeleteSoldier(soldierId: number) {
    this.store.dispatch(soldierActions.deleteSoldier({soldierId: soldierId}));
  }

  createUser() {
    this.userService.login('asd','jjhsad7HSa')
    .subscribe(val => {
      console.log(val);
    });
  }
}
