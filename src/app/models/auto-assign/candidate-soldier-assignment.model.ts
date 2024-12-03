import { Soldier } from "../soldier.model";

export interface CandidateSoldierAssignment {
    soldier: Soldier;
    rank: number;
    missionsAssignedTo?: number;
    rankBreakdown: Map<string, number>;
}