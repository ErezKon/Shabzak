import { Component, HostListener } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MaterialModule } from './material/material/material.module';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon, MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatListItem, MatNavList } from '@angular/material/list';
import { DomSanitizer } from '@angular/platform-browser';
import { WindowSizeService } from './services/window-size.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, MatToolbarModule, MatIconModule, MatSidenavModule, MatNavList, MatListItem],
  providers: [WindowSizeService],
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
    },
    {
      name: 'שבצ"ק',
      url: '/assignments',
      selected: false
    },
    {
      name: 'צדק',
      url: '/justice',
      selected: false
    }
  ];

  ngOnInit(): void {
    // if (window.innerWidth <= 767) {
    //   this.sidenavOpened = false;
    // }
  }

  constructor(private router: Router, iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, public windowSizeService: WindowSizeService) {
    iconRegistry.addSvgIcon('bat-logo', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/9213-logo-no-text.svg'));
    iconRegistry.addSvgIcon('simple', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/simple.svg'));
    iconRegistry.addSvgIcon('grenade', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/grenade.svg'));
    iconRegistry.addSvgIcon('negev', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/negev.svg'));
    iconRegistry.addSvgIcon('hamal', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/hamal.svg'));
    iconRegistry.addSvgIcon('sniper', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/sniper.svg'));
    iconRegistry.addSvgIcon('translator', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/translator.svg'));
    iconRegistry.addSvgIcon('skull', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/skull.svg'));
    iconRegistry.addSvgIcon('fist', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/fist.svg'));
    iconRegistry.addSvgIcon('drone', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/drone.svg'));
    iconRegistry.addSvgIcon('platoon-radio', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/platoon-radio.svg'));
    iconRegistry.addSvgIcon('deputy-radio', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/deputy-radio.svg'));
    iconRegistry.addSvgIcon('lieutenant-1', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/lieutenant-1.svg'));
    iconRegistry.addSvgIcon('lieutenant-2', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/lieutenant-2.svg'));
    iconRegistry.addSvgIcon('captain', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/captain.svg'));
    iconRegistry.addSvgIcon('sergeant', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/sergeant.svg'));
    iconRegistry.addSvgIcon('staff-sergeant', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/staff-sergeant.svg'));
    // iconRegistry.addSvgIcon(
    //   'bat-logo',
    //   'src/assets/icons/9213-logo-no-text.svg'
    // );
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
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const width = event.target.innerWidth;
    const height = event.target.innerHeight;

    this.windowSizeService.changeSize(height, width);
  }
}
