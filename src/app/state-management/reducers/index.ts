import { routerReducer } from "@ngrx/router-store";
import { ActionReducerMap, ActionReducer, MetaReducer } from "@ngrx/store";
import { AppState } from "../states/app.state";
import { soldiersReducer } from "./soldiers.reducer";
import { missionsReducer } from "./missions.reducer";
import { metadataReducer } from "./metadata.reducer";
import { usersReducer } from "./user.reducer";
import { environment } from "../../../environments/environment";
import * as userActions from '../actions/user.actions';

export const appReducers: ActionReducerMap<AppState> = {
  router: routerReducer,
  soldiers: soldiersReducer,
  missions: missionsReducer,
  metadata: metadataReducer,
  user: usersReducer
};

export function logger(reducer: ActionReducer<any>): ActionReducer<any> {
  return function (state, action) {
    console.group(action.type);
    const nextState = reducer(state, action);
    console.log(`%c prev state`, `color: #9E9E9E; font-weight: bold`, state);
    console.log(`%c action`, `color: #03A9F4; font-weight: bold`, action);
    console.log(`%c next state`, `color: #4CAF50; font-weight: bold`, nextState);
    console.groupEnd();
    return nextState;
  };
}

export function resetOnLogout(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return function (state, action) {
    const next = action.type === userActions.logout.type && state ? { router: state.router } as AppState : state;
    return reducer(next, action);
  };
}

// SECURITY: Only enable the NgRx logger meta-reducer in development.
// In production it leaked every action and full state tree to the browser console.
export const metaReducers: MetaReducer<AppState>[] = environment.production ? [resetOnLogout] : [resetOnLogout, logger];