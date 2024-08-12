import { createSelector } from "@ngrx/store";
import { AppState } from "../states/app.state";
import { MetadataState } from "../states/metadata.state";

export const selectMetadataState = (state: AppState) => state.metadata;

export const selectAssignmentsPerSoldier = createSelector(
  selectMetadataState,
  (state: MetadataState) => state.assignmentsPerSoldier
);

export const selectHoursPerSoldier = createSelector(
  selectMetadataState,
  (state: MetadataState) => state.hoursPerSoldier
);

export const selectAssignmentsBreakdownPerSoldier = createSelector(
  selectMetadataState,
  (state: MetadataState) => state.assignmentsBreakdownPerSoldier
);

