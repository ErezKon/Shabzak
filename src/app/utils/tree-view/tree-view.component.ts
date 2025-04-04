import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tree-view',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './tree-view.component.html',
  styleUrl: './tree-view.component.scss'
})
export class TreeViewComponent implements OnInit{
  @Input() expanded = false;
  @Input() title: string = '';
  @Input() level = 0;
  @Output() expandStateChanged = new EventEmitter<boolean>();

  levelPadding: number = 0;

  ngOnInit(): void {
    this.levelPadding = this.level * 25;
  }

  onExpandCStateChanged() {
    this.expanded = !this.expanded;
    this.expandStateChanged.emit(this.expanded);
  }
}
