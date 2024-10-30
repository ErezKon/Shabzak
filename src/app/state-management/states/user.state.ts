import { User } from "../../models/user.model";

export interface UsersState {
    user?: User;
}
  
export const initialUsersState: UsersState = {
    user: undefined
};