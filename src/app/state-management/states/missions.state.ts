import { Mission } from "../../models/mission.model";

export interface MissionsState {
    missions: Array<Mission>;
}
  
export const initialMissionsState: MissionsState = {
    missions: []
};