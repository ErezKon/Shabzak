import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { Mission } from '../../../models/mission.model';
import { Position } from '../../../models/position.enum';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { translatePosition } from '../../../utils/position.translator';
import { MissionPosition } from '../../../models/mission-position.model';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatIconModule, MatSortModule, BaseComponent],
  templateUrl: './missions.component.html',
  styleUrl: './missions.component.scss'
})
export class MissionsComponent extends BaseComponent implements OnInit{
  @Input() missions$!: Observable<Array<Mission>>;

  @Output() editMission = new EventEmitter<Mission>();

  @Output() manuallyAssign = new EventEmitter<Mission>();

  @Output() deleteMission = new EventEmitter<number>();

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'soldiersRequired', 'commandersRequired', 'duration', 'fromTime', 'toTime', 'isSpecial', 'positions', 'actions'];
  dataSource: any;

  constructor(private cdRef: ChangeDetectorRef) {
    super();
  }
  
  
  ngOnInit(): void {
    this.addSub(this.missions$.subscribe(missions => {
      this.dataSource = new MatTableDataSource(missions);
      this.dataSource.sort = this.sort;
      this.cdRef.detectChanges();
    }));
  }

  onEditMission(mission: Mission) {
    this.editMission.emit({...mission});
  }

  onDeleteMission(missionId: number) {
    this.deleteMission.emit(missionId);
  }

  onManuallyAssign(mission: Mission) {
    this.manuallyAssign.emit(mission);
  }

  parsePositions(positions: Array<MissionPosition>): string {
    return positions.map(s => `${s.count} ${translatePosition(s.position)}`).join(', ');
  }

  sortData(sort: Sort) {
    this.dataSource.sort = this.sort;
  }
}
