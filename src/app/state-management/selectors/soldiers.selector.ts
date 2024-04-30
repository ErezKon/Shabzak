import { createSelector } from "@ngrx/store";
import { AppState } from "../states/app.state";
import { SoldiersState } from "../states/soldiers.state";

export const selectSoldiersState = (state: AppState) => state.soldiers;

export const selectSoldiers = createSelector(
  selectSoldiersState,
  (state: SoldiersState) => state.soldiers
);