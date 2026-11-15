import { ActionReducer, combineReducers } from '@ngrx/store';
import { Soldier } from '../../models/soldier.model';
import { UserRole } from '../../models/user-role.enum';
import * as soldierActions from '../actions/soldiers.actions';
import * as userActions from '../actions/user.actions';
import { AppState } from '../states/app.state';
import { initialSoldiersState } from '../states/soldiers.state';
import { appReducers, resetOnLogout } from './index';

describe('resetOnLogout', () => {
  const reducer = resetOnLogout(combineReducers(appReducers) as ActionReducer<AppState>);
  const user = { id: 2, name: 'h', role: UserRole.Admin, enabled: true, activated: true };
  const soldiers = [{ id: 1, name: 'אבי', phone: '0501234567' } as Soldier];

  it("drops the previous user's data and keeps the router state", () => {
    let state = reducer(undefined, userActions.loginSuccess({ user }));
    state = reducer(state, soldierActions.getSoldiersSuccess({ soldiers }));
    const router = { state: { url: '/soldiers' }, navigationId: 3 } as unknown as AppState['router'];
    state = { ...state, router };
    expect(state.user.user).toEqual(user);
    expect(state.soldiers.soldiers).toEqual(soldiers);

    state = reducer(state, userActions.logout());
    expect(state.user.user).toBeUndefined();
    expect(state.soldiers).toEqual(initialSoldiersState);
    expect(state.router).toBe(router);
  });

  it('changes nothing for other actions', () => {
    const state = reducer(undefined, soldierActions.getSoldiersSuccess({ soldiers }));
    expect(reducer(state, userActions.loginFailure()).soldiers.soldiers).toEqual(soldiers);
  });
});
