import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MissionInstance } from '../../../../models/mission-instance.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-instance-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instance-view.component.html',
  styleUrl: './instance-view.component.scss'
})
export class InstanceViewComponent implements OnChanges {

  @Input() missionInstances?: Array<MissionInstance> | null = null;
  @Input() multiSelect: boolean = false;
  @Input() initialSelectAll: boolean = false;
  @Input() displayMissionName: boolean = false;
  @Input() instanceToMissionDic?: Map<number, string> | null;

  @Output() instanceSelect = new EventEmitter<MissionInstance>();
  @Output() instancesSelect = new EventEmitter<Array<MissionInstance>>();

  selectedIds: Set<number> = new Set<number>();
  selected: Array<MissionInstance> = [];

  private allSelected = false;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.multiSelect && this.initialSelectAll) {
      this.onSelectAll();
    } else {
      if(this.missionInstances?.length) {
        this.selectedIds = new Set<number>();
        this.selectedIds.add(this.missionInstances[0].id);
      }
    }
  }

  onInstanceSelect(instance: MissionInstance) {
    if(this.multiSelect) {
      const filtered = this.selected.filter(mi => mi.id === instance.id);
      if(filtered.length === 0) {
        this.selected.push(instance);
        this.selectedIds.add(instance.id);
      } else {
        this.selected = this.selected.filter(mi => mi.id !== instance.id);
        this.selectedIds.delete(instance.id);
      }
      this.instancesSelect.emit(this.selected);
    } else {
      this.selectedIds = new Set<number>();
      this.selectedIds.add(instance.id);
      this.instanceSelect.emit(instance);
    }
  }

  onSelectAll() {
    if(!this.missionInstances?.length) {
      return;
    }
    this.selectedIds = new Set<number>();
    this.selected = [];
    this.allSelected = !this.allSelected;
    if(this.allSelected) {
      for (const instance of this.missionInstances ?? []) {
        this.selectedIds.add(instance.id);
        this.selected.push(instance);
      }
    }
    this.instancesSelect.emit(this.selected);
  }
}
