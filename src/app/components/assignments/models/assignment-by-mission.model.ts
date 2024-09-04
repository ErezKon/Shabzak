import { Assignment } from "./assignment.model";

export interface AssignmentByMission {
    missionName: string;
    missionPositions: number;
    assignments: Assignment[];
}