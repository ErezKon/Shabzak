import { createReducer, on } from "@ngrx/store";
import { initialSoldiersState } from "../states/soldiers.state";

import * as soldierActions from '../actions/soldiers.actions';
import { Soldier } from "../../models/soldier.model";

export const soldiersReducer = createReducer(
    initialSoldiersState,
    on(soldierActions.getSoldiers, (state) => ({ ...state, soldiers: initialSoldiersState.soldiers })),
    on(soldierActions.getSoldiersSuccess, (state, {soldiers}) => ({ ...state, soldiers: soldiers })),
    on(soldierActions.addSoldierSuccess, (state, {soldier}) => ({...state, soldiers: [...state.soldiers, soldier]})),
    on(soldierActions.deleteSoldierSuccess, (state, {soldierId}) => ({...state, soldiers: state.soldiers.filter(s => s.id !== soldierId)})),
    on(soldierActions.updateSoldierSuccess, (state, {soldier}) => {
        const soldiers: Array<Soldier> = [];
        for (const s of state.soldiers) {
            if(s.id === soldier.id) {
                soldiers.push(soldier);
            } else {
                soldiers.push(s)
            }
        }
        return {...state, soldiers: soldiers};
    })
);