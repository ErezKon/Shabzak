import { Mission } from "../../../models/mission.model";
import { MissionAddEditMode } from "./mission-add-edit-mode.enum";

export interface AddEditMissionModel {
    mission: Partial<Mission>;
    mode: MissionAddEditMode;
}