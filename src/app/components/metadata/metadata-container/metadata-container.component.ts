import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BarChartComponent } from "../bar-chart/bar-chart.component";
import { GroupedBarChartComponent } from "../grouped-bar-chart/grouped-bar-chart.component";
import { AppState } from '../../../state-management/states/app.state';
import { select, Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { BarChartModel } from '../../../models/metadata/bar-chart.model';

import * as metadataActions from '../../../state-management/actions/metadata.actions';
import { selectAssignmentsBreakdownPerSoldier, selectAssignmentsPerSoldier, selectHoursPerSoldier } from '../../../state-management/selectors/metadata.selector';
import { CommonModule } from '@angular/common';
import { GroupedBarChartModel } from '../../../models/metadata/grouped-bar-chart.model';
import { SoldierMetadataType } from '../../../models/metadata/soldier-metadata-type.enum';

@Component({
  selector: 'app-metadata-container',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule, 
    MatSelectModule, 
    BarChartComponent, 
    GroupedBarChartComponent,
    BarChartComponent,
    GroupedBarChartComponent
  ],
  templateUrl: './metadata-container.component.html',
  styleUrl: './metadata-container.component.scss'
})
export class MetadataContainerComponent {
  selectedChart: string = 'assPerSoldier';
  selectedSoldierType: SoldierMetadataType = SoldierMetadataType.All;

  soldierTypeOptions = [
    {
      label: "כל החיילים והמפקדים",
      value: SoldierMetadataType.All
    }, {
      label: "חיילים ללא מפקדים",
      value: SoldierMetadataType.NonCommanders
    }, {
      label: "מפקדים וקצינים",
      value: SoldierMetadataType.CommandersOnly
    }, {
      label: "קצינים בלבד",
      value: SoldierMetadataType.OfficersOnly
    }
  ];

  from?: Date;
  to: Date = new Date();

  showLegend = true;

  assignmentsPerSoldier$: Observable<Array<BarChartModel>>;
  hoursPerSoldier$: Observable<Array<BarChartModel>>;
  assignmentsBreakdownPerSoldier$: Observable<Array<GroupedBarChartModel>>;

  constructor(private store: Store<AppState>) {
    store.dispatch(metadataActions.getHoursPerSoldiers({range: {from: this.from, to: this.to, soldierType: this.selectedSoldierType}}));
    store.dispatch(metadataActions.getAssignmentsBreakdownPerSoldiers({range: {from: this.from, to: this.to, soldierType: this.selectedSoldierType}}));
    store.dispatch(metadataActions.getAssignmentsPerSoldiers({range: {from: this.from, to: this.to, soldierType: this.selectedSoldierType}}));
    this.assignmentsPerSoldier$ = store.pipe(select(selectAssignmentsPerSoldier))
    .pipe(map(assignments => {
      return assignments.map(ass => {
        return {
          name: ass.soldier.name,
          value: ass.totalAssignments
        } as BarChartModel
      })
    }));
    
    this.hoursPerSoldier$ = store.pipe(select(selectHoursPerSoldier))
    .pipe(map(assignments => {
      return assignments.map(ass => {
        return {
          name: ass.soldier.name,
          value: ass.totalHours
        } as BarChartModel
      })
    }));

    this.assignmentsBreakdownPerSoldier$ = store.pipe(select(selectAssignmentsBreakdownPerSoldier))
    .pipe(map(assignments => {
      return assignments.map(ass => {
        return {
          name: ass.soldier.name,
          series: ass.breakdown.map(br => {
            return {
              name: br.mission.name,
              value: br.count
            } as BarChartModel
          })
        } as GroupedBarChartModel
      })
    }));
  }

  onSelectChange(event: any) {
    if(this.selectedChart === 'assPerSoldier') {
      this.store.dispatch(metadataActions.getAssignmentsPerSoldiers({range: {from: this.from, to: this.to, soldierType: this.selectedSoldierType}}));
    } else if(this.selectedChart === 'hourPerSoldier') {
      this.store.dispatch(metadataActions.getHoursPerSoldiers({range: {from: this.from, to: this.to, soldierType: this.selectedSoldierType}}));
    } else {
      this.store.dispatch(metadataActions.getAssignmentsBreakdownPerSoldiers({range: {from: this.from, to: this.to, soldierType: this.selectedSoldierType}}));
    }
  }
}
