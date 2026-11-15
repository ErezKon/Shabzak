import { CHAT_MAX_REJECT_REASON_CHARS, ChatDecision } from '../../models/chat/chat.model';

export type ApprovalChoice = 'approve' | 'reject';

export interface ApprovalChoiceState {
    choice: ApprovalChoice | null;
    reason: string;
}

export function emptyChoices(count: number): ApprovalChoiceState[] {
    return Array.from({ length: count }, () => ({ choice: null, reason: '' }));
}

export function setAllChoices(choices: readonly ApprovalChoiceState[], choice: ApprovalChoice): ApprovalChoiceState[] {
    return choices.map(state => ({ ...state, choice }));
}

export function toChatDecisions(choices: readonly ApprovalChoiceState[]): ChatDecision[] | null {
    if (choices.length === 0 || choices.some(state => state.choice === null)) {
        return null;
    }
    return choices.map(state => {
        if (state.choice === 'approve') {
            return { type: 'approve' };
        }
        const reason = state.reason.trim().slice(0, CHAT_MAX_REJECT_REASON_CHARS);
        return reason ? { type: 'reject', message: reason } : { type: 'reject' };
    });
}

export function hasApproval(decisions: readonly ChatDecision[]): boolean {
    return decisions.some(decision => decision.type === 'approve');
}
