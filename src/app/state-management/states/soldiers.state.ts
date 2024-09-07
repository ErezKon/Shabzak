import { Soldier } from "../../models/soldier.model";

export interface SoldiersState {
    loading: boolean;
    soldiers: Array<Soldier>;
}
  
export const initialSoldiersState: SoldiersState = {
    loading: false,
    soldiers: []
};