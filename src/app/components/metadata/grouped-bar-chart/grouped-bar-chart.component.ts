import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { WindowSizeService } from '../../../services/window-size.service';
import { GroupedBarChartModel } from '../../../models/metadata/grouped-bar-chart.model';

@Component({
  selector: 'app-grouped-bar-chart',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './grouped-bar-chart.component.html',
  styleUrl: './grouped-bar-chart.component.scss'
})
export class GroupedBarChartComponent extends BaseComponent implements OnChanges {

  @Input() data!: Array<GroupedBarChartModel> | null;
  @Input() public xAxisLabel!: string;
  @Input() public yAxisLabel!: string;
  @Input() public showLegend = true;

  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = true;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  legendTitle = '';
  
  view!: [number, number];

  colorsSet = new Set<string>();
  colorScheme: Color = {
    name: 'chart-scheme',
    domain: new Array<string>(),
    selectable: true,
    group: ScaleType.Linear
  };

  constructor(private windowSizeService: WindowSizeService) {
    super();
    this.addSub(windowSizeService.getSize$.subscribe(size => {
      console.log(`width: ${size.width}`);
      console.log(`height: ${size.height}`);
      this.view = [0.8 * size.width, 0.7 * size.height]
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const colors = new Array<string>();
    let colorsCount = 0;
    while(colorsCount < (this.data ?? []).length) {
      const color = this.generateRandomColor();
      if(this.colorsSet.has(color)) {
        continue;
      }
      this.colorsSet.add(color);
      colorsCount++;
      colors.push(`#${this.generateRandomColor()}`);
    }
    this.colorScheme.domain = colors;

    if(window) {
      this.windowSizeService.changeSize(window.innerHeight, window.innerWidth);
    }
  }

  private generateRandomColor(): string {
    var randomColor = Math.floor(Math.random()*16777215).toString(16);
    return randomColor;
  }
  
  onSelect(event: any) {
    console.log(event);
  }

  onActivate(event: any) {
    console.log(event);
  }

  onDeactivate(event: any) {
    console.log(event);
  }
}
