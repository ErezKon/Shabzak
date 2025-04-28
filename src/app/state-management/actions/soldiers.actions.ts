import { createAction, props } from "@ngrx/store";
import { Soldier } from "../../models/soldier.model";
import { Vacation } from "../../models/vacation.model";
import { VacationRequestStatus } from "../../models/vacation-request-stats.enum";

export const getSoldiers = createAction(
    '[Soldiers] Get Soldiers'
);
export const getSoldiersSuccess = createAction(
    '[Soldiers] Get Soldiers Success',
    props<{ soldiers: Array<Soldier> }>()
);
export const getSoldiersFailure = createAction(
    '[Soldiers] Get Soldiers Failure'
);

export const updateSoldier = createAction(
    '[Soldiers] Update Soldier',
    props<{ soldier: Soldier }>()
);
export const updateSoldierSuccess = createAction(
    '[Soldiers] Update Soldier Success',
    props<{ soldier: Soldier }>()
);
export const updateSoldierFailure = createAction(
    '[Soldiers] Update Soldier Failure'
);

export const addSoldier = createAction(
    '[Soldiers] Add Soldier',
    props<{ soldier: Soldier }>()
);
export const addSoldierSuccess = createAction(
    '[Soldiers] Add Soldier Success',
    props<{ soldier: Soldier }>()
);
export const addSoldierFailure = createAction(
    '[Soldiers] Add Soldier Failure'
);

export const deleteSoldier = createAction(
    '[Soldiers] Delete Soldier',
    props<{ soldierId: number }>()
);
export const deleteSoldierSuccess = createAction(
    '[Soldiers] Delete Soldier Success',
    props<{ soldierId: number }>()
);
export const deleteSoldierFailure = createAction(
    '[Soldiers] Delete Soldier Failure'
);

export const requestVacation = createAction(
    '[Soldiers] Request Vacation',
    props<{ soldierId: number, from: Date, to: Date }>()
);
export const requestVacationSuccess = createAction(
    '[Soldiers] Request Vacation Success',
    props<{ vacation: Vacation }>()
);
export const requestVacationFailure = createAction(
    '[Soldiers] Request Vacation Failure'
);

export const respondToVacation = createAction(
    '[Soldiers] Respond To Vacation',
    props<{ vacationId: number, response: VacationRequestStatus }>()
);
export const respondToVacationSuccess = createAction(
    '[Soldiers] Respond To Vacation Success',
    props<{ vacation: Vacation }>()
);
export const respondToVacationFailure = createAction(
    '[Soldiers] Respond To Vacation Failure'
);

export const getVacations = createAction(
    '[Soldiers] Get Vacations',
    props<{ soldierId?: number, status?: VacationRequestStatus }>()
);
export const getVacationsSuccess = createAction(
    '[Soldiers] Get Vacations Success',
    props<{ vacations: Array<Vacation> }>()
);
export const getVacationsFailure = createAction(
    '[Soldiers] Get Vacations Failure'
);