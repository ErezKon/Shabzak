import { MissionInstance } from "../mission-instance.model";
import { CandidateSoldierAssignment } from "./candidate-soldier-assignment.model";

export interface CandidateMissionInstance extends MissionInstance { 
    candidates?: Array<CandidateSoldierAssignment>;
}