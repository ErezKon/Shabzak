import { AssignmentValidation } from "../../models/auto-assign/assignment-validation.model";
import { InteractiveAutoAssignStep } from "../../models/auto-assign/interactive-auto-assign-step.model";
import { GetAvailableSoldiers } from "../../models/get-available-soldier.model";
import { MissionInstance } from "../../models/mission-instance.model";
import { Mission } from "../../models/mission.model";
import { ReplacementCandidate } from "../../models/replacement-candidate.model";

export interface MissionsState {
    loading: boolean;
    missions: Array<Mission>;
    missionInstances: Array<MissionInstance>;
    availableSoldiers: Array<GetAvailableSoldiers>;
    fetchingAvailableSoldiers: boolean;
    autoAssigning: boolean;
    candidateAssignments: AssignmentValidation;
    candidatesIds: Array<string>;
    candidatesList: Array<AssignmentValidation>;
    interactiveSession: InteractiveAutoAssignStep | null;
    interactiveLoading: boolean;
    replacementCandidates: Array<ReplacementCandidate>;
    fetchingReplacementCandidates: boolean;
}

export const initialMissionsState: MissionsState = {
    loading: false,
    missions: [],
    missionInstances: [],
    availableSoldiers: [],
    fetchingAvailableSoldiers: false,
    autoAssigning: false,
    candidateAssignments: {} as AssignmentValidation,
    candidatesIds: [],
    candidatesList: [],
    interactiveSession: null,
    interactiveLoading: false,
    replacementCandidates: [],
    fetchingReplacementCandidates: false
};