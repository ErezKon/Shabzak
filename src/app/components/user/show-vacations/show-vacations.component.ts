import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../state-management/states/app.state';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { Vacation } from '../../../models/vacation.model';
import { VacationRequestStatus } from '../../../models/vacation-request-stats.enum';
import { selectVacations } from '../../../state-management/selectors/soldiers.selector';
import { CommonModule } from '@angular/common';

import * as soldierActions from '../../../state-management/actions/soldiers.actions';

@Component({
  selector: 'app-show-vacations',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    BaseComponent
  ],
  templateUrl: './show-vacations.component.html',
  styleUrl: './show-vacations.component.scss'
})
export class ShowVacationsComponent extends BaseComponent implements OnInit {
  @Input() soldierId?: number;

  displayedColumns: string[] = ['from', 'to', 'approved'];
  dataSource = new MatTableDataSource<Vacation>();

  constructor(private store: Store<AppState>) {
    super();
  }

  ngOnInit(): void {
    if (this.soldierId) {
      this.store.dispatch(soldierActions.getVacations({ soldierId: this.soldierId }));
    }
    this.addSub(this.store.pipe(select(selectVacations)).subscribe(vacations => {
      this.dataSource = new MatTableDataSource(vacations);
    }));
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  translateStatus(status: VacationRequestStatus): string {
    switch (status) {
      case VacationRequestStatus.Pending: return 'ממתין';
      case VacationRequestStatus.Approved: return 'מאושר';
      case VacationRequestStatus.Denied: return 'נדחה';
      default: return '';
    }
  }
}
