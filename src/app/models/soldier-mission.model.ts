import { MissionInstance } from "./mission-instance.model";
import { MissionPosition } from "./mission-position.model";
import { Soldier } from "./soldier.model";

export interface SoldierMission {
    id: number;
    soldier: Soldier;
    mission: MissionInstance;
    missionPosition: MissionPosition;
}