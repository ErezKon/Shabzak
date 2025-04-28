import { MissionInstance } from "../mission-instance.model";
import { Position } from "../position.enum";
import { CandidateSoldierAssignment } from "./candidate-soldier-assignment.model";

export interface CandidateMissionInstance extends MissionInstance { 
    candidates?: Array<CandidateSoldierAssignment>;
    missingPositions?: Map<string, number>;
}