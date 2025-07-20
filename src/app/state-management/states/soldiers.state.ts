import { SoldierSummary } from "../../models/soldier-summary.model";
import { Soldier } from "../../models/soldier.model";
import { Vacation } from "../../models/vacation.model";

export interface SoldiersState {
    loading: boolean;
    soldiers: Array<Soldier>;
    vacations: Array<Vacation>;
    soldierSummary: SoldierSummary;
}
  
export const initialSoldiersState: SoldiersState = {
    loading: false,
    soldiers: [],
    vacations: [],
    soldierSummary: {} as SoldierSummary
};