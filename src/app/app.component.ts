import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MaterialModule } from './material/material/material.module';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatListItem, MatNavList } from '@angular/material/list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, MatToolbarModule, MatIconModule, MatSidenavModule, MatNavList, MatListItem],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'שבצ"ק';
  sidenavOpened: boolean = true;

  sidenavLinks = [
    {
      name: 'חיילים',
      url: '/soldiers',
      selected: true
    },
    {
      name: 'משימות',
      url: '/missions',
      selected: false
    }
  ];

  ngOnInit(): void {
    // if (window.innerWidth <= 767) {
    //   this.sidenavOpened = false;
    // }
  }

  constructor(private router: Router) {
    
  }

  onSelectLink(link: any) {
    for (const l of this.sidenavLinks) {
      l.selected = false;
    }
    link.selected = true;
    //this.router.navigateByUrl(link.url);
  }

  toggleNav() {
    this.sidenavOpened = !this.sidenavOpened;
  }
}
