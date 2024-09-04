import { createReducer, on } from "@ngrx/store";
import { initialMissionsState } from "../states/missions.state";

import * as missionActions from '../actions/missions.actions';
import { Mission } from "../../models/mission.model";

export const missionsReducer = createReducer(
    initialMissionsState,
    //on(missionActions.getMissions, (state) => ({ ...state, missions: initialMissionsState.missions })),
    on(missionActions.getMissionsSuccess, (state, {missions}) => ({ ...state, missions: missions })),
    on(missionActions.addMissionSuccess, (state, {mission}) => ({...state, missions: [...state.missions, mission]})),
    on(missionActions.deleteMissionSuccess, (state, {missionId}) => ({...state, missions: state.missions.filter(s => s.id !== missionId)})),
    on(missionActions.updateMissionSuccess, (state, {mission}) => {
        const missions: Array<Mission> = [];
        for (const s of state.missions) {
            if(s.id === mission.id) {
                missions.push(mission);
            } else {
                missions.push(s)
            }
        }
        return {...state, missions: missions};
    }),
    on(missionActions.getMissionInstances, (state) => ({ ...state, missionInstances: initialMissionsState.missionInstances })),
    on(missionActions.getMissionInstancesSuccess, (state, {missionInstances}) => ({ ...state, missionInstances: missionInstances })),
    on(missionActions.getAvailableSoldiers, (state) => ({ ...state, availableSoldiers: initialMissionsState.availableSoldiers })),
    on(missionActions.getAvailableSoldiersSuccess, (state, {availableSoldiers}) => ({ ...state, availableSoldiers: availableSoldiers })),
);