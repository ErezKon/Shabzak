import { CandidateMissionInstance } from "./candidate-mission-instance.model";

export interface AssignmentValidation {
    id: string;
    from: Date;
    to: Date;
    validInstancesCount: number;
    totalInstancesCount: number;
    validInstances: Map<string, Array<CandidateMissionInstance>>;
    faultyInstances: Map<string, Array<CandidateMissionInstance>>;
}