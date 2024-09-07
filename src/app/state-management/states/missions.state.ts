import { GetAvailableSoldiers } from "../../models/get-available-soldier.model";
import { MissionInstance } from "../../models/mission-instance.model";
import { Mission } from "../../models/mission.model";

export interface MissionsState {
    loading: boolean;
    missions: Array<Mission>;
    missionInstances: Array<MissionInstance>;
    availableSoldiers: Array<GetAvailableSoldiers>
}
  
export const initialMissionsState: MissionsState = {
    loading: false,
    missions: [],
    missionInstances: [],
    availableSoldiers: []
};