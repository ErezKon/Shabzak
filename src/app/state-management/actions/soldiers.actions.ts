import { createAction, props } from "@ngrx/store";
import { Soldier } from "../../models/soldier.model";

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