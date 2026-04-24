import { Soldier } from "./soldier.model";

export interface ReplacementCandidate {
    soldier: Soldier;
    score: number;
    hasOverlap: boolean;
    overlappingMissionInstanceId?: number;
    overlappingMissionName?: string;
    restTimeBefore?: number;
    restTimeAfter?: number;
    isAssignedToThisInstance: boolean;
}
