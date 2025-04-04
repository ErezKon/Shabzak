import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { GetAvailableSoldiers } from '../../../../models/get-available-soldier.model';
import { SoldierPositionComponent } from '../../../soldiers/soldier-position/soldier-position.component';
import { CommonModule } from '@angular/common';
import { Soldier } from '../../../../models/soldier.model';
import { MissionInstance } from '../../../../models/mission-instance.model';

@Component({
  selector: 'app-available-soldiers',
  standalone: true,
  imports: [CommonModule, SoldierPositionComponent],
  templateUrl: './available-soldiers.component.html',
  styleUrl: './available-soldiers.component.scss'
})
export class AvailableSoldiersComponent implements OnChanges {
  @Input() availableSoldiers?: Array<GetAvailableSoldiers>;

  @Input() selectedInstanceAssignedSoldiers?: Array<Soldier>;

  @Input() canSelectSoldiers!: boolean;

  @Input() selectedInstance!: MissionInstance;

  @Output() availableSoldiersSelected = new EventEmitter<Array<Soldier>>;

  selectedSoldiers = new Array<Soldier>();
  soldiersDic = new Set<number>();

  
  ngOnChanges(changes: SimpleChanges): void {
    const newInstanceSelected = changes['selectedInstance']?.currentValue?.id !== changes['selectedInstance']?.previousValue?.id;
    if(newInstanceSelected) {
      this.soldiersDic.clear();
      this.selectedSoldiers = [];
    }
    if(this.selectedInstanceAssignedSoldiers) {
      for (const s of this.selectedInstanceAssignedSoldiers) {
        this.soldiersDic.add(s.id);
      }
    }
    const assignedSoldiers = this.availableSoldiers
      ?.filter(s => s.isAssignedForQueriedInstance)
      ?.map(s => s.soldier) 
      ?? []
    for (const as of assignedSoldiers) {
      this.selectedSoldiers.push(as);
      this.soldiersDic.add(as.id);
    }
    // const newInstanceSelected = changes['selectedInstance']?.currentValue?.id !== changes['selectedInstance']?.previousValue?.id;
    // if(newInstanceSelected) {
    //   this.soldiersDic = new Set<number>();
    // } else {
    //   if(this.selectedInstanceAssignedSoldiers) {
    //     for (const s of this.selectedInstanceAssignedSoldiers) {
    //       this.soldiersDic.add(s.id);
    //     }
    //   }
    // }
  }

  onSoldierSelected(soldier: Soldier) {
    if(this.soldiersDic.has(soldier.id)) {
      this.selectedSoldiers = this.selectedSoldiers.filter(s => s.id !== soldier.id);
      this.soldiersDic.delete(soldier.id);
    } else {
      if(!this.canSelectSoldiers) {
        return;
      }
      this.selectedSoldiers.push(soldier);
      this.soldiersDic.add(soldier.id);
    }
    this.availableSoldiersSelected.emit(this.selectedSoldiers);
  }
}
