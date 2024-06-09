import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MissionInstance } from '../../../../models/mission-instance.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-instance-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instance-view.component.html',
  styleUrl: './instance-view.component.scss'
})
export class InstanceViewComponent {

  @Input() missionInstances?: Array<MissionInstance>;

  @Output() instanceSelect = new EventEmitter<MissionInstance>();

  selectedIndex = 0;

  constructor() {
  }

  onInstanceSelect(instance: MissionInstance, index: number) {
    this.instanceSelect.emit(instance);
    this.selectedIndex = index;
  }
}
