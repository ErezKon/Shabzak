import { Position } from "./position.enum";
import { Vacation } from "./vacation.model";

export interface Soldier {
    id: number;
    name: string;
    personalNumber: string;
    phone: string;
    platoon: string;
    company: string;
    positions: Array<Position>;
    vacations: Array<Vacation>;
}