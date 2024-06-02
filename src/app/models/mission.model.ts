import { MissionInstance } from "./mission-instance.model";
import { MissionPosition } from "./mission-position.model";

export interface Mission {
    id: number;
    name: string;
    description: string;
    duration: number;
    soldiersRequired: number;
    commandersRequired: number;
    fromTime?: string;
    toTIme?: string;
    isSpecial: boolean;

    missionInstances: Array<MissionInstance>;
    positions: Array<MissionPosition>;
}