import { createAction, props } from "@ngrx/store";
import { Mission } from "../../models/mission.model";
import { MissionInstance } from "../../models/mission-instance.model";
import { GetAvailableSoldiers } from "../../models/get-available-soldier.model";
import { SoldierMission } from "../../models/soldier-mission.model";
import { AssignmentsPerSoldier } from "../../models/metadata/assignments-per-soldier.model";
import { HoursPerSoldier } from "../../models/metadata/hours-per-soldier.model";
import { AssignmentBreakdownPerSoldier } from "../../models/metadata/assignment-breakdown-per-soldier.model";
import { SoldierMetadataType } from "../../models/metadata/soldier-metadata-type.enum";

export const getAssignmentsPerSoldiers = createAction(
    '[Metadata] Get Assignments Per Soldier',
    props<{ range: {from?: Date, to: Date, soldierType?: SoldierMetadataType} }>()
);
export const getAssignmentsPerSoldiersSuccess = createAction(
    '[Metadata] Get Assignments Per Soldier Success',
    props<{ assignmentsPerSoldier: Array<AssignmentsPerSoldier> }>()
);
export const getAssignmentsPerSoldiersFailure = createAction(
    '[Metadata] Get Assignments Per Soldier Failure'
);

export const getHoursPerSoldiers = createAction(
    '[Metadata] Get Hours Per Soldier',
    props<{ range: {from?: Date, to: Date, soldierType?: SoldierMetadataType} }>()
);
export const getHoursPerSoldiersSuccess = createAction(
    '[Metadata] Get Hours Per Soldier Success',
    props<{ hoursPerSoldier: Array<HoursPerSoldier> }>()
);
export const getHoursPerSoldiersFailure = createAction(
    '[Metadata] Get Hours Per Soldier Failure'
);

export const getAssignmentsBreakdownPerSoldiers = createAction(
    '[Metadata] Get Assignments Breakdown Per Soldier',
    props<{ range: {from?: Date, to: Date, soldierType?: SoldierMetadataType} }>()
);
export const getAssignmentsBreakdownPerSoldiersSuccess = createAction(
    '[Metadata] Get Assignments Breakdown Per Soldier Success',
    props<{ assignmentsBreakdownPerSoldier: Array<AssignmentBreakdownPerSoldier> }>()
);
export const getAssignmentsBreakdownPerSoldiersFailure = createAction(
    '[Metadata] Get Assignments Breakdown Per Soldier Failure'
);