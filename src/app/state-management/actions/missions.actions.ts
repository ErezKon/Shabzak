import { createAction, props } from "@ngrx/store";
import { Mission } from "../../models/mission.model";

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