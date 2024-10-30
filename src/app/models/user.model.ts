import { Soldier } from './soldier.model';
import { UserRole } from './user-role.enum';

export interface User {
    id: number;
    name: string;
    role: UserRole;
    enabled: boolean;
    activated: boolean;
    soldierId?: number;
    soldier?: Soldier;
}