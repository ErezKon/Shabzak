import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { SoldiersFilter } from './soldiers-filter.model';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-soldiers-filter',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatSelectModule,
    ReactiveFormsModule, 
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    BaseComponent
  ],
  templateUrl: './soldiers-filter.component.html',
  styleUrl: './soldiers-filter.component.scss'
})
export class SoldiersFilterComponent extends BaseComponent{

  @Input() platoons: Array<string> = ['1', '2', '3'];
  @Input() companies: Array<string> = ['א', 'ב', 'ג'];

  @Output() filterSoldiers = new EventEmitter<SoldiersFilter> ();

  filter: SoldiersFilter = {};

  platoonsFormControl = new FormControl();
  companyFormControl = new FormControl();
  textControl = new FormControl();

  panelOpenState = false;

  private subs = new Array<Subscription>();

  constructor() {
    super();
    this.addSub(
      this.platoonsFormControl.valueChanges.subscribe(val => {
        this.filter.platoon = val;
        this.filterSoldiers.emit(this.filter);
    })
    );
    this.addSub(
      this.companyFormControl.valueChanges.subscribe(val => {
        this.filter.company = val;
        this.filterSoldiers.emit(this.filter);
    })
    );
    this.addSub(
      this.textControl.valueChanges.subscribe(val => {
        this.filter.text = val;
        this.filterSoldiers.emit(this.filter);
    })
    );
  }
}
