import { RouterReducerState } from "@ngrx/router-store";
import { SoldiersState, initialSoldiersState } from "./soldiers.state";
import { MissionsState, initialMissionsState } from "./missions.state";
import { initialMetadataState, MetadataState } from "./metadata.state";
import { initialUsersState, UsersState } from "./user.state";

export interface AppState {
    router?: RouterReducerState;
    soldiers: SoldiersState;
    missions: MissionsState;
    metadata: MetadataState;
    user: UsersState;
  }
  
  export const initialAppState: AppState = {
    soldiers: initialSoldiersState,
    missions: initialMissionsState,
    metadata: initialMetadataState,
    user: initialUsersState
  };