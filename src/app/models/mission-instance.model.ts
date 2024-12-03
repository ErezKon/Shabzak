import { SoldierMission } from "./soldier-mission.model";

export interface MissionInstance {
    id: number;
    fromTime: string;
    toTime: string;
    isFilled: boolean;
    soldierMissions?: Array<SoldierMission>;
}