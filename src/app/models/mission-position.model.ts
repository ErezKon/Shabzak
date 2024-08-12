import { Position } from "./position.enum";

export interface MissionPosition {
    id: number;
    position: Position;
    count: number;
}

export interface AssignedMissionPosition extends MissionPosition {
    assigned: number;
}