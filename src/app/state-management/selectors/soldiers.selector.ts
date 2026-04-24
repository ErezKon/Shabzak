import { createSelector } from "@ngrx/store";
import { AppState } from "../states/app.state";
import { SoldiersState } from "../states/soldiers.state";

export const selectSoldiersState = (state: AppState) => state.soldiers;

export const selectSoldiers = createSelector(
  selectSoldiersState,
  (state: SoldiersState) => state.soldiers
);
export const selectSoldiersLoading = createSelector(
  selectSoldiersState,
  (state: SoldiersState) => state.loading
);
export const selectVacations = createSelector(
  selectSoldiersState,
  (state: SoldiersState) => state.vacations
);
export const selectSummary = createSelector(
  selectSoldiersState,
  (state: SoldiersState) => state.soldierSummary
);