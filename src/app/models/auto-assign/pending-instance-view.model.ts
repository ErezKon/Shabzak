import { CandidateMissionInstance } from './candidate-mission-instance.model';

export interface PendingInstanceView {
    instance: CandidateMissionInstance;
    maxSelections: number;
    commandersRequired: number;
    soldiersRequired: number;
}
