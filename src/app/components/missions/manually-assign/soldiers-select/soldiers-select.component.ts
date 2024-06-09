import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Soldier } from '../../../../models/soldier.model';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BaseComponent } from '../../../../utils/base-component/base-component.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-soldiers-select',
  standalone: true,
  imports: [BaseComponent, MatCheckboxModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './soldiers-select.component.html',
  styleUrl: './soldiers-select.component.scss'
})
export class SoldiersSelectComponent extends BaseComponent implements OnChanges {
  @Input() soldiers?: Array<Soldier>;
  @Output() selectedSoldiersChanged = new EventEmitter<Array<number>>;

  filteredSoldiers?: Array<Soldier>;


  soldierSelected!: any;
  selectAll = true;
  
  nameFilterControl = new FormControl('');
  platoonFilterControl = new FormControl('');
  platoons = new Array<string>();

  constructor() {
    super();
    this.addSub(this.nameFilterControl.valueChanges.subscribe(val => {
      if(val) {
        this.filteredSoldiers = this.soldiers?.filter(s => s.name.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1);
      } else {
        this.filteredSoldiers = this.soldiers;
      }
    }));

    this.addSub(this.platoonFilterControl.valueChanges.subscribe(val => {
      for (const soldier of this.filteredSoldiers ?? []) {
        this.soldierSelected[soldier.id] = val?.indexOf(soldier.platoon) !== -1;
        this.emitSoldiers();
      }
    }))
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filteredSoldiers = this.soldiers;
    this.soldierSelected = {};
    for (const soldier of this.filteredSoldiers ?? []) {
      this.soldierSelected[soldier.id] = true;
      if(this.platoons.filter(p => p === soldier.platoon)?.length === 0) {
        this.platoons.push(soldier.platoon);
        this.platoons = this.platoons.sort();
      }
    }
    this.emitSoldiers();
  }

  onSelectAll(event: any) {
    this.nameFilterControl.setValue
    for (const soldier of this.filteredSoldiers ?? []) {
      this.soldierSelected[soldier.id] = this.selectAll;
    }
    this.emitSoldiers();
  }

  emitSoldiers() {
    const emit = new Array<number>();
    for (const key in this.soldierSelected) {
      if (Object.prototype.hasOwnProperty.call(this.soldierSelected, key)) {
        const selected = this.soldierSelected[key];
        if(selected) {
          emit.push(+key);
        }
      }
    }
    this.selectedSoldiersChanged.emit(emit);
  }
}
