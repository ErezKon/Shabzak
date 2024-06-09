import { Soldier } from "./soldier.model";

export interface GetAvailableSoldiers {
    soldier: Soldier;
    restTimeBefore?: number;
    restTimeAfter?: number;
}