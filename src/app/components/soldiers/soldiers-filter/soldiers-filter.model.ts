import { Position } from "../../../models/position.enum";

export interface SoldiersFilter {
    text?: string;
    platoon?: string;
    company?: string;
    positions?: Array<Position>;
}