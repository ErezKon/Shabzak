import { AssignmentMode } from "./show-assignment-mode.model";

export interface AssignmentsFilter {
    showMode: AssignmentMode;
    from?: Date;
    to?: Date;
}