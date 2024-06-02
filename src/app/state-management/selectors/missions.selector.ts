import { createSelector } from "@ngrx/store";
import { AppState } from "../states/app.state";
import { MissionsState } from "../states/missions.state";

export const selectMissionsState = (state: AppState) => state.missions;

export const selectMissions = createSelector(
  selectMissionsState,
  (state: MissionsState) => state.missions
);