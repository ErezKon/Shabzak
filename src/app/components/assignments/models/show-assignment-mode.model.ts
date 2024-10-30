export enum AssignmentMode {
    ByDay,
    BySoldier,
    ByMission
}

export const assignmentModeTextual = new Map<AssignmentMode, string>([
    [AssignmentMode.ByDay, 'הצג שיבוץ לפי יום'],
    [AssignmentMode.BySoldier, 'הצג שיבוץ לפי חייל'],
    [AssignmentMode.ByMission, 'הצג שיבוץ לפי משימה'],
])