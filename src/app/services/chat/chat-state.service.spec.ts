import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { EMPTY, Observable, Subject } from 'rxjs';
import { ChatDecision, ChatRequestError, ChatStreamEvent } from '../../models/chat/chat.model';
import { UserRole } from '../../models/user-role.enum';
import { User } from '../../models/user.model';
import * as missionActions from '../../state-management/actions/missions.actions';
import * as soldierActions from '../../state-management/actions/soldiers.actions';
import * as userActions from '../../state-management/actions/user.actions';
import { AppState } from '../../state-management/states/app.state';
import { SnackbarService } from '../snackbar.service';
import { ChatApiService } from './chat-api.service';
import {
  CHAT_LABEL_THINKING,
  CHAT_NOTE_APPROVAL_EXPIRED,
  CHAT_NOTE_APPROVAL_GONE,
  CHAT_NOTE_NEW_THREAD,
  CHAT_SNACK_REFRESHED,
  CHAT_SNACK_SESSION_EXPIRED,
  ChatStateService
} from './chat-state.service';
import { ChatStorageService } from './chat-storage.service';

interface FakeCall {
  kind: 'stream' | 'resume';
  threadId: string | null;
  message?: string;
  decisions?: ChatDecision[];
  events: Subject<ChatStreamEvent>;
  unsubscribed: boolean;
}

class FakeChatApi {
  calls: FakeCall[] = [];
  resets: string[] = [];

  stream(threadId: string | null, message: string): Observable<ChatStreamEvent> {
    return this.open({ kind: 'stream', threadId, message });
  }

  resume(threadId: string, decisions: ChatDecision[]): Observable<ChatStreamEvent> {
    return this.open({ kind: 'resume', threadId, decisions });
  }

  reset(threadId: string): Observable<void> {
    this.resets.push(threadId);
    return EMPTY;
  }

  get last(): FakeCall {
    return this.calls[this.calls.length - 1];
  }

  emit(...events: ChatStreamEvent[]): void {
    events.forEach(event => this.last.events.next(event));
  }

  finish(...events: ChatStreamEvent[]): void {
    this.emit(...events, { type: 'done' });
    this.last.events.complete();
  }

  fail(error: ChatRequestError): void {
    this.last.events.error(error);
  }

  private open(call: Omit<FakeCall, 'events' | 'unsubscribed'>): Observable<ChatStreamEvent> {
    const record: FakeCall = { ...call, events: new Subject<ChatStreamEvent>(), unsubscribed: false };
    this.calls.push(record);
    return new Observable<ChatStreamEvent>(subscriber => {
      const subscription = record.events.subscribe(subscriber);
      return () => {
        record.unsubscribed = true;
        subscription.unsubscribe();
      };
    });
  }
}

const ADMIN: User = { id: 2, name: 'hash', role: UserRole.Admin, enabled: true, activated: true, soldierId: 8 };
const OTHER: User = { id: 3, name: 'hash3', role: UserRole.Regular, enabled: true, activated: true, soldierId: 3 };
const ACTIONS = [
  { index: 0, tool: 'request_vacation', title: 'בקשת חופשה', details: ['א'], warnings: [], risk: 'low' as const },
  { index: 1, tool: 'delete_soldier', title: 'מחיקת חייל', details: [], warnings: ['סופי'], risk: 'high' as const }
];
const STORAGE_KEY = 'shabzak.chat.';

function clearChatStorage(): void {
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith(STORAGE_KEY)) {
      sessionStorage.removeItem(key);
    }
  }
}

describe('ChatStateService', () => {
  let api: FakeChatApi;
  let store: MockStore;
  let snackbar: jasmine.SpyObj<SnackbarService>;
  let chat: ChatStateService;

  function setUser(user: User | undefined): void {
    store.setState({ user: { user } });
  }

  function createService(): ChatStateService {
    return new ChatStateService(api as unknown as ChatApiService, store as unknown as Store<AppState>, TestBed.inject(ChatStorageService), snackbar);
  }

  function startConversation(): void {
    chat.send('שלום');
    api.finish({ type: 'thread', threadId: 't-1' }, { type: 'final', message: 'היי', refresh: [] });
  }

  function askForApproval(): void {
    chat.send('תבקש חופשה ותמחק חייל');
    api.finish({ type: 'thread', threadId: 't-1' }, { type: 'approval_required', actions: ACTIONS });
  }

  beforeEach(() => {
    clearChatStorage();
    api = new FakeChatApi();
    snackbar = jasmine.createSpyObj<SnackbarService>('SnackbarService', ['openSnackBar']);
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: { user: { user: ADMIN } } }),
        { provide: ChatApiService, useValue: api },
        { provide: SnackbarService, useValue: snackbar }
      ]
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
    chat = TestBed.inject(ChatStateService);
  });

  afterEach(() => {
    chat.ngOnDestroy();
    clearChatStorage();
  });

  it('streams an answer: thread, status labels, tokens, then the final message', () => {
    expect(chat.send('  מי בשמירה מחר?  ')).toBeTrue();
    expect(api.last).toEqual(jasmine.objectContaining({ kind: 'stream', threadId: null, message: 'מי בשמירה מחר?' }));
    expect(chat.state.streaming).toBeTrue();
    expect(chat.state.statusLabel).toBe(CHAT_LABEL_THINKING);
    expect(chat.state.messages.map(m => [m.role, m.text])).toEqual([['user', 'מי בשמירה מחר?']]);

    api.emit({ type: 'thread', threadId: 't-1' }, { type: 'status', phase: 'tool_start', tool: 'get_schedule', label: 'בודק את לוח השיבוצים…' });
    expect(chat.state.threadId).toBe('t-1');
    expect(chat.state.statusLabel).toBe('בודק את לוח השיבוצים…');

    api.emit({ type: 'token', text: 'מחר ' }, { type: 'token', text: 'בשמירה: אבי' });
    const streaming = chat.state.messages[1];
    expect([streaming.role, streaming.text, streaming.streaming]).toEqual(['assistant', 'מחר בשמירה: אבי', true]);
    expect(chat.state.statusLabel).toBeNull();

    api.finish({ type: 'final', message: '**מחר** בשמירה: אבי', refresh: [] });
    expect(chat.state.streaming).toBeFalse();
    expect(chat.state.messages[1]).toEqual(jasmine.objectContaining({ role: 'assistant', text: '**מחר** בשמירה: אבי' }));
    expect(chat.state.messages[1].streaming).toBeUndefined();
    expect(chat.state.messages[1].interrupted).toBeUndefined();
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(snackbar.openSnackBar).not.toHaveBeenCalled();

    chat.send('ומחרתיים?');
    expect(api.last.threadId).toBe('t-1');
  });

  it('refuses to send an empty or too long message, or while answering', () => {
    expect(chat.send('   ')).toBeFalse();
    expect(chat.send('x'.repeat(2001))).toBeFalse();
    expect(chat.send('x'.repeat(2000))).toBeTrue();
    expect(chat.send('again')).toBeFalse();
    expect(api.calls.length).toBe(1);
  });

  it('shows approval cards, blocks new messages, and resumes with the decisions in order', () => {
    askForApproval();
    expect(chat.state.streaming).toBeFalse();
    const approval = chat.state.messages[1];
    expect(approval.role).toBe('approval');
    expect(approval.approval).toEqual({ actions: ACTIONS, status: 'pending' });
    expect(chat.state.pendingApproval).toEqual({ messageId: approval.id, actions: ACTIONS });
    expect(chat.send('עוד שאלה')).toBeFalse();
    expect(chat.submitDecisions([{ type: 'approve' }])).toBeFalse();

    const decisions: ChatDecision[] = [{ type: 'approve' }, { type: 'reject', message: 'לא עכשיו' }];
    expect(chat.submitDecisions(decisions)).toBeTrue();
    expect(api.last).toEqual(jasmine.objectContaining({ kind: 'resume', threadId: 't-1', decisions }));
    expect(chat.state.pendingApproval).toBeNull();
    expect(chat.state.messages[1].approval).toEqual({ actions: ACTIONS, status: 'submitted', decisions });

    api.finish({ type: 'thread', threadId: 't-1' }, { type: 'final', message: 'בוצע', refresh: ['soldiers', 'vacations'] });
    expect(store.dispatch).toHaveBeenCalledWith(soldierActions.getSoldiers({ reloadCache: true }));
    expect(store.dispatch).toHaveBeenCalledWith(soldierActions.getVacations({ soldierId: 8 }));
    expect(snackbar.openSnackBar).toHaveBeenCalledOnceWith(CHAT_SNACK_REFRESHED);
    expect(chat.state.messages.map(m => m.role)).toEqual(['user', 'approval', 'assistant']);
  });

  it('dispatches the store reloads for every refresh hint of the final event', () => {
    startConversation();
    chat.send('תקבל את ההצעה');
    api.finish({ type: 'thread', threadId: 't-1' }, { type: 'final', message: 'התקבל', refresh: ['missions', 'soldiers', 'candidates', 'users'] });
    expect((store.dispatch as jasmine.Spy).calls.allArgs().map(args => args[0])).toEqual([
      missionActions.getMissions(),
      soldierActions.getSoldiers({ reloadCache: true }),
      missionActions.getAllCandidates()
    ]);
  });

  it('maps request errors to Hebrew messages and retries the same message', () => {
    chat.send('שאלה');
    api.fail({ status: 429, code: 'rate_limited', message: 'Too many requests.', retryAfterSeconds: 7 });
    expect(chat.state.streaming).toBeFalse();
    expect(chat.state.error).toEqual({ code: 'rate_limited', message: 'שלחת הרבה הודעות בזמן קצר. אפשר לנסות שוב בעוד 7 שניות.', action: 'retry' });
    expect(chat.state.messages[0].failed).toBeTrue();

    chat.retry();
    expect(api.calls.length).toBe(2);
    expect(api.last.message).toBe('שאלה');
    expect(chat.state.error).toBeNull();
    expect(chat.state.messages.length).toBe(1);
    expect(chat.state.messages[0].failed).toBeUndefined();

    api.fail({ status: 0, code: 'network', message: '' });
    expect(chat.state.error).toEqual({ code: 'network', message: 'אין חיבור לשירות העוזר. בדוק את החיבור ונסה שוב.', action: 'retry' });
  });

  it('keeps the partial answer of an in-stream error and shows the agent detail', () => {
    chat.send('שאלה');
    api.emit({ type: 'thread', threadId: 't-1' }, { type: 'token', text: 'חלק מה' });
    api.finish({ type: 'error', code: 'upstream_error', message: 'The LLM endpoint is unreachable.' });
    expect(chat.state.messages[1]).toEqual({ id: jasmine.any(String), role: 'assistant', text: 'חלק מה', createdAt: jasmine.any(Number), interrupted: true });
    expect(chat.state.error).toEqual({
      code: 'upstream_error',
      message: 'שירות העוזר לא זמין כרגע. נסה שוב מאוחר יותר.',
      detail: 'The LLM endpoint is unreachable.',
      action: 'retry'
    });
    expect(chat.state.messages[0].failed).toBeUndefined();
  });

  it('treats a stream that ends without an answer as a dropped connection', () => {
    chat.send('שאלה');
    api.emit({ type: 'thread', threadId: 't-1' });
    api.last.events.complete();
    expect(chat.state.streaming).toBeFalse();
    expect(chat.state.error?.code).toBe('network');
  });

  it('starts a new thread transparently when the agent no longer knows the thread', () => {
    startConversation();
    chat.send('ועוד שאלה');
    api.fail({ status: 404, code: 'thread_not_found', message: 'Unknown conversation.' });
    expect(api.calls.length).toBe(3);
    expect(api.last).toEqual(jasmine.objectContaining({ kind: 'stream', threadId: null, message: 'ועוד שאלה' }));
    expect(chat.state.messages.map(m => m.role)).toEqual(['user', 'assistant', 'note', 'user']);
    expect(chat.state.messages[2].text).toBe(CHAT_NOTE_NEW_THREAD);
    expect(chat.state.error).toBeNull();
    api.finish({ type: 'thread', threadId: 't-2' }, { type: 'final', message: 'תשובה', refresh: [] });
    expect(chat.state.threadId).toBe('t-2');
  });

  it('expires the approval when the thread is gone or no longer waits for it', () => {
    askForApproval();
    chat.submitDecisions([{ type: 'approve' }, { type: 'approve' }]);
    api.fail({ status: 404, code: 'thread_not_found', message: '' });
    expect(chat.state.messages[1].approval?.status).toBe('expired');
    expect(chat.state.messages[2]).toEqual(jasmine.objectContaining({ role: 'note', text: CHAT_NOTE_APPROVAL_EXPIRED }));
    expect(chat.state.pendingApproval).toBeNull();
    expect(chat.state.threadId).toBeNull();
    expect(store.dispatch).not.toHaveBeenCalled();

    askForApproval();
    chat.submitDecisions([{ type: 'reject' }, { type: 'reject' }]);
    api.fail({ status: 400, code: 'bad_request', message: 'There is no pending approval in this conversation.' });
    expect(chat.state.messages[4].approval?.status).toBe('expired');
    expect(chat.state.messages[5].text).toBe(CHAT_NOTE_APPROVAL_GONE);
    expect(chat.state.error).toBeNull();
  });

  it('shows the card again for a resume that never reached the agent, and retries it', () => {
    askForApproval();
    const decisions: ChatDecision[] = [{ type: 'approve' }, { type: 'reject' }];
    chat.submitDecisions(decisions);
    api.fail({ status: 0, code: 'network', message: '' });
    expect(chat.state.messages[1].approval?.status).toBe('pending');
    expect(chat.state.pendingApproval?.actions).toEqual(ACTIONS);
    expect(chat.state.error?.action).toBe('retry');
    chat.retry();
    expect(api.last).toEqual(jasmine.objectContaining({ kind: 'resume', decisions }));
  });

  it('refreshes everything, without a retry, when an approved resume fails after the agent started', () => {
    askForApproval();
    chat.submitDecisions([{ type: 'approve' }, { type: 'reject' }]);
    api.emit({ type: 'thread', threadId: 't-1' }, { type: 'status', phase: 'tool_start', tool: 'request_vacation', label: 'x' });
    api.finish({ type: 'error', code: 'internal', message: 'Something went wrong while answering. Try again.' });
    expect(chat.state.error).toEqual(jasmine.objectContaining({ code: 'internal' }));
    expect(chat.state.error?.action).toBeUndefined();
    expect(store.dispatch).toHaveBeenCalledWith(missionActions.getMissions());
    expect(store.dispatch).toHaveBeenCalledWith(missionActions.getAllCandidates());
    expect(snackbar.openSnackBar).not.toHaveBeenCalled();
  });

  it('highlights the pending card when the agent says an approval is pending, or offers a new chat', () => {
    askForApproval();
    chat.submitDecisions([{ type: 'approve' }, { type: 'approve' }]);
    api.finish({ type: 'thread', threadId: 't-1' }, { type: 'final', message: 'done', refresh: [] });
    chat.close();
    chat.send('שאלה');
    api.fail({ status: 409, code: 'approval_pending', message: '' });
    expect(chat.state.messages[1].approval?.status).toBe('pending');
    expect(chat.state.pendingApproval?.messageId).toBe(chat.state.messages[1].id);
    expect(chat.state.highlightApproval).toBeTrue();
    expect(chat.state.open).toBeTrue();
    expect(chat.state.messages[3].failed).toBeTrue();

    chat.newChat();
    chat.send('שאלה');
    api.fail({ status: 409, code: 'approval_pending', message: '' });
    expect(chat.state.error?.action).toBe('new_chat');
  });

  it('logs out on 401 with a message', () => {
    chat.send('שאלה');
    api.fail({ status: 401, code: 'unauthorized', message: 'The session is invalid or has expired.' });
    expect(snackbar.openSnackBar).toHaveBeenCalledWith(CHAT_SNACK_SESSION_EXPIRED);
    expect(store.dispatch).toHaveBeenCalledWith(userActions.logout());
  });

  it('stops the answer: aborts the request and keeps the partial text as interrupted', () => {
    chat.send('שאלה');
    api.emit({ type: 'thread', threadId: 't-1' }, { type: 'token', text: 'התחלה' });
    chat.stop();
    expect(api.last.unsubscribed).toBeTrue();
    expect(chat.state.streaming).toBeFalse();
    expect(chat.state.messages[1]).toEqual(jasmine.objectContaining({ text: 'התחלה', interrupted: true }));
    expect(chat.state.messages[1].streaming).toBeUndefined();
    api.emit({ type: 'token', text: 'מאוחר מדי' });
    expect(chat.state.messages[1].text).toBe('התחלה');

    chat.send('שאלה 2');
    api.emit({ type: 'thread', threadId: 't-1' });
    chat.stop();
    expect(chat.state.messages.length).toBe(3);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('refreshes everything after stopping an approved resume', () => {
    askForApproval();
    chat.submitDecisions([{ type: 'reject' }, { type: 'approve' }]);
    chat.stop();
    expect(store.dispatch).toHaveBeenCalledWith(missionActions.getMissions());
  });

  it('marks answers that arrive while the panel is closed as unread', () => {
    chat.send('שאלה');
    api.finish({ type: 'thread', threadId: 't-1' }, { type: 'final', message: 'תשובה', refresh: [] });
    expect(chat.state.unread).toBeTrue();
    chat.open();
    expect(chat.state.unread).toBeFalse();
    chat.send('עוד');
    api.finish({ type: 'thread', threadId: 't-1' }, { type: 'final', message: 'תשובה', refresh: [] });
    expect(chat.state.unread).toBeFalse();
  });

  it("restores the user's conversation after a reload, with the pending approval", () => {
    startConversation();
    askForApproval();
    const before = chat.state;
    chat.ngOnDestroy();

    chat = createService();
    expect(chat.state.threadId).toBe('t-1');
    expect(chat.state.messages).toEqual(before.messages);
    expect(chat.state.pendingApproval).toEqual(before.pendingApproval);
    chat.submitDecisions([{ type: 'approve' }, { type: 'approve' }]);
    expect(api.last).toEqual(jasmine.objectContaining({ kind: 'resume', threadId: 't-1' }));
  });

  it('marks an answer that was streaming during the reload as interrupted', () => {
    chat.send('שאלה');
    api.emit({ type: 'thread', threadId: 't-1' }, { type: 'token', text: 'חצי תשובה' });
    chat['persist']();
    chat.ngOnDestroy();

    chat = createService();
    expect(chat.state.streaming).toBeFalse();
    expect(chat.state.messages[1]).toEqual(jasmine.objectContaining({ text: 'חצי תשובה', interrupted: true }));
    expect(chat.state.messages[1].streaming).toBeUndefined();
  });

  it('clears the conversation and resets the thread on logout and when another user logs in', () => {
    startConversation();
    expect(sessionStorage.getItem(STORAGE_KEY + ADMIN.id)).not.toBeNull();
    setUser(undefined);
    expect(chat.state.messages).toEqual([]);
    expect(chat.state.threadId).toBeNull();
    expect(api.resets).toEqual(['t-1']);
    expect(sessionStorage.getItem(STORAGE_KEY + ADMIN.id)).toBeNull();

    setUser(ADMIN);
    startConversation();
    setUser(OTHER);
    expect(chat.state.messages).toEqual([]);
    expect(sessionStorage.getItem(STORAGE_KEY + ADMIN.id)).toBeNull();
    expect(chat.send('שאלה')).toBeTrue();
  });

  it('keeps the conversation when only the role of the same user changes', () => {
    startConversation();
    setUser({ ...ADMIN, role: UserRole.SuperAdmin });
    expect(chat.state.messages.length).toBe(2);
    expect(api.resets).toEqual([]);
  });

  it('does not chat without a logged-in, activated user', () => {
    setUser({ ...ADMIN, activated: false });
    expect(chat.send('שאלה')).toBeFalse();
    expect(api.calls.length).toBe(0);
  });

  it('starts a new chat: aborts the answer, resets the thread and clears the storage', () => {
    startConversation();
    chat.open();
    chat.send('שאלה');
    chat.newChat();
    expect(api.last.unsubscribed).toBeTrue();
    expect(api.resets).toEqual(['t-1']);
    expect(chat.state.messages).toEqual([]);
    expect(chat.state.open).toBeTrue();
    expect(sessionStorage.getItem(STORAGE_KEY + ADMIN.id)).toBeNull();
  });
});
