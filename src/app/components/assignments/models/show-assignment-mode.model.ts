export enum AssignmentMode {
    ByDay = 1,
    BySoldier = 2,
    ByMission = 3
}

export const assignmentModeTextual = new Map<AssignmentMode, string>([
    [AssignmentMode.ByDay, 'הצג שיבוץ לפי יום'],
    [AssignmentMode.BySoldier, 'הצג שיבוץ לפי חייל'],
    [AssignmentMode.ByMission, 'הצג שיבוץ לפי משימה'],
])