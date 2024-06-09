import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GetAvailableSoldiers } from '../../../../models/get-available-soldier.model';
import { SoldierPositionComponent } from '../../../soldiers/soldier-position/soldier-position.component';
import { CommonModule } from '@angular/common';
import { Soldier } from '../../../../models/soldier.model';

@Component({
  selector: 'app-available-soldiers',
  standalone: true,
  imports: [CommonModule, SoldierPositionComponent],
  templateUrl: './available-soldiers.component.html',
  styleUrl: './available-soldiers.component.scss'
})
export class AvailableSoldiersComponent {
  @Input() availableSoldiers?: Array<GetAvailableSoldiers>;

  @Output() availableSoldiersSelected = new EventEmitter<Array<Soldier>>;

  selectedSoldiers = new Array<Soldier>();
  soldiersDic = new Set<number>();

  onSoldierSelected(soldier: Soldier) {
    if(this.soldiersDic.has(soldier.id)) {
      this.selectedSoldiers = this.selectedSoldiers.filter(s => s.id !== soldier.id);
      this.soldiersDic.delete(soldier.id);
    } else {
      this.selectedSoldiers.push(soldier);
      this.soldiersDic.add(soldier.id);
    }
    this.availableSoldiersSelected.emit(this.selectedSoldiers);
  }
}
