import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';
import { ChatState, INITIAL_CHAT_STATE } from '../../../models/chat/chat.model';
import { UserRole } from '../../../models/user-role.enum';
import { ChatStateService } from '../../../services/chat/chat-state.service';
import { selectUrl } from '../../../state-management/selectors/router.selector';
import { selectUser } from '../../../state-management/selectors/user.selector';
import { ChatLauncherComponent } from './chat-launcher.component';

const USER = { id: 3, name: 'h', role: UserRole.Regular, enabled: true, activated: true };
const ACTION = { index: 0, tool: 't', title: 'x', details: [], warnings: [], risk: 'low' as const };

describe('ChatLauncherComponent', () => {
  let fixture: ComponentFixture<ChatLauncherComponent>;
  let store: MockStore;
  let state$: BehaviorSubject<ChatState>;
  let chat: jasmine.SpyObj<ChatStateService>;

  function render(state: Partial<ChatState> = {}): HTMLElement {
    state$.next({ ...INITIAL_CHAT_STATE, ...state });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    state$ = new BehaviorSubject<ChatState>(INITIAL_CHAT_STATE);
    chat = jasmine.createSpyObj<ChatStateService>('ChatStateService', ['toggle'], { state$: state$.asObservable() });
    TestBed.configureTestingModule({
      imports: [ChatLauncherComponent],
      providers: [
        provideNoopAnimations(),
        provideMockStore({ selectors: [{ selector: selectUser, value: USER }, { selector: selectUrl, value: '/assignments' }] }),
        { provide: ChatStateService, useValue: chat }
      ]
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ChatLauncherComponent);
  });

  afterEach(() => store.resetSelectors());

  it('shows the button for a logged-in user (also Regular) and toggles the panel', () => {
    const element = render();
    const button = element.querySelector('.chat-launcher-button') as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    expect(chat.toggle).toHaveBeenCalled();
  });

  it('is hidden on /login and when logged out', () => {
    store.overrideSelector(selectUrl, '/login');
    store.refreshState();
    expect(render().querySelector('.chat-launcher-button')).toBeNull();
    store.overrideSelector(selectUrl, '/assignments');
    store.overrideSelector(selectUser, undefined);
    store.refreshState();
    expect(render().querySelector('.chat-launcher-button')).toBeNull();
  });

  it('shows a badge while an approval is pending, and an unread dot otherwise', () => {
    let element = render({ pendingApproval: { messageId: 'a', actions: [ACTION, ACTION] } });
    const badge = element.querySelector('.mat-badge-content') as HTMLElement;
    expect(badge.textContent?.trim()).toBe('2');
    expect(element.querySelector('.mat-badge-hidden')).toBeNull();
    expect(element.querySelector('.chat-launcher-button')?.getAttribute('aria-label')).toContain('פעולה ממתינה לאישור');
    element = render({ unread: true });
    expect(element.querySelector('.unread-dot')).not.toBeNull();
    expect(element.querySelector('.mat-badge-hidden')).not.toBeNull();
    element = render({ unread: true, open: true });
    expect(element.querySelector('.unread-dot')).toBeNull();
  });
});
