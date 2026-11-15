import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, NgZone, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { select, Store } from '@ngrx/store';
import { CHAT_MAX_MESSAGE_CHARS, ChatDecision, ChatState, INITIAL_CHAT_STATE } from '../../../models/chat/chat.model';
import { UserRole } from '../../../models/user-role.enum';
import { ChatStateService } from '../../../services/chat/chat-state.service';
import { selectUser } from '../../../state-management/selectors/user.selector';
import { AppState } from '../../../state-management/states/app.state';
import { BaseComponent } from '../../../utils/base-component/base-component.component';
import { ChatApprovalCardComponent } from '../chat-approval-card/chat-approval-card.component';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { chatVisible$ } from '../chat-visibility';

export const CHAT_SUGGESTIONS_REGULAR = ['מי בשמירה היום?', 'מתי המשימה הבאה שלי?', 'כמה שעות עשיתי החודש?'];
export const CHAT_SUGGESTIONS_ADMIN = ['מי בשמירה היום?', 'צור שבצ"ק לשבוע הבא', 'הצע מחליף לחייל'];
const EMPTY_TEXT = 'אני העוזר של שבצ"ק, ואני עוזר רק בנושאי המערכת: לוח השיבוצים, משימות ומשמרות, חיילים, חופשות והנתונים שלך.';
const EMPTY_TEXT_ADMIN_SUFFIX = ' אפשר גם לבקש ממני שינויים, ואני אבצע אותם רק אחרי שתאשר.';
const NEAR_BOTTOM_PX = 80;

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ChatMessageComponent,
    ChatApprovalCardComponent
  ],
  templateUrl: './chat-panel.component.html',
  styleUrl: './chat-panel.component.scss'
})
export class ChatPanelComponent extends BaseComponent {
  readonly maxChars = CHAT_MAX_MESSAGE_CHARS;
  state: ChatState = INITIAL_CHAT_STATE;
  visible = false;
  isAdmin = false;
  draft = '';

  @ViewChild('scroller') private scroller?: ElementRef<HTMLElement>;
  @ViewChild('input') private input?: ElementRef<HTMLTextAreaElement>;

  private readonly isBrowser: boolean;
  private stickToBottom = true;

  constructor(
    private chat: ChatStateService,
    store: Store<AppState>,
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: object) {
    super();
    this.isBrowser = isPlatformBrowser(platformId);
    this.addSub(chatVisible$(store).subscribe(visible => this.visible = visible));
    this.addSub(store.pipe(select(selectUser)).subscribe(user => this.isAdmin = (user?.role ?? UserRole.Regular) >= UserRole.Admin));
    this.addSub(chat.state$.subscribe(state => this.onState(state)));
  }

  get suggestions(): string[] {
    return this.isAdmin ? CHAT_SUGGESTIONS_ADMIN : CHAT_SUGGESTIONS_REGULAR;
  }

  get emptyText(): string {
    return this.isAdmin ? EMPTY_TEXT + EMPTY_TEXT_ADMIN_SUFFIX : EMPTY_TEXT;
  }

  get length(): number {
    return this.draft.trim().length;
  }

  get canSend(): boolean {
    return this.length > 0 && this.length <= this.maxChars && !this.state.streaming && !this.state.pendingApproval;
  }

  get placeholder(): string {
    if (this.state.pendingApproval) {
      return 'יש לאשר או לדחות את הפעולה לפני שממשיכים';
    }
    return this.state.streaming ? 'העוזר עונה…' : 'כתוב הודעה…';
  }

  send(): void {
    if (this.canSend && this.chat.send(this.draft)) {
      this.draft = '';
      this.stickToBottom = true;
    }
  }

  onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (keyboard.shiftKey || keyboard.isComposing) {
      return;
    }
    event.preventDefault();
    this.send();
  }

  useSuggestion(text: string): void {
    if (this.chat.send(text)) {
      this.stickToBottom = true;
    }
  }

  decide(decisions: ChatDecision[]): void {
    this.chat.submitDecisions(decisions);
  }

  stop(): void {
    this.chat.stop();
  }

  retry(): void {
    this.chat.retry();
  }

  newChat(): void {
    this.chat.newChat();
    this.draft = '';
    this.later(() => this.focusInput());
  }

  dismissError(): void {
    this.chat.dismissError();
  }

  close(): void {
    this.chat.close();
  }

  private onState(state: ChatState): void {
    const previous = this.state;
    const changed = state.messages !== previous.messages || state.statusLabel !== previous.statusLabel || state.error !== previous.error;
    this.state = state;
    if (state.open && !previous.open) {
      this.stickToBottom = true;
      this.later(() => {
        this.scrollToBottom();
        this.focusInput();
      });
    } else if (state.open && changed && this.stickToBottom) {
      this.later(() => this.scrollToBottom());
    }
    if (state.highlightApproval && !previous.highlightApproval) {
      this.later(() => this.scroller?.nativeElement.querySelector('app-chat-approval-card .highlight')?.scrollIntoView({ block: 'nearest' }));
    }
  }

  onScroll(): void {
    this.stickToBottom = this.isNearBottom();
  }

  private isNearBottom(): boolean {
    const element = this.scroller?.nativeElement;
    return !element || element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_PX;
  }

  private scrollToBottom(): void {
    const element = this.scroller?.nativeElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  private focusInput(): void {
    const element = this.input?.nativeElement;
    if (element && !element.disabled) {
      element.focus();
    }
  }

  private later(action: () => void): void {
    if (this.isBrowser) {
      this.zone.runOutsideAngular(() => setTimeout(action));
    }
  }
}
