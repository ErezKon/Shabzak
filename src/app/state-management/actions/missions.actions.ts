import { createAction, props } from "@ngrx/store";
import { Mission } from "../../models/mission.model";
import { MissionInstance } from "../../models/mission-instance.model";
import { GetAvailableSoldiers } from "../../models/get-available-soldier.model";
import { SoldierMission } from "../../models/soldier-mission.model";
import { AssignmentValidation } from "../../models/auto-assign/assignment-validation.model";

export const getMissions = createAction(
    '[Missions] Get Missions'
);
export const getMissionsSuccess = createAction(
    '[Missions] Get Missions Success',
    props<{ missions: Array<Mission> }>()
);
export const getMissionsFailure = createAction(
    '[Missions] Get Missions Failure'
);

export const updateMission = createAction(
    '[Missions] Update Mission',
    props<{ mission: Mission }>()
);
export const updateMissionSuccess = createAction(
    '[Missions] Update Mission Success',
    props<{ mission: Mission }>()
);
export const updateMissionFailure = createAction(
    '[Missions] Update Mission Failure'
);

export const addMission = createAction(
    '[Missions] Add Mission',
    props<{ mission: Mission }>()
);
export const addMissionSuccess = createAction(
    '[Missions] Add Mission Success',
    props<{ mission: Mission }>()
);
export const addMissionFailure = createAction(
    '[Missions] Add Mission Failure'
);

export const deleteMission = createAction(
    '[Missions] Delete Mission',
    props<{ missionId: number }>()
);
export const deleteMissionSuccess = createAction(
    '[Missions] Delete Mission Success',
    props<{ missionId: number }>()
);
export const deleteMissionFailure = createAction(
    '[Missions] Delete Mission Failure'
);

export const getMissionInstances = createAction(
    '[Missions] Get Mission Instances',
    props<{ missionId: number }>()
);
export const getMissionInstancesSuccess = createAction(
    '[Missions] Get Mission Instances Success',
    props<{ missionInstances: Array<MissionInstance> }>()
);
export const getMissionInstancesFailure = createAction(
    '[Missions] Get Mission Instances Failure'
);

export const getAvailableSoldiers = createAction(
    '[Missions] Get Available Soldiers',
    props<{ missionInstanceId: number, soldiersPool?: Array<number> }>()
);
export const getAvailableSoldiersSuccess = createAction(
    '[Missions] Get Available Soldiers Success',
    props<{ availableSoldiers: Array<GetAvailableSoldiers> }>()
);
export const getAvailableSoldiersFailure = createAction(
    '[Missions] Get Available Soldiers Failure'
);

export const assignSoldiersToMissionInstance = createAction(
    '[Missions] Assign Soldiers To Mission Instance',
    props<{ soldiers: Array<SoldierMission> }>()
);
export const assignSoldiersToMissionInstanceSuccess = createAction(
    '[Missions] Assign Soldiers To Mission Instance Success'
);
export const assignSoldiersToMissionInstanceFailure = createAction(
    '[Missions] Assign Soldiers To Mission Instance Failure'
);

export const getMissionInstancesInRange = createAction(
    '[Missions] Get Mission Instances In Range',
    props<{ from: Date, to: Date, fullDay?: boolean, unassignedOnly?: boolean }>()
);
export const getMissionInstancesInRangeSuccess = createAction(
    '[Missions] Get Mission Instances In Range Success',
    props<{ missionInstances: Array<MissionInstance> }>()
);
export const getMissionInstancesInRangeFailure = createAction(
    '[Missions] Get Mission Instances In Range Failure'
);

export const autoAssign = createAction(
    '[Missions] Auto Assign',
    props<{ from: Date, to: Date, soldiers?: Array<number>, missions?: Array<number> }>()
);
export const autoAssignSuccess = createAction(
    '[Missions] Auto Assign Success',
    props<{ candidate: AssignmentValidation }>()
);
export const autoAssignFailure = createAction(
    '[Missions] Auto Assign Failure'
);

export const getAllCandidates = createAction(
    '[Missions] Get All Candidates'
);
export const getAllCandidatesSuccess = createAction(
    '[Missions] Get All Candidates Success',
    props<{ candidates: Array<string> }>()
);
export const getAllCandidatesFailure = createAction(
    '[Missions] Get All Candidates Failure'
);

export const getCandidate = createAction(
    '[Missions] Get Candidate',
    props<{ guid: string }>()
);
export const getCandidateSuccess = createAction(
    '[Missions] Get Candidate Success',
    props<{ candidate: AssignmentValidation }>()
);
export const getCandidateFailure = createAction(
    '[Missions] Get Candidate Failure'
);

export const acceptAutoAssignCandidate = createAction(
    '[Missions] Accept Auto Assign Candidate',
    props<{ guid: string }>()
);
export const acceptAutoAssignCandidateSuccess = createAction(
    '[Missions] Accept Auto Assign Candidate Success',
    props<{ missions: Array<Mission> }>()
);
export const acceptAutoAssignCandidateFailure = createAction(
    '[Missions] Accept Auto Assign Candidate Failure'
);

export const removeSoldierFromMissionInstance = createAction(
    '[Missions] Remove Soldier From Mission Instance',
    props<{ soldierId: number, missionInstanceId: number }>()
);
export const removeSoldierFromMissionInstanceSuccess = createAction(
    '[Missions] Remove Soldier From Mission Instance Success',
    props<{ missions: Array<Mission> }>()
);
export const removeSoldierFromMissionInstanceFailure = createAction(
    '[Missions] Remove Soldier From Mission Instance Failure'
);