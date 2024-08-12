import { AssignmentBreakdownPerSoldier } from "../../models/metadata/assignment-breakdown-per-soldier.model";
import { AssignmentsPerSoldier } from "../../models/metadata/assignments-per-soldier.model";
import { HoursPerSoldier } from "../../models/metadata/hours-per-soldier.model";

export interface MetadataState {
    assignmentsPerSoldier: Array<AssignmentsPerSoldier>;
    hoursPerSoldier: Array<HoursPerSoldier>;
    assignmentsBreakdownPerSoldier: Array<AssignmentBreakdownPerSoldier>
}
  
export const initialMetadataState: MetadataState = {
    assignmentsPerSoldier: [],
    hoursPerSoldier: [],
    assignmentsBreakdownPerSoldier: []
};