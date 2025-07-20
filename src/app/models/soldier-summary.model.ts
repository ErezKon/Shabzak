import { SoldierMissionBreakdown } from "./soldier-mission-breakdown.model";

export interface SoldierSummary {
    totalMissions: number;
    totalHours: number;
    missionBreakdown: Array<SoldierMissionBreakdown>;
}