import { MissionPosition } from "./mission-position.model";

export interface AddEditMission {
    id: number;
    name: string;
    description: string;
    duration: number;
    soldiersRequired: number;
    commandersRequired: number;
    fromTime?: string;
    toTIme?: string;
    isSpecial: boolean;
    positions: Array<MissionPosition>;
    
}