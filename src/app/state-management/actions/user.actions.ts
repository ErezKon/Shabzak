import { createAction, props } from "@ngrx/store";
import { User } from "../../models/user.model";
import { GeneralResponse } from "../../models/general-response.model";

export const login = createAction(
    '[User] Login',
    props<{ username: string, password: string }>()
);
export const loginSuccess = createAction(
    '[User] Login Success',
    props<{ user: User }>()
);
export const loginFailure = createAction(
    '[User] Login Failure'
);

export const createUsersForSoldiers = createAction(
    '[User] Create Users For Soldiers',
    props<{ soldierIds: Array<number> }>()
);
export const createUsersForSoldiersSuccess = createAction(
    '[User] Create Users For Soldiers Success'
);
export const createUsersForSoldiersFailure = createAction(
    '[User] Create Users For Soldiers Failure'
);