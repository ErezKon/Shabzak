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
    on(missionActions.getAvailableSoldiers, (state) => ({ ...state, availableSoldiers: initialMissionsState.availableSoldiers, fetchingAvailableSoldiers: true })),
    on(missionActions.getAvailableSoldiersSuccess, (state, {availableSoldiers}) => ({ ...state, availableSoldiers: availableSoldiers, fetchingAvailableSoldiers: false })),
    on(missionActions.getAvailableSoldiersFailure, (state) => ({ ...state, fetchingAvailableSoldiers: false })),
    on(missionActions.getMissionInstancesInRange, (state) => ({ ...state, missionInstances: initialMissionsState.missionInstances })),
    on(missionActions.getMissionInstancesInRangeSuccess, (state, {missionInstances}) => ({ ...state, missionInstances: missionInstances })),
    on(missionActions.autoAssign, (state) => ({ ...state, candidateAssignments: initialMissionsState.candidateAssignments, autoAssigning: true, candidatesList: [] })),
    on(missionActions.autoAssignSuccess, (state, {candidates}) => {
        const best = candidates.find(c => c.isBestCandidate) || candidates[0];
        return {
            ...state,
            candidateAssignments: best ?? ({} as any),
            autoAssigning: false,
            candidatesIds: candidates.map(c => c.id),
            candidatesList: candidates
        };
    }),
    on(missionActions.autoAssignFailure, (state) => ({ ...state, autoAssigning: false })),
    on(missionActions.getAllCandidatesSuccess, (state, {candidates}) => ({ ...state, candidatesIds: candidates })),
    on(missionActions.getCandidateSuccess, (state, {candidate}) => ({ ...state, candidateAssignments: candidate })),
    on(missionActions.acceptAutoAssignCandidateSuccess, (state, {missions}) => ({ ...state, missions: missions})),
    on(missionActions.removeSoldierFromMissionInstanceSuccess, (state, {missions}) => ({ ...state, missions: missions })),
    on(missionActions.startInteractiveAutoAssign, (state) => ({ ...state, interactiveLoading: true, interactiveSession: null })),
    on(missionActions.startInteractiveAutoAssignSuccess, (state, {step}) => {
        if (step.status === 'Completed' && step.result) {
            return {
                ...state,
                interactiveLoading: false,
                interactiveSession: step,
                candidateAssignments: step.result,
                candidatesIds: [step.result.id],
                candidatesList: [step.result]
            };
        }
        return { ...state, interactiveLoading: false, interactiveSession: step };
    }),
    on(missionActions.startInteractiveAutoAssignFailure, (state) => ({ ...state, interactiveLoading: false })),
    on(missionActions.continueInteractiveAutoAssign, (state) => ({ ...state, interactiveLoading: true })),
    on(missionActions.continueInteractiveAutoAssignSuccess, (state, {step}) => {
        if (step.status === 'Completed' && step.result) {
            return {
                ...state,
                interactiveLoading: false,
                interactiveSession: step,
                candidateAssignments: step.result,
                candidatesIds: [step.result.id],
                candidatesList: [step.result]
            };
        }
        return { ...state, interactiveLoading: false, interactiveSession: step };
    }),
    on(missionActions.continueInteractiveAutoAssignFailure, (state) => ({ ...state, interactiveLoading: false })),
    on(missionActions.cancelInteractiveAutoAssignSuccess, (state) => ({ ...state, interactiveSession: null, interactiveLoading: false })),
    on(missionActions.cancelInteractiveAutoAssignFailure, (state) => ({ ...state, interactiveLoading: false })),
    on(missionActions.getReplacementCandidates, (state) => ({
        ...state,
        replacementCandidates: [],
        fetchingReplacementCandidates: true
    })),
    on(missionActions.getReplacementCandidatesSuccess, (state, { replacementCandidates }) => ({
        ...state,
        replacementCandidates,
        fetchingReplacementCandidates: false
    })),
    on(missionActions.getReplacementCandidatesFailure, (state) => ({
        ...state,
        fetchingReplacementCandidates: false
    })),
    on(missionActions.replaceSoldierInMissionInstanceSuccess, (state, { missions }) => ({
        ...state,
        missions
    })),
);