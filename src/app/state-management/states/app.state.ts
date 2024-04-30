import { RouterReducerState } from "@ngrx/router-store";
import { SoldiersState, initialSoldiersState } from "./soldiers.state";

export interface AppState {
    router?: RouterReducerState;
    soldiers: SoldiersState;
  }
  
  export const initialAppState: AppState = {
    soldiers: initialSoldiersState,
  };