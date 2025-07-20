import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SoldierSummary } from '../../../models/soldier-summary.model';
import { BarChartComponent } from '../../metadata/bar-chart/bar-chart.component';
import { BarChartModel } from '../../../models/metadata/bar-chart.model';
import { PieGridComponent } from "../../metadata/pie-grid/pie-grid.component";

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [BarChartComponent, PieGridComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnChanges{
  @Input() summary!: SoldierSummary | null;
  barChartData!: Array<BarChartModel> | null;
  
  ngOnChanges(changes: SimpleChanges): void {
    this.barChartData = this.summary?.missionBreakdown?.map(mb => {
      return {
        name: mb.missionName, 
        value: mb.count
      };
    }) ?? null;
  }
}
