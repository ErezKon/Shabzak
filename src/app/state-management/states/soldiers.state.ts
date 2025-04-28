import { Soldier } from "../../models/soldier.model";
import { Vacation } from "../../models/vacation.model";

export interface SoldiersState {
    loading: boolean;
    soldiers: Array<Soldier>;
    vacations: Array<Vacation>;
}
  
export const initialSoldiersState: SoldiersState = {
    loading: false,
    soldiers: [],
    vacations: []
};