import { Component, Input, OnInit } from '@angular/core';
import { Position } from '../../../models/position.enum';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { translatePosition } from '../../../utils/position.translator';

@Component({
  selector: 'app-soldier-position',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './soldier-position.component.html',
  styleUrl: './soldier-position.component.scss'
})
export class SoldierPositionComponent implements OnInit {

  @Input() position!: Position;
  @Input() textualPosition?: string;

  isSpecial!: boolean;
  iconName!: string;
  tooltip!: string;



  ngOnInit(): void {
    if(this.textualPosition && !this.position) {
      this.position = Position[this.textualPosition as keyof typeof Position];
    }
    this.tooltip = translatePosition(this.position);
    switch (this.position) {
      case Position.Simple:
        this.isSpecial = true;
        this.iconName = 'simple'
        break;
      case Position.Marksman:
        this.isSpecial = false;
        this.iconName = 'my_location'
        break;
      case Position.GrenadeLauncher:
        this.isSpecial = true;
        this.iconName = 'grenade'
        break;
      case Position.Medic:
        this.isSpecial = false;
        this.iconName = 'local_hospital'
        break;
      case Position.Negev:
        this.isSpecial = true;
        this.iconName = 'negev'
        break;
      case Position.Hamal:
        this.isSpecial = true;
        this.iconName = 'hamal'
        break;
      case Position.Sniper:
        this.isSpecial = true;
        this.iconName = 'sniper'
        break;
      case Position.Translator:
        this.isSpecial = true;
        this.iconName = 'translator'
        break;
      case Position.ShootingInstructor:
        this.isSpecial = true;
        this.iconName = 'skull'
        break;
      case Position.KravMagaInstructor:
        this.isSpecial = true;
        this.iconName = 'fist'
        break;
      case Position.DroneOperator:
        this.isSpecial = true;
        this.iconName = 'drone'
        break;
      case Position.PlatoonCommanderComms:
        this.isSpecial = true;
        this.iconName = 'platoon-radio'
        break;
      case Position.CompanyCommanderComms:
        this.isSpecial = true;
        this.iconName = 'deputy-radio'
        break;
      case Position.ClassCommander:
        this.isSpecial = true;
        this.iconName = 'sergeant'
        break;
      case Position.Sergant:
        this.isSpecial = true;
        this.iconName = 'staff-sergeant'
        break;
      case Position.CompanyCommander:
        this.isSpecial = true;
        this.iconName = 'captain'
        break;
      case Position.CompanyDeputy:
        this.isSpecial = true;
        this.iconName = 'lieutenant-2'
        break;
      case Position.PlatoonCommander:
        this.isSpecial = true;
        this.iconName = 'lieutenant-1'
        break;
    
      default:
        break;
    }
  }
}
