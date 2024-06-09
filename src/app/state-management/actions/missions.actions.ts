import { createAction, props } from "@ngrx/store";
import { Mission } from "../../models/mission.model";
import { MissionInstance } from "../../models/mission-instance.model";
import { GetAvailableSoldiers } from "../../models/get-available-soldier.model";

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