import { emptyChoices, hasApproval, setAllChoices, toChatDecisions } from './chat-decisions';

describe('chat decisions', () => {
  it('needs a choice for every action', () => {
    expect(toChatDecisions([])).toBeNull();
    expect(toChatDecisions(emptyChoices(2))).toBeNull();
    expect(toChatDecisions([{ choice: 'approve', reason: '' }, { choice: null, reason: '' }])).toBeNull();
  });

  it('keeps the order of the actions', () => {
    expect(toChatDecisions([
      { choice: 'reject', reason: '' },
      { choice: 'approve', reason: 'ignored' },
      { choice: 'reject', reason: 'not now' }
    ])).toEqual([{ type: 'reject' }, { type: 'approve' }, { type: 'reject', message: 'not now' }]);
  });

  it('trims the reject reason, drops an empty one and caps it at 500 characters', () => {
    expect(toChatDecisions([{ choice: 'reject', reason: '   ' }])).toEqual([{ type: 'reject' }]);
    expect(toChatDecisions([{ choice: 'reject', reason: '  לא לשבוע הזה  ' }])).toEqual([{ type: 'reject', message: 'לא לשבוע הזה' }]);
    const decision = toChatDecisions([{ choice: 'reject', reason: 'x'.repeat(600) }])![0];
    expect(decision.type === 'reject' && decision.message?.length).toBe(500);
  });

  it('sets every action at once and keeps the typed reasons', () => {
    const choices = setAllChoices([{ choice: null, reason: 'a' }, { choice: 'approve', reason: '' }], 'reject');
    expect(choices).toEqual([{ choice: 'reject', reason: 'a' }, { choice: 'reject', reason: '' }]);
    expect(toChatDecisions(choices)).toEqual([{ type: 'reject', message: 'a' }, { type: 'reject' }]);
    expect(toChatDecisions(setAllChoices(emptyChoices(2), 'approve'))).toEqual([{ type: 'approve' }, { type: 'approve' }]);
  });

  it('tells whether any action was approved', () => {
    expect(hasApproval([{ type: 'reject' }, { type: 'approve' }])).toBeTrue();
    expect(hasApproval([{ type: 'reject', message: 'no' }])).toBeFalse();
  });
});
