import { Component, HostListener, Inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatListItem, MatNavList } from '@angular/material/list';
import { DomSanitizer } from '@angular/platform-browser';
import { WindowSizeService } from './services/window-size.service';
import { UserRole } from './models/user-role.enum';
import { map, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from './state-management/states/app.state';
import { selectUser } from './state-management/selectors/user.selector';

import { selectUrl } from './state-management/selectors/router.selector';


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

  userRole$: Observable<number>;

  sidenavLinks = [
    {
      name: 'דף אישי',
      url: '/personal-page',
      role: UserRole.Regular,
      selected: true
    },
    {
      name: 'חיילים',
      url: '/soldiers',
      role: UserRole.Admin,
      selected: false
    },
    {
      name: 'משימות',
      url: '/missions',
      role: UserRole.Admin,
      selected: false
    },
    {
      name: 'שבצ"ק',
      url: '/assignments',
      role: UserRole.Regular,
      selected: false
    },
    {
      name: 'צדק',
      url: '/justice',
      role: UserRole.Admin,
      selected: false
    }
  ];

  ngOnInit(): void {
  }

  constructor(
      iconRegistry: MatIconRegistry, 
      sanitizer: DomSanitizer, 
      public windowSizeService: WindowSizeService, 
      store: Store<AppState>,
      @Inject(DOCUMENT) private document: Document) {
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
    iconRegistry.addSvgIcon('wand', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/wand.svg'));

    this.userRole$ = store.pipe(select(selectUser))
    .pipe(map(user => {
      if(!user || !user.enabled || !user.activated) {
        return -1;
      }
      return user.role;
    }));

    store.pipe(select(selectUrl))
    .subscribe(url => {
      if(url) {
        for (const sidenav of this.sidenavLinks) {
          sidenav.selected = sidenav.url === url;
        }
      }
    });
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
