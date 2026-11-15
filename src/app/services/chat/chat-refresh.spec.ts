import * as missionActions from '../../state-management/actions/missions.actions';
import * as soldierActions from '../../state-management/actions/soldiers.actions';
import { CHAT_FALLBACK_REFRESH, chatRefreshActions } from './chat-refresh';

describe('chatRefreshActions', () => {
  it('maps missions to getMissions and candidates to getAllCandidates', () => {
    expect(chatRefreshActions(['missions'])).toEqual([missionActions.getMissions()]);
    expect(chatRefreshActions(['candidates'])).toEqual([missionActions.getAllCandidates()]);
  });

  it('reloads the soldiers (with the API cache) once for soldiers and vacations', () => {
    const reload = soldierActions.getSoldiers({ reloadCache: true });
    expect(chatRefreshActions(['soldiers'])).toEqual([reload]);
    expect(chatRefreshActions(['vacations'])).toEqual([reload]);
    expect(chatRefreshActions(['soldiers', 'vacations'])).toEqual([reload]);
  });

  it("also reloads the user's own vacation list for vacations when the user is a soldier", () => {
    expect(chatRefreshActions(['vacations'], 8)).toEqual([
      soldierActions.getSoldiers({ reloadCache: true }),
      soldierActions.getVacations({ soldierId: 8 })
    ]);
    expect(chatRefreshActions(['soldiers'], 8)).toEqual([soldierActions.getSoldiers({ reloadCache: true })]);
  });

  it('has nothing to reload for users (the UI keeps no account list) or for no hints', () => {
    expect(chatRefreshActions(['users'])).toEqual([]);
    expect(chatRefreshActions([])).toEqual([]);
  });

  it('maps every hint in a fixed order, without duplicates', () => {
    expect(chatRefreshActions(['candidates', 'users', 'soldiers', 'missions', 'missions'])).toEqual([
      missionActions.getMissions(),
      soldierActions.getSoldiers({ reloadCache: true }),
      missionActions.getAllCandidates()
    ]);
  });

  it('refreshes everything the UI shows after an approved change whose result is unknown', () => {
    expect(chatRefreshActions(CHAT_FALLBACK_REFRESH).map(action => action.type)).toEqual([
      missionActions.getMissions.type,
      soldierActions.getSoldiers.type,
      missionActions.getAllCandidates.type
    ]);
  });
});
