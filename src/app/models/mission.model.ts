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
    toTime?: string;
    isSpecial: boolean;
    requiredInstances: boolean;
    actualHours?: number;
    requiredRestAfter?: number;

    missionInstances: Array<MissionInstance>;
    positions: Array<MissionPosition>;
}