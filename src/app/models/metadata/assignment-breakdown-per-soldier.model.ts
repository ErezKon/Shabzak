import { AssignmentBreakdown } from "./assignment-breakdown.model";
import { DataPerSoldierBase } from "./data-per-soldier-base.model";

export interface AssignmentBreakdownPerSoldier extends DataPerSoldierBase {
    breakdown: Array<AssignmentBreakdown>;
}