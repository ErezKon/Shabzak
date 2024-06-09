import { GetAvailableSoldiers } from "../../models/get-available-soldier.model";
import { MissionInstance } from "../../models/mission-instance.model";
import { Mission } from "../../models/mission.model";

export interface MissionsState {
    missions: Array<Mission>;
    missionInstances: Array<MissionInstance>;
    availableSoldiers: Array<GetAvailableSoldiers>
}
  
export const initialMissionsState: MissionsState = {
    missions: [],
    missionInstances: [],
    availableSoldiers: []
};