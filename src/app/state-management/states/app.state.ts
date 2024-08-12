import { RouterReducerState } from "@ngrx/router-store";
import { SoldiersState, initialSoldiersState } from "./soldiers.state";
import { MissionsState, initialMissionsState } from "./missions.state";
import { initialMetadataState, MetadataState } from "./metadata.state";

export interface AppState {
    router?: RouterReducerState;
    soldiers: SoldiersState;
    missions: MissionsState;
    metadata: MetadataState;
  }
  
  export const initialAppState: AppState = {
    soldiers: initialSoldiersState,
    missions: initialMissionsState,
    metadata: initialMetadataState
  };