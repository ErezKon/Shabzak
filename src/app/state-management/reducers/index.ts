import { routerReducer } from "@ngrx/router-store";
import { ActionReducerMap, ActionReducer } from "@ngrx/store";
import { AppState } from "../states/app.state";
import { soldiersReducer } from "./soldiers.reducer";

export const appReducers: ActionReducerMap<AppState> = {
  router: routerReducer,
  soldiers: soldiersReducer
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

export const metaReducers = [logger];