import { createReducer, on } from "@ngrx/store";
import { initialMissionsState } from "../states/missions.state";

import * as missionActions from '../actions/missions.actions';
import { Mission } from "../../models/mission.model";

export const missionsReducer = createReducer(
    initialMissionsState,
    on(missionActions.getMissions, (state) => { 
        if(state.missions?.length > 0) {
            return {...state};
        }
        return {
            ...state, 
            missions: initialMissionsState.missions,
            loading: true
        };
    }),
    on(missionActions.getMissionsSuccess, (state, {missions}) => ({ ...state, missions: missions, loading: false })),
    on(missionActions.getMissionInstancesFailure, (state) => ({ ...state, loading: false })),
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
    on(missionActions.getMissionInstancesInRange, (state) => ({ ...state, missionInstances: initialMissionsState.missionInstances })),
    on(missionActions.getMissionInstancesInRangeSuccess, (state, {missionInstances}) => ({ ...state, missionInstances: missionInstances })),
    on(missionActions.autoAssign, (state) => ({ ...state, candidateAssignments: initialMissionsState.candidateAssignments, autoAssigning: true })),
    on(missionActions.autoAssignSuccess, (state, {candidate}) => ({
         ...state, 
         candidateAssignments: candidate, 
         autoAssigning: false,  
         candidatesIds: [candidate.id]
    })),
    on(missionActions.autoAssignFailure, (state) => ({ ...state, autoAssigning: false })),
    on(missionActions.getAllCandidatesSuccess, (state, {candidates}) => ({ ...state, candidatesIds: candidates })),
    on(missionActions.getCandidateSuccess, (state, {candidate}) => ({ ...state, candidateAssignments: candidate, candidatesIds: [candidate.id] })),
    on(missionActions.acceptAutoAssignCandidateSuccess, (state, {missions}) => ({ ...state, missions: missions})),
);