import { chatErrorCode, parseChatEvent, parseStoredChat, toApprovalAction } from './chat-protocol';

describe('chat protocol', () => {
  it('maps every agent event to a typed event', () => {
    expect(parseChatEvent({ event: 'thread', data: '{"threadId":"t-1"}' })).toEqual({ type: 'thread', threadId: 't-1' });
    expect(parseChatEvent({ event: 'status', data: '{"phase":"tool_start","tool":"get_schedule","label":"בודק…"}' }))
      .toEqual({ type: 'status', phase: 'tool_start', tool: 'get_schedule', label: 'בודק…' });
    expect(parseChatEvent({ event: 'token', data: '{"text":"שלום"}' })).toEqual({ type: 'token', text: 'שלום' });
    expect(parseChatEvent({ event: 'final', data: '{"message":"m","refresh":["missions","bogus","candidates"]}' }))
      .toEqual({ type: 'final', message: 'm', refresh: ['missions', 'candidates'] });
    expect(parseChatEvent({ event: 'error', data: '{"code":"upstream_error","message":"LLM down"}' }))
      .toEqual({ type: 'error', code: 'upstream_error', message: 'LLM down' });
    expect(parseChatEvent({ event: 'done', data: '{}' })).toEqual({ type: 'done' });
  });

  it('builds approval cards with safe defaults and keeps one card per action', () => {
    const event = parseChatEvent({
      event: 'approval_required',
      data: JSON.stringify({ actions: [
        { index: 0, tool: 'request_vacation', title: 'בקשת חופשה', details: ['א', 7], warnings: ['אזהרה'], risk: 'low' },
        { tool: 'delete_soldier', risk: 'extreme' },
        null
      ] })
    });
    expect(event).toEqual({
      type: 'approval_required',
      actions: [
        { index: 0, tool: 'request_vacation', title: 'בקשת חופשה', details: ['א'], warnings: ['אזהרה'], risk: 'low' },
        { index: 1, tool: 'delete_soldier', title: 'delete_soldier', details: [], warnings: [], risk: 'medium' },
        { index: 2, tool: '', title: 'פעולה במערכת', details: [], warnings: [], risk: 'medium' }
      ]
    });
    expect(toApprovalAction({ title: 'x', risk: 'high' }, 3).index).toBe(3);
  });

  it('ignores unknown events, malformed JSON, empty tokens and threads without an ID', () => {
    expect(parseChatEvent({ event: 'mystery', data: '{}' })).toBeNull();
    expect(parseChatEvent({ event: 'token', data: '{not json' })).toBeNull();
    expect(parseChatEvent({ event: 'token', data: '{"text":""}' })).toBeNull();
    expect(parseChatEvent({ event: 'thread', data: '{}' })).toBeNull();
    expect(parseChatEvent({ event: 'status', data: '{"phase":"weird"}' })).toEqual({ type: 'status', phase: 'thinking', tool: undefined, label: '' });
  });

  it('takes the agent error code, or derives one from the HTTP status', () => {
    expect(chatErrorCode('thread_not_found', 404)).toBe('thread_not_found');
    expect(chatErrorCode(undefined, 401)).toBe('unauthorized');
    expect(chatErrorCode('nonsense', 403)).toBe('forbidden');
    expect(chatErrorCode(undefined, 404)).toBe('not_found');
    expect(chatErrorCode(undefined, 409)).toBe('thread_busy');
    expect(chatErrorCode(undefined, 413)).toBe('bad_request');
    expect(chatErrorCode(undefined, 429)).toBe('rate_limited');
    expect(chatErrorCode(undefined, 502)).toBe('upstream_error');
    expect(chatErrorCode(undefined, 500)).toBe('internal');
    expect(chatErrorCode(undefined, 0)).toBe('internal');
  });

  it('restores a stored chat and drops invalid entries', () => {
    const stored = parseStoredChat(JSON.stringify({
      threadId: 't-1',
      messages: [
        { id: 'a', role: 'user', text: 'שאלה', createdAt: 1 },
        { id: 'b', role: 'assistant', text: 'תשובה', createdAt: 2, streaming: true },
        { id: 'c', role: 'approval', text: '', createdAt: 3, approval: { actions: [{ index: 0, title: 'פעולה' }], status: 'pending' } },
        { id: 'd', role: 'approval', text: '', createdAt: 4, approval: { actions: [] } },
        { id: 'e', role: 'hacker', text: '<script>' },
        { role: 'user', text: 'no id' },
        { id: 'f', role: 'approval', text: '', approval: { actions: [{ title: 'x' }], status: 'weird', decisions: [{ type: 'approve' }, { type: 'reject', message: 'לא' }] } }
      ]
    }));
    expect(stored?.threadId).toBe('t-1');
    expect(stored?.messages.map(m => m.id)).toEqual(['a', 'b', 'c', 'f']);
    expect(stored?.messages[1].streaming).toBeTrue();
    expect(stored?.messages[2].approval?.status).toBe('pending');
    expect(stored?.messages[3].approval).toEqual({
      actions: [{ index: 0, tool: '', title: 'x', details: [], warnings: [], risk: 'medium' }],
      status: 'expired',
      decisions: [{ type: 'approve' }, { type: 'reject', message: 'לא' }]
    });
  });

  it('returns null for missing, corrupt or empty stored chats', () => {
    expect(parseStoredChat(null)).toBeNull();
    expect(parseStoredChat('{oops')).toBeNull();
    expect(parseStoredChat('[]')).toBeNull();
    expect(parseStoredChat('{"threadId":"","messages":[]}')).toBeNull();
  });
});
