import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BarChartModel } from '../../../models/metadata/bar-chart.model';

@Component({
  selector: 'app-pie-grid',
  standalone: true,
  imports: [
    NgxChartsModule
  ],
  templateUrl: './pie-grid.component.html',
  styleUrl: './pie-grid.component.scss'
})
export class PieGridComponent implements OnChanges{

  @Input() data!: BarChartModel[] | null;
  @Input() view: [number, number] = [500, 400];
  @Input() dynamicWidth?: number;
  @Input() dynamicHeight?: number;

  calculatedView: [number, number] = this.view;

  // options
  showLegend: boolean = true;
  showLabels: boolean = true;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };
  
  onSelect(event: any) {
    console.log(event);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.dynamicWidth || this.dynamicHeight) {
      this.setDynamicView();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if(this.dynamicWidth || this.dynamicHeight) {
      this.setDynamicView();
    }
  }

  private setDynamicView() {
    let width = this.view[0];
    let height = this.view[1];
    if(this.dynamicWidth) {
      width = (this.dynamicWidth / 100) * window.innerWidth;
    }
    if(this.dynamicHeight) {
      height = (this.dynamicHeight / 100) * window.innerHeight;
    }
    this.calculatedView = [width, height];
  }
}
