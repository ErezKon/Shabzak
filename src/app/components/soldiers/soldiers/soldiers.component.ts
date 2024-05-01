import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Soldier } from '../../../models/soldier.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Position } from '../../../models/position.enum';
import { translatePosition } from '../../../utils/position.tranbslator';
import { Observable } from 'rxjs';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-soldiers',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatIconModule, MatSortModule, BaseComponent],
  templateUrl: './soldiers.component.html',
  styleUrl: './soldiers.component.scss'
})
export class SoldiersComponent extends BaseComponent implements OnInit{

  @Input() soldiers$!: Observable<Array<Soldier>>;

  @Output() editSoldier = new EventEmitter<Soldier>();

  @Output() deleteSoldier = new EventEmitter<number>();

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'personalNumber', 'phone', 'platoon', 'company', 'positions', 'actions'];
  dataSource: any;

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }
  
  
  ngOnInit(): void {
    this.addSub(this.soldiers$.subscribe(soldiers => {
      this.dataSource = new MatTableDataSource(soldiers);
      this.dataSource.sort = this.sort;
      this.cdRef.detectChanges();
    }));
  }

  onEditSoldier(soldier: Soldier) {
    this.editSoldier.emit({...soldier});
  }

  onDeleteSoldier(soldierId: number) {
    this.deleteSoldier.emit(soldierId);
  }

  parsePositions(positions: Array<Position>) {
    return positions.map(s => translatePosition(s)).join(', ');
  }

  sortData(sort: Sort) {
    this.dataSource.sort = this.sort;
  }
}
