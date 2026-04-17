import { AssignmentValidation } from './assignment-validation.model';
import { InteractiveAutoAssignStatus } from './interactive-auto-assign-status';
import { PendingInstanceView } from './pending-instance-view.model';

export interface InteractiveAutoAssignStep {
    sessionId: string;
    status: InteractiveAutoAssignStatus;
    currentIndex: number;
    totalInstancesCount: number;
    pending?: PendingInstanceView;
    result?: AssignmentValidation;
}
