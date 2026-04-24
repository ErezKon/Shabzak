import { Position } from "./position.enum";
import {SoldierMission} from './soldier-mission.model';
import { Vacation } from "./vacation.model";

export interface Soldier {
    id: number;
    name: string;
    personalNumber: string;
    phone: string;
    platoon: string;
    company: string;
    missions: Array<SoldierMission>;
    positions: Array<Position>;
    vacations: Array<Vacation>;
}