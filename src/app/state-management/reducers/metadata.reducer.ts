import { createReducer, on } from "@ngrx/store";

import * as metadataActions from '../actions/metadata.actions';
import { initialMetadataState } from "../states/metadata.state";

export const metadataReducer = createReducer(
    initialMetadataState,
    
    on(metadataActions.getAssignmentsPerSoldiers, (state) => ({ ...state, assignmentsPerSoldier: initialMetadataState.assignmentsPerSoldier })),
    on(metadataActions.getAssignmentsPerSoldiersSuccess, (state, {assignmentsPerSoldier}) => ({ ...state, assignmentsPerSoldier: assignmentsPerSoldier })),

    on(metadataActions.getHoursPerSoldiers, (state) => ({ ...state, hoursPerSoldier: initialMetadataState.hoursPerSoldier })),
    on(metadataActions.getHoursPerSoldiersSuccess, (state, {hoursPerSoldier}) => ({ ...state, hoursPerSoldier: hoursPerSoldier })),
    
    on(metadataActions.getAssignmentsBreakdownPerSoldiers, (state) => ({ ...state, assignmentsBreakdownPerSoldier: initialMetadataState.assignmentsBreakdownPerSoldier })),
    on(metadataActions.getAssignmentsBreakdownPerSoldiersSuccess, (state, {assignmentsBreakdownPerSoldier}) => ({ ...state, assignmentsBreakdownPerSoldier: assignmentsBreakdownPerSoldier })),
);