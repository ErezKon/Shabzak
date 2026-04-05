import { SoldierMission } from "./soldier-mission.model";

export interface AddMissionInstance {
    id: number;
    date: string;
    endDate?: string;
    from: string;
    to: string;
    soldiers?: Array<SoldierMission>;
}