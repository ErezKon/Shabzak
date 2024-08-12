import { Soldier } from "../soldier.model";

export interface DataPerSoldierBase {
    soldier: Soldier;
    from: Date;
    to: Date;
}