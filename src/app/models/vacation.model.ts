import { VacationRequestStatus } from "./vacation-request-stats.enum";

export interface Vacation {
    id: number;
    from: Date;
    to: Date;
    approved: VacationRequestStatus;
}