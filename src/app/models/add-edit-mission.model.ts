import { MissionPosition } from "./mission-position.model";

export interface AddEditMission {
    id: number;
    name: string;
    description: string;
    duration: number;
    soldiersRequired: number;
    commandersRequired: number;
    fromTime?: string;
    toTime?: string;
    isSpecial: boolean;
    actualHours?: number;
    requiredRestAfter?: number;
    positions: Array<MissionPosition>;
    
}