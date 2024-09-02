import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BarChartModel } from '../../../models/metadata/bar-chart.model';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { WindowSizeService } from '../../../services/window-size.service';
import { BaseComponent } from '../../../utils/base-component/base-component.component';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [
    NgxChartsModule
  ],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent extends BaseComponent implements OnChanges{

  @Input() public data!: Array<BarChartModel> | null;
  @Input() public xAxisLabel!: string;
  @Input() public yAxisLabel!: string;
  @Input() public showLegend = true;

  view!: [number, number];

  colorsSet = new Set<string>();
  

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showXAxisLabel = true;
  showYAxisLabel = true;

  colorScheme: Color = {
    name: 'chart-scheme',
    domain: new Array<string>(),
    selectable: true,
    group: ScaleType.Linear
  };

  constructor(public windowSizeService: WindowSizeService) {
    super();
    this.addSub(windowSizeService.getSize$.subscribe(size => {
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
}
