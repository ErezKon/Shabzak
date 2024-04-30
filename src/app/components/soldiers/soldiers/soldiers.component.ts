import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Soldier } from '../../../models/soldier.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Position } from '../../../models/position.enum';
import { translatePosition } from '../../../utils/position.tranbslator';
import { Observable } from 'rxjs';
import { BaseComponent } from '../../../utils/base-component/base-component.component';

@Component({
  selector: 'app-soldiers',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatIconModule, BaseComponent],
  templateUrl: './soldiers.component.html',
  styleUrl: './soldiers.component.scss'
})
export class SoldiersComponent extends BaseComponent implements OnInit{

  @Input() soldiers$!: Observable<Array<Soldier>>;

  @Output() editSoldier = new EventEmitter<Soldier>();

  displayedColumns: string[] = ['name', 'personalNumber', 'phone', 'platoon', 'company', 'positions', 'actions'];
  dataSource: any;

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }
  
  
  ngOnInit(): void {
    this.addSub(this.soldiers$.subscribe(soldiers => {
      this.dataSource = new MatTableDataSource(soldiers);
      this.cdRef.detectChanges();
    }));
  }

  onEditSoldier(soldier: Soldier) {
    this.editSoldier.emit({...soldier});
  }

  parsePositions(positions: Array<Position>) {
    return positions.map(s => translatePosition(s)).join(', ');
  }
}
