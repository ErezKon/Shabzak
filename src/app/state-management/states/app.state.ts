import { RouterReducerState } from "@ngrx/router-store";
import { SoldiersState, initialSoldiersState } from "./soldiers.state";
import { MissionsState, initialMissionsState } from "./missions.state";

export interface AppState {
    router?: RouterReducerState;
    soldiers: SoldiersState;
    missions: MissionsState;
  }
  
  export const initialAppState: AppState = {
    soldiers: initialSoldiersState,
    missions: initialMissionsState
  };