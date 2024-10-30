import { createReducer, on } from "@ngrx/store";
import { initialUsersState } from "../states/user.state";
import * as userActions from '../actions/user.actions';

export const usersReducer = createReducer(
    initialUsersState,
    on(userActions.login, (state) => ({ ...state, user: initialUsersState.user })),
    on(userActions.loginSuccess, (state, {user}) => ({ ...state, user: user }))
);