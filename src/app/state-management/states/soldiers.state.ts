import { Soldier } from "../../models/soldier.model";

export interface SoldiersState {
    soldiers: Array<Soldier>;
}
  
export const initialSoldiersState: SoldiersState = {
    soldiers: []
};