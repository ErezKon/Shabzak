import { createSelector } from "@ngrx/store";
import { AppState } from "../states/app.state";
import { UsersState } from "../states/user.state";

export const selectUserState = (state: AppState) => state.user;

export const selectUser = createSelector(
  selectUserState,
  (state: UsersState) => state.user
);