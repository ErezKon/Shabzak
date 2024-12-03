import { AssignmentSoldier } from "./assignment-soldier.model";

export interface Assignment {
    id: number;
    missionName: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    soldiers: AssignmentSoldier[];
    multiplePositions: boolean;
    positionsCount: number;
    isAssignmentFilled: boolean;
}