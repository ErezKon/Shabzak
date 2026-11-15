import { Action } from '@ngrx/store';
import { ChatRefreshHint } from '../../models/chat/chat.model';
import * as missionActions from '../../state-management/actions/missions.actions';
import * as soldierActions from '../../state-management/actions/soldiers.actions';

export const CHAT_FALLBACK_REFRESH: readonly ChatRefreshHint[] = ['missions', 'soldiers', 'vacations', 'candidates'];

export function chatRefreshActions(hints: readonly ChatRefreshHint[], ownSoldierId?: number): Action[] {
    const wanted = new Set(hints);
    const actions: Action[] = [];
    if (wanted.has('missions')) {
        actions.push(missionActions.getMissions());
    }
    if (wanted.has('soldiers') || wanted.has('vacations')) {
        actions.push(soldierActions.getSoldiers({ reloadCache: true }));
    }
    if (wanted.has('vacations') && ownSoldierId) {
        actions.push(soldierActions.getVacations({ soldierId: ownSoldierId }));
    }
    if (wanted.has('candidates')) {
        actions.push(missionActions.getAllCandidates());
    }
    return actions;
}
