import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, distinctUntilChanged, map, Subscription } from 'rxjs';
import {
  CHAT_MAX_MESSAGE_CHARS,
  ChatApproval,
  ChatApprovalAction,
  ChatDecision,
  ChatError,
  ChatErrorCode,
  ChatMessage,
  ChatMessageRole,
  ChatRefreshHint,
  ChatRequestError,
  ChatState,
  ChatStreamEvent,
  INITIAL_CHAT_STATE
} from '../../models/chat/chat.model';
import { UserRole } from '../../models/user-role.enum';
import { User } from '../../models/user.model';
import * as userActions from '../../state-management/actions/user.actions';
import { selectUser } from '../../state-management/selectors/user.selector';
import { AppState } from '../../state-management/states/app.state';
import { SnackbarService } from '../snackbar.service';
import { ChatApiService } from './chat-api.service';
import { hasApproval } from './chat-decisions';
import { CHAT_FALLBACK_REFRESH, chatRefreshActions } from './chat-refresh';
import { ChatStorageService } from './chat-storage.service';

export const CHAT_LABEL_THINKING = 'חושב…';
export const CHAT_SNACK_REFRESHED = 'הנתונים עודכנו';
export const CHAT_SNACK_SESSION_EXPIRED = 'פג תוקף ההתחברות. יש להתחבר מחדש.';
export const CHAT_NOTE_NEW_THREAD = 'השיחה הקודמת כבר לא זמינה בשרת, ולכן נפתחה שיחה חדשה. העוזר לא זוכר את ההודעות שלמעלה.';
export const CHAT_NOTE_APPROVAL_EXPIRED = 'השיחה הסתיימה בשרת, ולכן הפעולה שחיכתה לאישור לא בוצעה. אפשר לבקש אותה שוב.';
export const CHAT_NOTE_APPROVAL_GONE = 'הבקשה לאישור כבר לא ממתינה בשרת, ולכן ההחלטות לא נשלחו.';
const LABEL_WORKING = 'עובד על זה…';
const APPROVAL_NOT_SHOWN = 'יש בשיחה הזו פעולה שממתינה לאישור, אבל היא לא מוצגת כאן. התחל שיחה חדשה כדי להמשיך.';

export const CHAT_ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  unauthorized: CHAT_SNACK_SESSION_EXPIRED,
  forbidden: 'אין הרשאה לבקשה הזו.',
  approval_pending: 'יש פעולה שממתינה לאישור. אשר או דחה אותה לפני שממשיכים.',
  thread_busy: 'העוזר עדיין עונה על ההודעה הקודמת. נסה שוב בעוד רגע.',
  thread_not_found: 'השיחה כבר לא זמינה בשרת. התחל שיחה חדשה.',
  rate_limited: 'שלחת הרבה הודעות בזמן קצר. נסה שוב בעוד רגע.',
  bad_request: 'העוזר לא קיבל את הבקשה.',
  not_found: 'שירות העוזר לא נמצא בכתובת שהוגדרה.',
  upstream_error: 'שירות העוזר לא זמין כרגע. נסה שוב מאוחר יותר.',
  internal: 'משהו השתבש בעוזר. נסה שוב.',
  network: 'אין חיבור לשירות העוזר. בדוק את החיבור ונסה שוב.'
};

const RETRYABLE: ReadonlySet<ChatErrorCode> = new Set<ChatErrorCode>(['thread_busy', 'rate_limited', 'upstream_error', 'internal', 'network']);
const WITH_DETAIL: ReadonlySet<ChatErrorCode> = new Set<ChatErrorCode>(['forbidden', 'bad_request', 'upstream_error', 'internal']);

export interface ChatUser {
  id: number;
  role: UserRole;
  soldierId?: number;
}

type TurnRequest =
  | { kind: 'stream'; message: string; userMessageId: string }
  | { kind: 'resume'; decisions: ChatDecision[]; approvalMessageId: string };

interface Turn {
  request: TurnRequest;
  subscription?: Subscription;
  opened: boolean;
  ended: boolean;
  assistantId: string | null;
  restarted: boolean;
}

function toChatUser(user: User | undefined): ChatUser | null {
  return user && user.enabled && user.activated ? { id: user.id, role: user.role, soldierId: user.soldierId } : null;
}

function sameUser(a: ChatUser | null, b: ChatUser | null): boolean {
  return a?.id === b?.id && a?.role === b?.role && a?.soldierId === b?.soldierId;
}

function waitText(seconds: number): string {
  return seconds === 1 ? 'שנייה' : `${seconds} שניות`;
}

function lastIndexOf(messages: readonly ChatMessage[], predicate: (message: ChatMessage) => boolean): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (predicate(messages[i])) {
      return i;
    }
  }
  return -1;
}

@Injectable({
  providedIn: 'root'
})
export class ChatStateService implements OnDestroy {
  private readonly stateSubject = new BehaviorSubject<ChatState>(INITIAL_CHAT_STATE);
  readonly state$ = this.stateSubject.asObservable();

  private chatUser: ChatUser | null = null;
  private turn: Turn | null = null;
  private failedRequest: TurnRequest | null = null;
  private idCounter = 0;
  private readonly userSubscription: Subscription;

  constructor(
    private api: ChatApiService,
    private store: Store<AppState>,
    private storage: ChatStorageService,
    private snackbar: SnackbarService) {
    this.userSubscription = this.store.pipe(
      select(selectUser),
      map(toChatUser),
      distinctUntilChanged(sameUser)
    ).subscribe(user => this.onUser(user));
  }

  get state(): ChatState {
    return this.stateSubject.value;
  }

  get user(): ChatUser | null {
    return this.chatUser;
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.cancelTurn();
  }

  open(): void {
    this.patch({ open: true, unread: false });
  }

  close(): void {
    this.patch({ open: false, highlightApproval: false });
  }

  toggle(): void {
    if (this.state.open) {
      this.close();
    } else {
      this.open();
    }
  }

  send(text: string): boolean {
    const message = text.trim();
    const state = this.state;
    if (!this.chatUser || !message || message.length > CHAT_MAX_MESSAGE_CHARS || state.streaming || state.pendingApproval) {
      return false;
    }
    const userMessage = this.createMessage('user', message);
    this.patch({ messages: [...state.messages, userMessage], error: null, highlightApproval: false });
    this.startTurn({ kind: 'stream', message, userMessageId: userMessage.id });
    return true;
  }

  submitDecisions(decisions: ChatDecision[]): boolean {
    const state = this.state;
    const pending = state.pendingApproval;
    if (!this.chatUser || !pending || !state.threadId || state.streaming || decisions.length !== pending.actions.length) {
      return false;
    }
    this.updateApproval(pending.messageId, approval => ({ ...approval, status: 'submitted', decisions }));
    this.patch({ pendingApproval: null, error: null, highlightApproval: false });
    this.startTurn({ kind: 'resume', decisions, approvalMessageId: pending.messageId });
    return true;
  }

  stop(): void {
    const turn = this.turn;
    if (!turn) {
      return;
    }
    this.cancelTurn();
    this.finishAssistant(turn, undefined, true);
    this.patch({ streaming: false, statusLabel: null });
    if (turn.request.kind === 'resume' && hasApproval(turn.request.decisions)) {
      this.refresh(CHAT_FALLBACK_REFRESH, false);
    }
    this.persist();
  }

  retry(): void {
    const request = this.failedRequest;
    if (!request || this.state.streaming) {
      return;
    }
    if (request.kind === 'stream') {
      this.updateMessage(request.userMessageId, message => {
        const retried = { ...message };
        delete retried.failed;
        return retried;
      });
      this.startTurn(request);
    } else if (this.state.pendingApproval?.messageId === request.approvalMessageId) {
      this.submitDecisions(request.decisions);
    }
  }

  newChat(): void {
    const threadId = this.state.threadId;
    this.cancelTurn();
    this.failedRequest = null;
    this.stateSubject.next({ ...INITIAL_CHAT_STATE, open: this.state.open });
    if (this.chatUser) {
      this.storage.clear(this.chatUser.id);
    }
    if (threadId) {
      this.resetThread(threadId);
    }
  }

  dismissError(): void {
    this.patch({ error: null });
  }

  private onUser(user: ChatUser | null): void {
    const previous = this.chatUser;
    this.chatUser = user;
    if (previous && previous.id === user?.id) {
      return;
    }
    if (previous) {
      const threadId = this.state.threadId;
      this.cancelTurn();
      this.failedRequest = null;
      this.storage.clear(previous.id);
      this.stateSubject.next(INITIAL_CHAT_STATE);
      if (threadId) {
        this.resetThread(threadId);
      }
    }
    if (user) {
      this.restore(user.id);
    }
  }

  private restore(userId: number): void {
    const stored = this.storage.load(userId);
    if (!stored) {
      return;
    }
    const messages: ChatMessage[] = [];
    for (const message of stored.messages) {
      if (message.role === 'assistant' && message.streaming) {
        if (message.text) {
          const interrupted: ChatMessage = { ...message, interrupted: true };
          delete interrupted.streaming;
          messages.push(interrupted);
        }
      } else {
        messages.push(message);
      }
    }
    const lastPending = stored.threadId ? lastIndexOf(messages, message => message.approval?.status === 'pending') : -1;
    const restored = messages.map((message, i) =>
      message.approval?.status === 'pending' && i !== lastPending
        ? { ...message, approval: { ...message.approval, status: 'expired' as const } }
        : message);
    const pending = lastPending >= 0 ? restored[lastPending] : undefined;
    this.patch({
      threadId: stored.threadId,
      messages: restored,
      pendingApproval: pending?.approval ? { messageId: pending.id, actions: pending.approval.actions } : null
    });
  }

  private startTurn(request: TurnRequest, restarted = false): void {
    const threadId = this.state.threadId;
    const turn: Turn = { request, opened: false, ended: false, assistantId: null, restarted };
    this.turn = turn;
    this.failedRequest = null;
    this.patch({ streaming: true, statusLabel: CHAT_LABEL_THINKING, error: null });
    this.persist();
    const events$ = request.kind === 'stream'
      ? this.api.stream(threadId, request.message)
      : this.api.resume(threadId ?? '', request.decisions);
    turn.subscription = events$.subscribe({
      next: event => this.onEvent(turn, event),
      error: (error: ChatRequestError) => this.onTurnError(turn, error),
      complete: () => this.onTurnComplete(turn)
    });
  }

  private onEvent(turn: Turn, event: ChatStreamEvent): void {
    if (this.turn !== turn) {
      return;
    }
    switch (event.type) {
      case 'thread':
        turn.opened = true;
        if (event.threadId !== this.state.threadId) {
          this.patch({ threadId: event.threadId });
          this.persist();
        }
        return;
      case 'status':
        this.patch({ statusLabel: event.label || LABEL_WORKING });
        return;
      case 'token':
        this.appendToken(turn, event.text);
        return;
      case 'approval_required':
        turn.ended = true;
        this.finishAssistant(turn);
        if (event.actions.length === 0) {
          this.fail(turn, { status: 200, code: 'internal', message: '' });
          return;
        }
        this.addApproval(event.actions);
        return;
      case 'final':
        turn.ended = true;
        this.finishAssistant(turn, event.message);
        this.markUnread();
        this.persist();
        this.refresh(event.refresh, true);
        return;
      case 'error':
        turn.ended = true;
        this.finishAssistant(turn, undefined, true);
        this.fail(turn, { status: 200, code: event.code, message: event.message });
        return;
      case 'done':
        if (turn.ended) {
          this.endTurn(turn);
        } else {
          this.finishAssistant(turn, undefined, true);
          this.fail(turn, { status: 0, code: 'network', message: '' });
        }
        return;
    }
  }

  private onTurnError(turn: Turn, error: ChatRequestError): void {
    if (this.turn !== turn) {
      return;
    }
    this.finishAssistant(turn, undefined, true);
    this.fail(turn, error);
  }

  private onTurnComplete(turn: Turn): void {
    if (this.turn !== turn) {
      return;
    }
    if (turn.ended) {
      this.endTurn(turn);
      return;
    }
    this.finishAssistant(turn, undefined, true);
    this.fail(turn, { status: 0, code: 'network', message: '' });
  }

  private endTurn(turn: Turn): void {
    if (this.turn === turn) {
      this.turn = null;
    }
    this.patch({ streaming: false, statusLabel: null });
    this.persist();
  }

  private fail(turn: Turn, error: ChatRequestError): void {
    if (this.turn === turn) {
      this.turn = null;
    }
    this.patch({ streaming: false, statusLabel: null });
    const request = turn.request;
    const beforeStart = !turn.opened;
    if (error.code === 'unauthorized') {
      this.sessionExpired();
      return;
    }
    if (error.code === 'approval_pending') {
      this.showPendingApproval(request);
      return;
    }
    if (beforeStart && error.code === 'thread_not_found') {
      this.threadGone(turn);
      return;
    }
    if (request.kind === 'resume') {
      if (beforeStart && (error.code === 'bad_request' || error.code === 'forbidden')) {
        if (error.code === 'forbidden') {
          this.patch({ threadId: null });
        }
        this.expireApproval(request.approvalMessageId, CHAT_NOTE_APPROVAL_GONE);
        return;
      }
      if (beforeStart) {
        this.reopenApproval(request.approvalMessageId);
      } else if (hasApproval(request.decisions)) {
        this.refresh(CHAT_FALLBACK_REFRESH, false);
      }
    } else {
      if (beforeStart) {
        this.updateMessage(request.userMessageId, message => ({ ...message, failed: true }));
      }
      if (error.code === 'forbidden') {
        this.patch({ threadId: null });
      }
    }
    const retryable = RETRYABLE.has(error.code) && (request.kind === 'stream' || beforeStart);
    this.failedRequest = retryable ? request : null;
    this.patch({ error: this.describe(error, retryable) });
    this.markUnread();
    this.persist();
  }

  private describe(error: ChatRequestError, retryable: boolean): ChatError {
    const message = error.code === 'rate_limited' && error.retryAfterSeconds
      ? `שלחת הרבה הודעות בזמן קצר. אפשר לנסות שוב בעוד ${waitText(error.retryAfterSeconds)}.`
      : CHAT_ERROR_MESSAGES[error.code];
    const described: ChatError = { code: error.code, message };
    if (WITH_DETAIL.has(error.code) && error.message) {
      described.detail = error.message;
    }
    if (retryable) {
      described.action = 'retry';
    }
    return described;
  }

  private sessionExpired(): void {
    this.snackbar.openSnackBar(CHAT_SNACK_SESSION_EXPIRED);
    this.store.dispatch(userActions.logout());
  }

  private showPendingApproval(request: TurnRequest): void {
    if (request.kind === 'stream') {
      this.updateMessage(request.userMessageId, message => ({ ...message, failed: true }));
    }
    let pending = this.state.pendingApproval;
    if (!pending) {
      const index = lastIndexOf(this.state.messages, message => message.role === 'approval');
      const last = index >= 0 ? this.state.messages[index] : undefined;
      if (last?.approval) {
        this.updateApproval(last.id, approval => ({ actions: approval.actions, status: 'pending' }));
        pending = { messageId: last.id, actions: last.approval.actions };
      }
    }
    if (pending) {
      this.patch({
        pendingApproval: pending,
        highlightApproval: true,
        open: true,
        unread: false,
        error: { code: 'approval_pending', message: CHAT_ERROR_MESSAGES.approval_pending }
      });
    } else {
      this.patch({ error: { code: 'approval_pending', message: APPROVAL_NOT_SHOWN, action: 'new_chat' } });
    }
    this.persist();
  }

  private threadGone(turn: Turn): void {
    const request = turn.request;
    if (request.kind === 'resume') {
      this.patch({ threadId: null });
      this.expireApproval(request.approvalMessageId, CHAT_NOTE_APPROVAL_EXPIRED);
      return;
    }
    if (!turn.restarted) {
      this.patch({ threadId: null });
      this.insertNoteBefore(request.userMessageId, CHAT_NOTE_NEW_THREAD);
      this.startTurn(request, true);
      return;
    }
    this.updateMessage(request.userMessageId, message => ({ ...message, failed: true }));
    this.patch({ threadId: null, error: this.describe({ status: 404, code: 'thread_not_found', message: '' }, false) });
    this.persist();
  }

  private appendToken(turn: Turn, text: string): void {
    const messages = this.state.messages;
    if (turn.assistantId === null) {
      const message: ChatMessage = { ...this.createMessage('assistant', text), streaming: true };
      turn.assistantId = message.id;
      this.patch({ messages: [...messages, message], statusLabel: null });
      return;
    }
    const id = turn.assistantId;
    this.patch({
      messages: messages.map(message => (message.id === id ? { ...message, text: message.text + text } : message)),
      statusLabel: null
    });
  }

  private finishAssistant(turn: Turn, finalText?: string, interrupted = false): void {
    const id = turn.assistantId;
    turn.assistantId = null;
    const messages = this.state.messages;
    const current = id === null ? undefined : messages.find(message => message.id === id);
    if (!current) {
      if (finalText) {
        this.patch({ messages: [...messages, this.createMessage('assistant', finalText)] });
      }
      return;
    }
    const text = finalText || current.text;
    if (!text) {
      this.patch({ messages: messages.filter(message => message.id !== id) });
      return;
    }
    const finished: ChatMessage = { ...current, text };
    delete finished.streaming;
    if (interrupted) {
      finished.interrupted = true;
    }
    this.patch({ messages: messages.map(message => (message.id === id ? finished : message)) });
  }

  private addApproval(actions: ChatApprovalAction[]): void {
    const message: ChatMessage = { ...this.createMessage('approval', ''), approval: { actions, status: 'pending' } };
    this.patch({ messages: [...this.state.messages, message], pendingApproval: { messageId: message.id, actions } });
    this.markUnread();
    this.persist();
  }

  private reopenApproval(messageId: string): void {
    const message = this.state.messages.find(m => m.id === messageId);
    if (!message?.approval) {
      return;
    }
    this.updateApproval(messageId, approval => ({ actions: approval.actions, status: 'pending' }));
    this.patch({ pendingApproval: { messageId, actions: message.approval.actions } });
  }

  private expireApproval(messageId: string, note: string): void {
    this.updateApproval(messageId, approval => ({ ...approval, status: 'expired' }));
    this.patch({
      pendingApproval: this.state.pendingApproval?.messageId === messageId ? null : this.state.pendingApproval,
      messages: [...this.state.messages, this.createMessage('note', note)]
    });
    this.markUnread();
    this.persist();
  }

  private insertNoteBefore(messageId: string, text: string): void {
    const messages = [...this.state.messages];
    const index = messages.findIndex(message => message.id === messageId);
    messages.splice(index >= 0 ? index : messages.length, 0, this.createMessage('note', text));
    this.patch({ messages });
  }

  private updateMessage(id: string, update: (message: ChatMessage) => ChatMessage): void {
    this.patch({ messages: this.state.messages.map(message => (message.id === id ? update(message) : message)) });
  }

  private updateApproval(id: string, update: (approval: ChatApproval) => ChatApproval): void {
    this.updateMessage(id, message => (message.approval ? { ...message, approval: update(message.approval) } : message));
  }

  private refresh(hints: readonly ChatRefreshHint[], notify: boolean): void {
    if (hints.length === 0) {
      return;
    }
    for (const action of chatRefreshActions(hints, this.chatUser?.soldierId)) {
      this.store.dispatch(action);
    }
    if (notify) {
      this.snackbar.openSnackBar(CHAT_SNACK_REFRESHED);
    }
  }

  private markUnread(): void {
    if (!this.state.open) {
      this.patch({ unread: true });
    }
  }

  private resetThread(threadId: string): void {
    this.api.reset(threadId).subscribe({ error: () => undefined });
  }

  private cancelTurn(): void {
    const turn = this.turn;
    this.turn = null;
    turn?.subscription?.unsubscribe();
  }

  private persist(): void {
    if (!this.chatUser) {
      return;
    }
    const { threadId, messages } = this.state;
    if (!threadId && messages.length === 0) {
      this.storage.clear(this.chatUser.id);
    } else {
      this.storage.save(this.chatUser.id, { threadId, messages });
    }
  }

  private createMessage(role: ChatMessageRole, text: string): ChatMessage {
    this.idCounter++;
    return {
      id: `${Date.now().toString(36)}-${this.idCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      role,
      text,
      createdAt: Date.now()
    };
  }

  private patch(changes: Partial<ChatState>): void {
    this.stateSubject.next({ ...this.state, ...changes });
  }
}
