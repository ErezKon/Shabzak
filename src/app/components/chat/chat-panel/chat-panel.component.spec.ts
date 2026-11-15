import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';
import { ChatState, INITIAL_CHAT_STATE } from '../../../models/chat/chat.model';
import { UserRole } from '../../../models/user-role.enum';
import { ChatStateService } from '../../../services/chat/chat-state.service';
import { selectUrl } from '../../../state-management/selectors/router.selector';
import { selectUser } from '../../../state-management/selectors/user.selector';
import { CHAT_SUGGESTIONS_ADMIN, CHAT_SUGGESTIONS_REGULAR, ChatPanelComponent } from './chat-panel.component';

const ADMIN = { id: 2, name: 'h', role: UserRole.Admin, enabled: true, activated: true };
const REGULAR = { id: 3, name: 'h', role: UserRole.Regular, enabled: true, activated: true };

describe('ChatPanelComponent', () => {
  let fixture: ComponentFixture<ChatPanelComponent>;
  let store: MockStore;
  let state$: BehaviorSubject<ChatState>;
  let chat: jasmine.SpyObj<ChatStateService>;

  function render(state: Partial<ChatState>): HTMLElement {
    state$.next({ ...INITIAL_CHAT_STATE, open: true, ...state });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function type(element: HTMLElement, text: string): HTMLTextAreaElement {
    const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = text;
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    return textarea;
  }

  beforeEach(() => {
    state$ = new BehaviorSubject<ChatState>(INITIAL_CHAT_STATE);
    chat = jasmine.createSpyObj<ChatStateService>('ChatStateService', ['send', 'submitDecisions', 'stop', 'retry', 'newChat', 'dismissError', 'close'], { state$: state$.asObservable() });
    chat.send.and.returnValue(true);
    TestBed.configureTestingModule({
      imports: [ChatPanelComponent],
      providers: [
        provideNoopAnimations(),
        provideMockStore({ selectors: [{ selector: selectUser, value: ADMIN }, { selector: selectUrl, value: '/assignments' }] }),
        { provide: ChatStateService, useValue: chat }
      ]
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ChatPanelComponent);
  });

  afterEach(() => store.resetSelectors());

  it('renders nothing while closed, on /login, or without a logged-in user', () => {
    let element = render({ open: false });
    expect(element.querySelector('.chat-panel')).toBeNull();
    element = render({ open: true });
    expect(element.querySelector('.chat-panel')).not.toBeNull();
    store.overrideSelector(selectUrl, '/login');
    store.refreshState();
    fixture.detectChanges();
    expect(element.querySelector('.chat-panel')).toBeNull();
    store.overrideSelector(selectUrl, '/personal-page');
    store.overrideSelector(selectUser, { ...ADMIN, activated: false });
    store.refreshState();
    fixture.detectChanges();
    expect(element.querySelector('.chat-panel')).toBeNull();
  });

  it('is an RTL panel with the title, and an empty state with the admin suggestions', () => {
    const element = render({});
    const panel = element.querySelector('.chat-panel') as HTMLElement;
    expect(panel.getAttribute('dir')).toBe('rtl');
    expect(element.querySelector('.chat-title')?.textContent).toContain('העוזר של שבצ"ק');
    expect(element.querySelector('.chat-empty-text')?.textContent).toContain('לוח השיבוצים, משימות ומשמרות, חיילים, חופשות');
    const chips = Array.from(element.querySelectorAll('.chat-suggestion')).map(e => e.textContent?.trim());
    expect(chips).toEqual(CHAT_SUGGESTIONS_ADMIN);
    (element.querySelectorAll('.chat-suggestion')[1] as HTMLButtonElement).click();
    expect(chat.send).toHaveBeenCalledWith('צור שבצ"ק לשבוע הבא');
  });

  it('offers self-service suggestions to regular users', () => {
    store.overrideSelector(selectUser, REGULAR);
    store.refreshState();
    const element = render({});
    const chips = Array.from(element.querySelectorAll('.chat-suggestion')).map(e => e.textContent?.trim());
    expect(chips).toEqual(CHAT_SUGGESTIONS_REGULAR);
    expect(element.querySelector('.chat-empty-text')?.textContent).not.toContain('שינויים');
  });

  it('sends on Enter, adds a line on Shift+Enter, and counts characters', () => {
    const element = render({});
    const textarea = type(element, 'שורה ראשונה');
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }));
    expect(chat.send).not.toHaveBeenCalled();
    expect(element.querySelector('.chat-counter')?.textContent?.trim()).toBe('11/2000');
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(chat.send).toHaveBeenCalledWith('שורה ראשונה');
    fixture.detectChanges();
    expect(fixture.componentInstance.draft).toBe('');
  });

  it('blocks sending over the limit and shows Stop while streaming', () => {
    let element = render({});
    type(element, 'x'.repeat(2001));
    expect((element.querySelector('.send') as HTMLButtonElement).disabled).toBeTrue();
    expect(element.querySelector('.chat-counter')?.classList).toContain('over');
    element = render({ streaming: true, statusLabel: 'בודק את לוח השיבוצים…' });
    expect(element.querySelector('.send')).toBeNull();
    expect(element.querySelector('.chat-status')?.textContent).toContain('בודק את לוח השיבוצים…');
    (element.querySelector('.stop') as HTMLButtonElement).click();
    expect(chat.stop).toHaveBeenCalled();
  });

  it('disables the input while an approval is pending and forwards the decisions', async () => {
    const actions = [{ index: 0, tool: 'request_vacation', title: 'בקשת חופשה', details: [], warnings: [], risk: 'low' as const }];
    const element = render({
      threadId: 't-1',
      messages: [{ id: 'a1', role: 'approval', text: '', createdAt: 1, approval: { actions, status: 'pending' } }],
      pendingApproval: { messageId: 'a1', actions }
    });
    await fixture.whenStable();
    fixture.detectChanges();
    const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.disabled).toBeTrue();
    expect(textarea.placeholder).toContain('יש לאשר או לדחות');
    (element.querySelector('.approve-toggle button') as HTMLButtonElement).click();
    fixture.detectChanges();
    (element.querySelector('.submit-decisions') as HTMLButtonElement).click();
    expect(chat.submitDecisions).toHaveBeenCalledWith([{ type: 'approve' }]);
  });

  it('shows errors with the offered action, and closes on Escape', () => {
    const element = render({ error: { code: 'network', message: 'אין חיבור לשירות העוזר.', action: 'retry' } });
    expect(element.querySelector('.chat-error')?.textContent).toContain('אין חיבור לשירות העוזר.');
    (element.querySelector('.retry') as HTMLButtonElement).click();
    expect(chat.retry).toHaveBeenCalled();
    render({ error: { code: 'approval_pending', message: 'x', action: 'new_chat' } });
    (element.querySelector('.error-new-chat') as HTMLButtonElement).click();
    expect(chat.newChat).toHaveBeenCalled();
    element.querySelector('.chat-panel')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(chat.close).toHaveBeenCalled();
  });

  it('renders the messages: user text as text, assistant markdown as sanitized HTML', () => {
    const element = render({
      messages: [
        { id: 'u', role: 'user', text: '<b>לא HTML</b>', createdAt: 1 },
        { id: 'a', role: 'assistant', text: '**מודגש** <img src=x onerror=alert(1)>', createdAt: 2 },
        { id: 'n', role: 'note', text: 'נפתחה שיחה חדשה', createdAt: 3 }
      ]
    });
    const user = element.querySelector('.bubble.user .text') as HTMLElement;
    expect(user.textContent).toBe('<b>לא HTML</b>');
    expect(user.querySelector('b')).toBeNull();
    const assistant = element.querySelector('.bubble.assistant .markdown') as HTMLElement;
    expect(assistant.querySelector('strong')?.textContent).toBe('מודגש');
    expect(assistant.querySelector('img')).toBeNull();
    expect(assistant.getAttribute('dir')).toBe('auto');
    expect(element.querySelector('.note')?.textContent).toContain('נפתחה שיחה חדשה');
    expect(element.querySelector('.chat-body')?.getAttribute('aria-live')).toBe('polite');
  });
});
