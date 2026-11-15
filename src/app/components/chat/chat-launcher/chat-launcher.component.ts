import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ChatState } from '../../../models/chat/chat.model';
import { ChatStateService } from '../../../services/chat/chat-state.service';
import { AppState } from '../../../state-management/states/app.state';
import { chatVisible$ } from '../chat-visibility';

@Component({
  selector: 'app-chat-launcher',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatBadgeModule, MatTooltipModule],
  templateUrl: './chat-launcher.component.html',
  styleUrl: './chat-launcher.component.scss'
})
export class ChatLauncherComponent {
  readonly visible$: Observable<boolean>;
  readonly state$: Observable<ChatState>;

  constructor(private chat: ChatStateService, store: Store<AppState>) {
    this.visible$ = chatVisible$(store);
    this.state$ = chat.state$;
  }

  label(state: ChatState): string {
    if (state.open) {
      return 'סגור את העוזר';
    }
    if (state.pendingApproval) {
      return 'פתח את העוזר: פעולה ממתינה לאישור';
    }
    return state.unread ? 'פתח את העוזר: יש תשובה חדשה' : 'פתח את העוזר של שבצ"ק';
  }

  toggle(): void {
    this.chat.toggle();
  }
}
