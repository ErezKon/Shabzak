import { DataPerSoldierBase } from "./data-per-soldier-base.model";

export interface AssignmentsPerSoldier extends DataPerSoldierBase {
    totalAssignments: number;
}